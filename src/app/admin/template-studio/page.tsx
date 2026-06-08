'use client';

import { useState, useCallback, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import type { IStripElement } from '@/models/Template';
import { AdminPageHeader } from '@/app/admin/components';
import { useModel } from '@/lib/ModelContext';
import EditorCanvas from './component/EditorCanvas';
import type { EditorCanvasHandle } from './component/EditorCanvas';
import ElementToolbar from './component/ElementToolbar';
import LayerPanel from './component/LayerPanel';
import PropertiesPanel from './component/PropertiesPanel';
import AssetSearch from './component/AssetSearch';
import styles from './page.module.css';

const DEFAULT_CANVAS_W = 600;
const DEFAULT_CANVAS_H = 1800;

function generateSlotLayout(slotCount: number): IStripElement[] {
  const marginX = Math.round(DEFAULT_CANVAS_W * 0.055);
  const photoW = DEFAULT_CANVAS_W - marginX * 2;
  const gap = 28;
  const topPad = 40;
  const bottomPad = 100;
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
    y: DEFAULT_CANVAS_H - 80,
    width: DEFAULT_CANVAS_W,
    height: 50,
    rotation: 0,
    zIndex: slotCount,
    visible: true,
    props: {
      content: 'Velvet Snap',
      fontSize: 32,
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
  const [templateName, setTemplateName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const model = useModel();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const editorRef = useRef<EditorCanvasHandle>(null);
  const stickerTargetRef = useRef<string | null>(null);
  const [stickerTargetId, setStickerTargetId] = useState<string | null>(null);

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

  const openStickerGallery = (elementId: string) => {
    stickerTargetRef.current = elementId;
    setStickerTargetId(elementId);
  };

  const handleAssetSelect = (url: string) => {
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

  const handleSave = async () => {
    if (!templateName.trim()) return alert('Please enter a template name');
    setSaving(true);
    setSaved(false);
    try {
      const thumbnail = editorRef.current?.getThumbnail() || '';
      const body = {
        templateId: templateId || `strip-${Date.now()}`,
        name: templateName,
        description: 'Designed in Strips Studio',
        slots: elements.filter((el) => el.type === 'photo-slot').length,
        price: 35000,
        color: '#C5D89D',
        isActive: true,
        type: 'strip' as const,
        canvasWidth: canvasSize.w,
        canvasHeight: canvasSize.h,
        thumbnail,
        elements: elements.map((el) => ({
          ...el,
          props: { ...el.props },
        })),
      };
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTemplateId(data.data.templateId);
      } else {
        alert('Save failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Save failed: ' + String(err));
    } finally {
      setSaving(false);
    }
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

      <div className={styles.bottomBar}>
        <div className={styles.nameField}>
          <input
            type="text"
            placeholder="Template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </div>
        <div className={styles.modelStatus}>
          {model.status === 'downloading' && (
            <span className={styles.modelLoading}>AI model downloading... {model.progress}%</span>
          )}
          {model.status === 'ready' && (
            <span className={styles.modelReady}>AI ready</span>
          )}
          {model.status === 'error' && (
            <span className={styles.modelLoading}>AI error — <button onClick={model.retry} style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}>retry</button></span>
          )}
          {model.status === 'checking' && (
            <span className={styles.modelLoading}>AI preparing...</span>
          )}
        </div>
        <button className="mac-button" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Template'}
        </button>
      </div>
    </div>
  );
}
