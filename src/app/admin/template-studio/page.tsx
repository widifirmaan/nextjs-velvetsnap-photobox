'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import type { IStripElement } from '@/models/Template';
import { AdminPageHeader } from '@/app/admin/components';
import { useModel } from '@/lib/ModelContext';
import { useRouter } from 'next/navigation';
import EditorCanvas from './component/EditorCanvas';
import type { EditorCanvasHandle } from './component/EditorCanvas';
import ElementToolbar from './component/ElementToolbar';
import LayerPanel from './component/LayerPanel';
import PropertiesPanel from './component/PropertiesPanel';
import AssetSearch from './component/AssetSearch';
import styles from './page.module.css';

const DEFAULT_CANVAS_W = 600;
const DEFAULT_CANVAS_H = 1800;

interface ISlot {
  x: number; y: number; w: number; h: number;
}

function removeChromaKey(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const MAX_W = 1000;
        const scale = MAX_W / (img.naturalWidth || img.width);
        canvas.width = MAX_W;
        canvas.height = Math.round((img.naturalHeight || img.height) * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(dataUrl); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        const targetR = 0, targetG = 191, targetB = 99;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          const dr = r - targetR, dg = g - targetG, db = b - targetB;
          if (dr * dr + dg * dg + db * db < 1600) d[i + 3] = 0;
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch { resolve(dataUrl); }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function detectTransparentSlots(imgEl: HTMLImageElement): ISlot[] {
  const canvas = document.createElement('canvas');
  const maxDim = 800;
  let w = imgEl.naturalWidth || imgEl.width;
  let h = imgEl.naturalHeight || imgEl.height;
  if (w > maxDim || h > maxDim) {
    const scale = Math.min(maxDim / w, maxDim / h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  ctx.drawImage(imgEl, 0, 0, w, h);
  let imgData;
  try { imgData = ctx.getImageData(0, 0, w, h); } catch { return []; }
  const data = imgData.data;
  const grid: boolean[] = new Array(w * h);
  const targetR = 0, targetG = 191, targetB = 99;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    const dr = data[i] - targetR, dg = data[i + 1] - targetG, db = data[i + 2] - targetB;
    grid[i / 4] = a < 50 || (dr * dr + dg * dg + db * db) < 1600;
  }
  const visited = new Uint8Array(w * h);
  const rects: ISlot[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (!grid[idx] || visited[idx]) continue;
      let minX = x, maxX = x, minY = y, maxY = y;
      const queue: [number, number][] = [[x, y]];
      visited[idx] = 1;
      while (queue.length) {
        const [cx, cy] = queue.shift()!;
        minX = Math.min(minX, cx); maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy); maxY = Math.max(maxY, cy);
        for (const [nx, ny] of [[cx+1, cy], [cx-1, cy], [cx, cy+1], [cx, cy-1]]) {
          if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
            const nidx = ny * w + nx;
            if (grid[nidx] && !visited[nidx]) { visited[nidx] = 1; queue.push([nx, ny]); }
          }
        }
      }
      const rw = maxX - minX + 1, rh = maxY - minY + 1;
      const minSlotPx = 100;
      const origW = imgEl.naturalWidth || imgEl.width;
      const origH = imgEl.naturalHeight || imgEl.height;
      const scaleX = origW / w, scaleY = origH / h;
      if (rw * scaleX >= minSlotPx && rh * scaleY >= minSlotPx) {
        const padX = Math.max(w * 0.05, 16);
        const padY = Math.max(h * 0, 16);
        const px = Math.max(0, minX - padX);
        const py = Math.max(0, minY - padY);
        rects.push({
          x: Math.round((px / w) * 100 * 10) / 10,
          y: Math.round((py / h) * 100 * 10) / 10,
          w: Math.round((Math.min(w - px, rw + padX * 2) / w) * 100 * 10) / 10,
          h: Math.round((Math.min(h - py, rh + padY * 2) / h) * 100 * 10) / 10,
        });
      }
    }
  }
  return rects.sort((a, b) => Math.abs(a.y - b.y) < 3 ? a.x - b.x : a.y - b.y);
}

function generateSlotLayout(slotCount: number): IStripElement[] {
  const marginX = Math.round(DEFAULT_CANVAS_W * 0.055);
  const photoW = DEFAULT_CANVAS_W - marginX * 2;
  const gap = 28;
  const topPad = 40;
  const bottomPad = 320;
  const availH = DEFAULT_CANVAS_H - topPad - bottomPad;
  const photoH = Math.round((availH - (slotCount - 1) * gap) / slotCount);
  const elements: IStripElement[] = [];

  for (let i = 0; i < slotCount; i++) {
    const id = `slot-${i}`;
    elements.push({
      id, type: 'photo-slot',
      x: marginX, y: Math.round(topPad + i * (photoH + gap)),
      width: photoW, height: photoH,
      rotation: 0, zIndex: i, visible: true,
      props: { shape: 'rounded', borderWidth: 2, borderColor: '#ffffff', borderRadius: 8 },
    });
  }

  elements.push({
    id: 'text-velvet',
    type: 'text',
    x: 0,
    y: 1540,
    width: DEFAULT_CANVAS_W,
    height: 50,
    rotation: 0,
    zIndex: slotCount,
    visible: true,
    props: {
      content: 'Velvet Snap',
      fontSize: 40,
      fontFamily: 'Inter',
      color: '#3d2c2c',
      fontWeight: '700',
      textAlign: 'center',
    },
  });

  return elements;
}

export default function StripsStudioPage() {
  const [slotCount, setSlotCount] = useState(3);
  const [elements, setElements] = useState<IStripElement[]>(() => generateSlotLayout(3));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: DEFAULT_CANVAS_W, h: DEFAULT_CANVAS_H });
  const [canvasBg, setCanvasBg] = useState('#ffffff');
  const model = useModel();
  const router = useRouter();
  const loaded = useRef(false);
  const [importProcessing, setImportProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const editorRef = useRef<EditorCanvasHandle>(null);
  const stickerTargetRef = useRef<string | null>(null);
  const bgTargetRef = useRef(false);
  const [stickerTargetId, setStickerTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    if (!editId) return;
    const applyData = (data: any) => {
      setEditingTemplateId(data._id || editId);
      setTemplateName(data.name || '');
      if (data.elements?.length) {
        setElements(data.elements);
      }
      if (data.canvasWidth && data.canvasHeight) {
        setCanvasSize({ w: data.canvasWidth, h: data.canvasHeight });
      }
      if (data.color) {
        setCanvasBg(data.color);
      }
      const slotEls = data.elements?.filter((el: any) => el.id?.startsWith('slot-'));
      if (slotEls?.length) {
        setSlotCount(slotEls.length);
      }
    };
    const raw = sessionStorage.getItem('stripTemplateData');
    if (raw) {
      try {
        const data = JSON.parse(raw);
        applyData(data);
        return;
      } catch (e) {
        console.error('Failed to parse sessionStorage data', e);
      }
    }
    // Fallback: load from API
    fetch('/api/templates')
      .then((r) => r.json())
      .then((res) => {
        if (!res.success) return;
        const matched = res.data.find((t: any) => t._id === editId || t.templateId === editId);
        if (matched) applyData(matched);
      })
      .catch(() => {});
  }, []);

  const selected = elements.find((el) => el.id === selectedId) || null;

  const setSlotLayout = useCallback((n: number) => {
    setSlotCount(n);
    const newSlots = generateSlotLayout(n);
    setElements((prev) => [
      ...newSlots,
      ...prev.filter((el) => !el.id.startsWith('slot-') && el.id !== 'text-velvet'),
    ]);
  }, []);

  const addElement = useCallback((type: IStripElement['type']) => {
    if (type === 'sticker') {
      stickerTargetRef.current = '__new__';
      setStickerTargetId('__new__');
      return;
    }
    const id = uuid();
    const base: IStripElement = {
      id,
      type,
      x: 20,
      y: 20,
      width: type === 'photo-slot' ? 120 : type === 'shape' ? 100 : 150,
      height: type === 'photo-slot' ? 160 : type === 'shape' ? 100 : 40,
      rotation: 0,
      zIndex: elements.length,
      visible: true,
      props: {},
    };
    if (type === 'photo-slot') {
      base.props = { shape: 'rounded', borderWidth: 2, borderColor: '#ffffff', borderRadius: 8 };
    } else if (type === 'text') {
      base.props = { content: 'Type here', fontSize: 24, fontFamily: 'Inter', color: '#3d2c2c', fontWeight: '700', textAlign: 'center' };
    } else if (type === 'shape') {
      base.props = { shapeType: 'rect', fillColor: '#C5D89D', strokeColor: '#9CAB84', strokeWidth: 2, opacity: 1 };
    }
    setElements((prev) => [...prev, base]);
    setSelectedId(id);
  }, [elements.length]);

  const blobToBase64 = async (blobUrl: string): Promise<string> => {
    try {
      const res = await fetch(blobUrl);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch { return blobUrl; }
  };

  const handleSave = async () => {
    if (!templateName.trim()) return;
    setSaving(true);
    setSelectedId(null);
    // Wait a tick for state to propagate before rendering
    await new Promise((r) => setTimeout(r, 50));
    try {
      const thumbnail = editorRef.current?.getThumbnail() || '';
      const rawFrame = await editorRef.current?.getFrameImage();
      const frameImage = rawFrame || '';
      const elementImages: Record<string, string> = {};
      const savedElements = await Promise.all(elements.map(async (el) => {
        const copy = { ...el, props: { ...el.props } };
        const url = copy.props.stickerUrl;
        if (url && (url.startsWith('blob:') || url.startsWith('data:image/'))) {
          const b64 = await blobToBase64(url);
          if (b64 !== url) {
            elementImages[el.id] = b64;
          }
        }
        return copy;
      }));
      const photoSlots = elements.filter((el) => el.type === 'photo-slot').sort((a, b) => a.zIndex - b.zIndex);
      const slotsLayout = photoSlots.map((el) => ({
        x: Math.round((el.x / canvasSize.w) * 1000) / 10,
        y: Math.round((el.y / canvasSize.h) * 1000) / 10,
        w: Math.round((el.width / canvasSize.w) * 1000) / 10,
        h: Math.round((el.height / canvasSize.h) * 1000) / 10,
      }));
      const body: Record<string, any> = {
        type: 'strip',
        name: templateName,
        description: 'Designed in Strips Studio',
        slots: photoSlots.length,
        price: 35000,
        color: canvasBg,
        isActive: true,
        canvasWidth: canvasSize.w,
        canvasHeight: canvasSize.h,
        frameImage,
        slotsLayout,
        thumbnail,
        elementImages: Object.keys(elementImages).length ? elementImages : undefined,
        elements: savedElements,
      };
      let res;
      if (editingTemplateId) {
        res = await fetch(`/api/templates/${editingTemplateId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        body.templateId = `strip-${Date.now()}`;
        res = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }
      const data = await res.json();
      if (data.success) {
        setShowSaveModal(false);
        if (!editingTemplateId) {
          setEditingTemplateId(data.data._id);
        }
      } else {
        alert('Save failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Save failed: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  const openStickerGallery = (elementId: string) => {
    stickerTargetRef.current = elementId;
    setStickerTargetId(elementId);
  };

  const openBgSearch = () => {
    bgTargetRef.current = true;
    setStickerTargetId('__bg__');
  };

  const handleAssetSelect = (url: string) => {
    if (bgTargetRef.current) {
      bgTargetRef.current = false;
      const id = 'bg-image';
      const existing = elements.find((el) => el.id === id);
      if (existing) {
        updateElementProps(id, { stickerUrl: url });
      } else {
        setElements((prev) => [...prev, {
          id, type: 'background',
          x: -60, y: -60,
          width: canvasSize.w + 120,
          height: canvasSize.h + 120,
          rotation: 0,
          zIndex: -1,
          visible: true,
          props: { stickerUrl: url, opacity: 1 },
        }]);
      }
      setSelectedId(id);
      stickerTargetRef.current = null;
      setStickerTargetId(null);
      return;
    }
    const target = stickerTargetRef.current;
    if (!target) return;
    if (target === '__new__') {
      const id = uuid();
      setElements((prev) => [...prev, {
        id,
        type: 'sticker',
        x: 20, y: 20,
        width: 150, height: 150,
        rotation: 0,
        zIndex: prev.length,
        visible: true,
        props: { stickerUrl: url, opacity: 1 },
      }]);
      setSelectedId(id);
    } else {
      setElements((prev) =>
        prev.map((el) =>
          el.id === target ? { ...el, props: { ...el.props, stickerUrl: url } } : el
        )
      );
    }
    stickerTargetRef.current = null;
    setStickerTargetId(null);
  };

  const updateElement = (id: string, patch: Partial<IStripElement>) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...patch } : el)));
  };

  const updateElementProps = (id: string, props: Record<string, any>) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, props: { ...el.props, ...props } } : el))
    );
  };

  const deleteElement = (id: string) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const toggleVisibility = (id: string) => {
    setElements((prev) => prev.map((el) => el.id === id ? { ...el, visible: !el.visible } : el));
  };

  const bringForward = (id: string) => {
    setElements((prev) => {
      const idx = prev.findIndex((el) => el.id === id);
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      const temp = next[idx].zIndex;
      next[idx] = { ...next[idx], zIndex: next[idx + 1].zIndex };
      next[idx + 1] = { ...next[idx + 1], zIndex: temp };
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const sendBackward = (id: string) => {
    setElements((prev) => {
      const idx = prev.findIndex((el) => el.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      const temp = next[idx].zIndex;
      next[idx] = { ...next[idx], zIndex: next[idx - 1].zIndex };
      next[idx - 1] = { ...next[idx - 1], zIndex: temp };
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  return (
    <div className={styles.page}>
      <AdminPageHeader
        title="Strips Studio"
        subtitle="Design your strip template — drag, drop, style"
      />

      <div className={styles.editorLayout}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ElementToolbar onAdd={addElement} />
          <aside style={{
            background: 'var(--clay-bg)', borderRadius: 12, padding: 14,
            border: '1px solid var(--mn-border)',
          }}>
            <button
              onClick={() => setShowSaveModal(true)}
              style={{
                width: '100%', padding: '10px', borderRadius: 8,
                border: 'none', background: 'var(--accent-color, #C5D89D)',
                color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10,
              }}
            >
              💾 Save Template
            </button>
            {model.status === 'downloading' && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 10 }}>AI model downloading... {model.progress}%</div>
            )}
            {model.status === 'ready' && (
              <div style={{ fontSize: 11, color: 'var(--accent-color)', fontWeight: 600, textAlign: 'center', marginBottom: 10 }}>AI ready</div>
            )}
            {model.status === 'error' && (
              <div style={{ fontSize: 11, color: '#e74c3c', textAlign: 'center', marginBottom: 10 }}>AI error — <button onClick={model.retry} style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}>retry</button></div>
            )}
            {model.status === 'checking' && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 10 }}>AI preparing...</div>
            )}
            <h3 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
              Background
            </h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <input
                type="color"
                value={canvasBg}
                onChange={(e) => setCanvasBg(e.target.value)}
                style={{ width: 36, height: 36, padding: 0, border: '1px solid var(--mn-border)', borderRadius: 8, cursor: 'pointer' }}
              />
              <input
                type="text"
                value={canvasBg}
                onChange={(e) => setCanvasBg(e.target.value)}
                placeholder="#ffffff"
                style={{ flex: 1, padding: '6px 8px', borderRadius: 8, border: '1px solid var(--mn-border)', fontSize: 12, fontFamily: 'monospace' }}
              />
            </div>
            <button
              onClick={openBgSearch}
              style={{
                width: '100%', padding: '8px', borderRadius: 8,
                border: '1px solid var(--mn-border)', background: '#fff',
                cursor: 'pointer', fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              🔍 Search Background
            </button>
            {elements.find((el) => el.id === 'bg-image') && (
              <button
                onClick={() => deleteElement('bg-image')}
                style={{
                  width: '100%', marginTop: 6, padding: '4px', borderRadius: 6,
                  border: '1px solid #e74c3c', background: 'none',
                  cursor: 'pointer', fontSize: 11, color: '#e74c3c', fontWeight: 600,
                }}
              >
                ✕ Remove Background Image
              </button>
            )}
          </aside>
          <aside style={{
            background: 'var(--clay-bg)', borderRadius: 12, padding: 14,
            border: '1px solid var(--mn-border)',
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
              Import Frame
            </h3>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImportProcessing(true);
                try {
                  const reader = new FileReader();
                  reader.onloadend = async () => {
                    const dataUrl = reader.result as string;
                    const processed = await removeChromaKey(dataUrl);
                    const img = new window.Image();
                    img.onload = () => {
                      const detected = detectTransparentSlots(img);
                      if (detected.length === 0) { setImportProcessing(false); return; }
                      const cw = DEFAULT_CANVAS_W, ch = DEFAULT_CANVAS_H;
                      const slotEls: IStripElement[] = detected.map((s, i) => ({
                        id: `slot-${i}`,
                        type: 'photo-slot',
                        x: Math.round((s.x / 100) * cw),
                        y: Math.round((s.y / 100) * ch),
                        width: Math.round((s.w / 100) * cw),
                        height: Math.round((s.h / 100) * ch),
                        rotation: 0, zIndex: i, visible: true,
                        props: { shape: 'rounded', borderWidth: 2, borderColor: '#ffffff', borderRadius: 8 },
                      }));
                      setElements((prev) => [
                        ...slotEls,
                        ...prev.filter((el) => el.id.startsWith('text-')),
                      ]);
                      setSlotCount(detected.length);
                      const bgId = 'bg-image';
                      const existingBg = elements.find((el) => el.id === bgId);
                      if (existingBg) {
                        updateElementProps(bgId, { stickerUrl: processed });
                      } else {
                        setElements((prev) => [...prev, {
                          id: bgId, type: 'background',
                          x: -30, y: -30,
                          width: cw + 60, height: ch + 60,
                          rotation: 0, zIndex: -1, visible: true,
                          props: { stickerUrl: processed, opacity: 1 },
                        }]);
                      }
                      setImportProcessing(false);
                    };
                    img.src = processed;
                  };
                  reader.readAsDataURL(file);
                } catch { setImportProcessing(false); }
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importProcessing}
              style={{
                width: '100%', padding: '8px', borderRadius: 8,
                border: '1px solid var(--mn-border)', background: '#fff',
                cursor: 'pointer', fontSize: 12, fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                opacity: importProcessing ? 0.6 : 1,
              }}
            >
              {importProcessing ? '⏳ Processing...' : '📁 Upload Frame Image'}
            </button>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.4 }}>
              Upload a frame template PNG with transparent cutouts to auto-detect photo slots.
            </p>
          </aside>
          <LayerPanel
            elements={elements}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onToggleVisibility={toggleVisibility}
            onBringForward={bringForward}
            onSendBackward={sendBackward}
            onDelete={deleteElement}
          />
        </div>

        <div className={styles.canvasArea}>
          <EditorCanvas
            ref={editorRef}
            elements={elements}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onUpdate={updateElement}
            canvasSize={canvasSize}
            canvasBg={canvasBg}
          />
        </div>

        <PropertiesPanel
          selected={selected}
          slotCount={slotCount}
          onSetSlotCount={setSlotLayout}
          onUpdateProps={(props) => selected && updateElementProps(selected.id, props)}
          onUpdate={(patch) => selected && updateElement(selected.id, patch)}
          onDelete={() => selected && deleteElement(selected.id)}
          onBringForward={() => selected && bringForward(selected.id)}
          onSendBackward={() => selected && sendBackward(selected.id)}
          onBrowseStickers={() => selected && openStickerGallery(selected.id)}
        />
      </div>

      {stickerTargetId && (
        <AssetSearch
          onSelect={handleAssetSelect}
          onClose={() => setStickerTargetId(null)}
        />
      )}

      {showSaveModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
        }} onClick={() => !saving && setShowSaveModal(false)}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 28, width: 380,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>
              {editingTemplateId ? 'Update Template' : 'Save Template'}
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-muted)' }}>
              {editingTemplateId ? 'Update your strip template' : 'Enter a name for your strip template'}
            </p>
            <input
              type="text"
              placeholder="Template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              autoFocus
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 10,
                border: '1px solid var(--mn-border)', fontSize: 15,
                marginBottom: 20, fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSaveModal(false)}
                disabled={saving}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: '1px solid var(--mn-border)',
                  background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  opacity: saving ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !templateName.trim()}
                style={{
                  padding: '10px 24px', borderRadius: 10, border: 'none',
                  background: saving || !templateName.trim() ? '#ccc' : 'var(--accent-color, #C5D89D)',
                  color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}
              >
                {saving ? 'Saving...' : editingTemplateId ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
