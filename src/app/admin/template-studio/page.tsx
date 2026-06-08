'use client';

import { useState, useCallback, useRef } from 'react';
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

  const editorRef = useRef<EditorCanvasHandle>(null);
  const stickerTargetRef = useRef<string | null>(null);
  const bgTargetRef = useRef(false);
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
          x: -50, y: -50,
          width: canvasSize.w + 100,
          height: canvasSize.h + 100,
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
              onClick={() => {
                const thumbnail = editorRef.current?.getThumbnail() || '';
                const data = {
                  type: 'strip' as const,
                  name: '',
                  description: 'Designed in Strips Studio',
                  slots: elements.filter((el) => el.type === 'photo-slot').length,
                  price: 35000,
                  color: canvasBg,
                  isActive: true,
                  canvasWidth: canvasSize.w,
                  canvasHeight: canvasSize.h,
                  thumbnail,
                  elements: elements.map((el) => ({ ...el, props: { ...el.props } })),
                };
                sessionStorage.setItem('stripTemplateData', JSON.stringify(data));
                router.push('/admin/templates?newStrip=1');
              }}
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

    </div>
  );
}
