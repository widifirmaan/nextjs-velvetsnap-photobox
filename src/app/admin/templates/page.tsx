'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Loader2, Image, X, Sparkles, RefreshCw } from 'lucide-react';
import styles from './page.module.css';

interface ISlot {
  x: number;  // relative x percentage (0 - 100)
  y: number;  // relative y percentage (0 - 100)
  w: number;  // relative width percentage (0 - 100)
  h: number;  // relative height percentage (0 - 100)
}

interface TemplateData {
  _id: string;
  templateId: string;
  name: string;
  description: string;
  slots: number;
  price: number;
  color: string;
  isActive: boolean;
  frameImage?: string;
  slotsLayout?: ISlot[];
}

const defaultForm = {
  templateId: '',
  name: '',
  description: '',
  slots: 0,
  price: 35000,
  color: '#000000',
  isActive: true,
  frameImage: '',
  slotsLayout: [] as ISlot[],
};

function removeChromaKey(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
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
          if (dr * dr + dg * dg + db * db < 1600) {
            d[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

// Helper function to detect transparent boxes (bounding rects) in image
function detectTransparentSlots(imgEl: HTMLImageElement): ISlot[] {
  const canvas = document.createElement('canvas');
  // Downsample to max width 800 for faster/more robust pixel parsing
  const maxDim = 800;
  let w = imgEl.naturalWidth || imgEl.width;
  let h = imgEl.naturalHeight || imgEl.height;
  if (w > maxDim || h > maxDim) {
    const scale = Math.min(maxDim / w, maxDim / h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  
  canvas.width = w;
  canvas.height = h;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  ctx.drawImage(imgEl, 0, 0, w, h);
  
  let imgData;
  try {
    imgData = ctx.getImageData(0, 0, w, h);
  } catch (e) {
    console.error("Canvas context error:", e);
    return [];
  }
  
  const data = imgData.data;
  const grid: boolean[] = new Array(w * h);
  
  // Mark transparent pixels (alpha < 50) OR chromakey green (#00bf63) pixels
  const targetR = 0;
  const targetG = 191;
  const targetB = 99;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = data[i + 3];
    
    const isTransparent = alpha < 50;
    
    const diffR = r - targetR;
    const diffG = g - targetG;
    const diffB = b - targetB;
    const isChromaGreen = (diffR * diffR + diffG * diffG + diffB * diffB) < 1600;

    grid[i / 4] = isTransparent || isChromaGreen;
  }
  
  const visited = new Uint8Array(w * h);
  const rects: ISlot[] = [];
  const step = 1;
  
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const idx = y * w + x;
      if (grid[idx] && !visited[idx]) {
        // Found a transparent pixel component, flood fill/BFS to get bounding box
        let minX = x, maxX = x;
        let minY = y, maxY = y;
        
        const queue: [number, number][] = [[x, y]];
        visited[idx] = 1;
        
        while (queue.length > 0) {
          const curr = queue.shift()!;
          const cx = curr[0];
          const cy = curr[1];
          minX = Math.min(minX, cx);
          maxX = Math.max(maxX, cx);
          minY = Math.min(minY, cy);
          maxY = Math.max(maxY, cy);
          
          const neighbors = [
            [cx + step, cy],
            [cx - step, cy],
            [cx, cy + step],
            [cx, cy - step]
          ];
          
          for (const [nx, ny] of neighbors) {
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const nidx = ny * w + nx;
              if (grid[nidx] && !visited[nidx]) {
                visited[nidx] = 1;
                queue.push([nx, ny]);
              }
            }
          }
        }
        
        const rw = maxX - minX + step;
        const rh = maxY - minY + step;
        
        const minSlotPx = 100;
        const origW = imgEl.naturalWidth || imgEl.width;
        const origH = imgEl.naturalHeight || imgEl.height;
        const scaleX = origW / w;
        const scaleY = origH / h;
        if (rw * scaleX >= minSlotPx && rh * scaleY >= minSlotPx) {
          const padX = Math.max(w * 0.05, 16);
          const padY = Math.max(h * 0, 16);
          const px = Math.max(0, minX - padX);
          const py = Math.max(0, minY - padY);
          const pw = Math.min(w - px, rw + padX * 2);
          const ph = Math.min(h - py, rh + padY * 2);
          rects.push({
            x: Math.round((px / w) * 100 * 10) / 10,
            y: Math.round((py / h) * 100 * 10) / 10,
            w: Math.round((pw / w) * 100 * 10) / 10,
            h: Math.round((ph / h) * 100 * 10) / 10,
          });
        }
      }
    }
  }
  
  // Sort detected boxes top-to-bottom, left-to-right with a threshold of 3% y-difference
  return rects.sort((a, b) => {
    if (Math.abs(a.y - b.y) < 3) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });
}

export default function TemplatesAdmin() {
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...defaultForm });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interactive Drawing State
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchTemplates();
  }, []);



  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateTemplateId = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const prefix = `${y}${m}${d}-`;
    const existing = templates
      .filter((t) => t.templateId && t.templateId.startsWith(prefix))
      .map((t) => parseInt(t.templateId.slice(prefix.length), 10) || 0);
    const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
    return `${prefix}${next}`;
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({ ...defaultForm, templateId: generateTemplateId() });
    setImagePreview('');
    setShowForm(true);
  };

  const openEditForm = (t: TemplateData) => {
    setEditingId(t._id);
    setFormData({
      templateId: t.templateId || '',
      name: t.name || '',
      description: t.description || '',
      slots: t.slots || 0,
      price: t.price || 35000,
      color: t.color || '#000000',
      isActive: t.isActive !== false,
      frameImage: t.frameImage || '',
      slotsLayout: t.slotsLayout || [],
    });
    setImagePreview(t.frameImage || '');
    setShowForm(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setProcessing(true);
      setImagePreview(dataUrl);
      setFormData((prev) => ({
        ...prev,
        frameImage: dataUrl,
        slotsLayout: [],
        slots: 0
      }));
      removeChromaKey(dataUrl).then((processed) => {
        setImagePreview(processed);
        setFormData((prev) => ({
          ...prev,
          frameImage: processed,
        }));
        const detImg = new window.Image();
        detImg.onload = () => {
          const detected = detectTransparentSlots(detImg);
          if (detected.length > 0) {
            setFormData((prev) => ({
              ...prev,
              slotsLayout: detected,
              slots: detected.length,
            }));
          }
        };
        detImg.src = processed;
      }).finally(() => setProcessing(false));
    };
    reader.readAsDataURL(file);
  };

  // Resize State
  const [resizing, setResizing] = useState<{ index: number; handle: string; startX: number; startY: number; slot: ISlot } | null>(null);

  // Drag-to-Draw Logic
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !imagePreview) return;
    const target = e.target as HTMLElement;
    const resizeHandle = target.closest('[data-resize-handle]');
    if (resizeHandle) {
      const index = parseInt(resizeHandle.getAttribute('data-slot-index') || '0', 10);
      const handle = resizeHandle.getAttribute('data-resize-handle') || '';
      const slot = formData.slotsLayout?.[index];
      if (!slot) return;
      const rect = containerRef.current.getBoundingClientRect();
      setResizing({
        index,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        slot: { ...slot },
      });
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentPos({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (resizing) {
      const dx = ((e.clientX - resizing.startX) / rect.width) * 100;
      const dy = ((e.clientY - resizing.startY) / rect.height) * 100;
      const { slot, index, handle } = resizing;

      let newSlot = { ...slot };
      const minSize = 3;

      if (handle.includes('e')) {
        newSlot.w = Math.max(minSize, slot.w + dx);
      }
      if (handle.includes('w')) {
        const nw = Math.max(minSize, slot.w - dx);
        newSlot.x = slot.x + (slot.w - nw);
        newSlot.w = nw;
      }
      if (handle.includes('s')) {
        newSlot.h = Math.max(minSize, slot.h + dy);
      }
      if (handle.includes('n')) {
        const nh = Math.max(minSize, slot.h - dy);
        newSlot.y = slot.y + (slot.h - nh);
        newSlot.h = nh;
      }

      setFormData((prev) => {
        const updated = [...(prev.slotsLayout || [])];
        updated[index] = newSlot;
        return { ...prev, slotsLayout: updated };
      });
      return;
    }

    if (!isDrawing) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentPos({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    });
  };

  const handleMouseUp = () => {
    if (resizing) {
      setResizing(null);
      return;
    }
    if (!isDrawing) return;
    setIsDrawing(false);

    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const w = Math.abs(startPos.x - currentPos.x);
    const h = Math.abs(startPos.y - currentPos.y);

    if (w > 1.5 && h > 1.5) {
      const newSlot: ISlot = {
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        w: Math.round(w * 10) / 10,
        h: Math.round(h * 10) / 10,
      };

      setFormData((prev) => {
        const updated = [...(prev.slotsLayout || []), newSlot];
        return {
          ...prev,
          slotsLayout: updated,
          slots: updated.length,
        };
      });
    }
  };

  const handleDeleteSlot = (index: number) => {
    setFormData((prev) => {
      const updated = (prev.slotsLayout || []).filter((_, i) => i !== index);
      return {
        ...prev,
        slotsLayout: updated,
        slots: updated.length,
      };
    });
  };

  const handleAutoDetect = () => {
    if (!imagePreview) return;
    const img = new window.Image();
    img.onload = () => {
      const detected = detectTransparentSlots(img);
      if (detected.length === 0) {
        alert("No transparent slots detected. Please upload a transparent PNG frame or draw slots manually.");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        slotsLayout: detected,
        slots: detected.length,
      }));
    };
    img.src = imagePreview;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetch(`/api/templates/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }
      setShowForm(false);
      setEditingId(null);
      fetchTemplates();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      fetchTemplates();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleToggleActive = async (t: TemplateData) => {
    try {
      await fetch(`/api/templates/${t._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !t.isActive }),
      });
      fetchTemplates();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const handleConvertTemplate = async (t: TemplateData) => {
    if (!t.frameImage || !confirm(`Convert "${t.name}" frame to 1000px width?`)) return;
    try {
      const processed = await removeChromaKey(t.frameImage);
      await fetch(`/api/templates/${t._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frameImage: processed }),
      });
      fetchTemplates();
    } catch (err) {
      console.error('Convert failed:', err);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className="title" style={{ textAlign: 'left', marginBottom: '8px' }}>Templates</h1>
          <p className="subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
            Manage photobooth templates and frames
          </p>
        </div>

        <button className="mac-button" onClick={openAddForm}>
          <Plus size={20} /> Add Template
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className={`glass-panel ${styles.formCard}`}>
          <h2>{editingId ? 'Edit Template' : 'Add New Template'}</h2>
          <form onSubmit={handleSave}>
            <div className={styles.formLayout}>
              <div className={styles.formFields}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Template ID</label>
                    <input
                      type="text"
                      required
                      value={formData.templateId}
                      onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                      placeholder="e.g. t4"
                      disabled={!!editingId}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Polaroid"
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the template..."
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Slots (Shots) - Auto calculated</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="10"
                      readOnly
                      value={formData.slots}
                      style={{ background: '#f0f0f0', color: '#999', cursor: 'not-allowed' }}
                      placeholder="Upload image and configure slots"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Price (Rp)</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Color</label>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      style={{ width: 48, height: 48, padding: 0, border: '2px solid #ddd', borderRadius: 12, cursor: 'pointer', background: 'none' }}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Status</label>
                    <select
                      value={formData.isActive ? 'active' : 'inactive'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Visual Interactive Canvas Workspace */}
              <div className={styles.imagePreviewArea} style={{ gridColumn: 'span 1' }}>
                <label style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-secondary)', alignSelf: 'flex-start' }}>
                  Frame Template & Photo Slots Layout
                </label>
                
                {imagePreview ? (
                  <div className={styles.workspaceWrapper}>
                    <div 
                      ref={containerRef}
                      className={styles.canvasContainer}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Frame workspace" style={processing ? { filter: 'blur(4px)' } : undefined} />
                      {processing && (
                        <div className={styles.processingOverlay}>
                          <Loader2 size={24} className={styles.spinner} />
                          <span>Removing background...</span>
                        </div>
                      )}
                      
                      {/* Active Slot Borders */}
                      {(formData.slotsLayout || []).map((slot, idx) => (
                        <div
                          key={idx}
                          className={styles.slotHighlight}
                          style={{
                            left: `${slot.x}%`,
                            top: `${slot.y}%`,
                            width: `${slot.w}%`,
                            height: `${slot.h}%`,
                          }}
                        >
                          <span className={styles.slotBadge}>Slot {idx + 1}</span>
                          <button
                            type="button"
                            className={styles.slotDeleteBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSlot(idx);
                            }}
                          >
                            ×
                          </button>
                          <div className={styles.resizeHandle} data-resize-handle="nw" data-slot-index={idx} />
                          <div className={styles.resizeHandle} data-resize-handle="n" data-slot-index={idx} />
                          <div className={styles.resizeHandle} data-resize-handle="ne" data-slot-index={idx} />
                          <div className={styles.resizeHandle} data-resize-handle="e" data-slot-index={idx} />
                          <div className={styles.resizeHandle} data-resize-handle="se" data-slot-index={idx} />
                          <div className={styles.resizeHandle} data-resize-handle="s" data-slot-index={idx} />
                          <div className={styles.resizeHandle} data-resize-handle="sw" data-slot-index={idx} />
                          <div className={styles.resizeHandle} data-resize-handle="w" data-slot-index={idx} />
                        </div>
                      ))}

                      {/* Active click & drag selection preview */}
                      {isDrawing && (
                        <div
                          className={styles.activeSelection}
                          style={{
                            left: `${Math.min(startPos.x, currentPos.x)}%`,
                            top: `${Math.min(startPos.y, currentPos.y)}%`,
                            width: `${Math.abs(startPos.x - currentPos.x)}%`,
                            height: `${Math.abs(startPos.y - currentPos.y)}%`,
                          }}
                        />
                      )}
                    </div>

                    <div className={styles.workspaceToolbar}>
                      <button
                        type="button"
                        className="mac-button secondary"
                        onClick={() => setFormData(prev => ({ ...prev, slotsLayout: [], slots: 0 }))}
                      >
                        <RefreshCw size={14} /> Clear Slots
                      </button>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: '1.4' }}>
                      💡 Tip: Click & drag on the image above to draw photo slots manually. Upload PNGs with transparent cutouts for auto-detection!
                    </p>
                  </div>
                ) : (
                  <div className={styles.imagePreview}>
                    <div className={styles.imagePreviewPlaceholder}>
                      <Image size={32} />
                      <span>No frame image</span>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenInput}
                  onChange={handleImageUpload}
                />
                
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <button
                    type="button"
                    className={`mac-button secondary ${styles.imageUploadBtn}`}
                    onClick={() => fileInputRef.current?.click()}
                    style={{ fontSize: '14px', padding: '10px 16px', flex: 1 }}
                  >
                    <Image size={16} /> Upload Image
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      className={`mac-button secondary ${styles.imageUploadBtn}`}
                      onClick={() => { setImagePreview(''); setFormData((prev) => ({ ...prev, frameImage: '', slotsLayout: [], slots: 0 })); }}
                      style={{ fontSize: '14px', padding: '10px 16px', flex: 1 }}
                    >
                      <X size={16} /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" className="mac-button secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>
                Cancel
              </button>
              <button type="submit" className="mac-button" disabled={!imagePreview || (formData.slotsLayout || []).length === 0}>
                {editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates Table */}
      <div className={`glass-panel ${styles.tableContainer}`}>
        {loading ? (
          <div className={styles.loader}><Loader2 className="spin" size={32} /></div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Preview</th>
                <th>ID</th>
                <th>Name</th>
                <th>Slots</th>
                <th>Price</th>
                <th>Color</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t._id}>
                  <td>
                    <div className={styles.templateThumb}>
                      {t.frameImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.frameImage} alt={t.name} />
                      ) : (
                        <Image size={20} className={styles.templateThumbPlaceholder} />
                      )}
                    </div>
                  </td>
                  <td>{t.templateId}</td>
                  <td>{t.name}</td>
                  <td>{t.slots}</td>
                  <td>Rp {(t.price || 0).toLocaleString('id-ID')}</td>
                  <td>
                    <span
                      className={styles.colorSwatch}
                      style={{ backgroundColor: t.color || '#000000' }}
                    />
                  </td>
                  <td>
                    <div className={styles.statusToggle}>
                      <button
                        className={`${styles.toggleSwitch} ${t.isActive !== false ? styles.active : styles.inactive}`}
                        onClick={() => handleToggleActive(t)}
                        type="button"
                      >
                        <span className={styles.toggleKnob} />
                      </button>
                      <span className={`${styles.statusLabel} ${t.isActive !== false ? styles.active : styles.inactive}`}>
                        {t.isActive !== false ? 'Active' : 'Off'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => openEditForm(t)}
                        title="Edit template"
                      >
                        <Edit2 size={18} color="var(--accent-color)" />
                      </button>
                       <button
                          className={`${styles.iconBtn} ${styles.danger}`}
                          onClick={() => handleDelete(t._id)}
                          title="Delete template"
                        >
                          <Trash2 size={18} color="var(--danger-color)" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                    No templates found. Click &quot;Add Template&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

