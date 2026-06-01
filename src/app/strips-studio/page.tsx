'use client';

import { useState, useCallback, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import type { IStripElement } from '@/models/Template';
import EditorCanvas from './components/EditorCanvas';
import type { EditorCanvasHandle } from './components/EditorCanvas';
import ElementToolbar from './components/ElementToolbar';
import LayerPanel from './components/LayerPanel';
import PropertiesPanel from './components/PropertiesPanel';
import AssetSearch from './components/AssetSearch';
import styles from './page.module.css';

const DEFAULT_CANVAS_W = 600;
const DEFAULT_CANVAS_H = 900;

export default function StripsStudioPage() {
  const [elements, setElements] = useState<IStripElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: DEFAULT_CANVAS_W, h: DEFAULT_CANVAS_H });
  const [templateName, setTemplateName] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const editorRef = useRef<EditorCanvasHandle>(null);
  const [stickerTargetId, setStickerTargetId] = useState<string | null>(null);

  const selected = elements.find((el) => el.id === selectedId) || null;

  const addElement = useCallback((type: IStripElement['type']) => {
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
    } else if (type === 'sticker') {
      base.props = { stickerUrl: '', opacity: 1 };
    } else if (type === 'shape') {
      base.props = { shapeType: 'rect', fillColor: '#C5D89D', strokeColor: '#9CAB84', strokeWidth: 2, opacity: 1 };
    }
    setElements((prev) => [...prev, base]);
    setSelectedId(id);
    if (type === 'sticker') {
      setStickerTargetId(id);
    }
  }, [elements.length]);

  const openStickerGallery = (elementId: string) => {
    setStickerTargetId(elementId);
  };

  const handleAssetSelect = (url: string) => {
    if (!stickerTargetId) return;
    setElements((prev) =>
      prev.map((el) =>
        el.id === stickerTargetId
          ? { ...el, props: { ...el.props, stickerUrl: url } }
          : el
      )
    );
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
      <header className={styles.header}>
        <div>
          <h1 className="title" style={{ textAlign: 'left', marginBottom: 4 }}>Strips Studio</h1>
          <p className="subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>Design your strip template — drag, drop, style</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.nameField}>
            <input
              type="text"
              placeholder="Template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>
          <button className="mac-button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Template'}
          </button>
        </div>
      </header>

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
