'use client';

import { Palette, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { IStripElement } from '@/models/Template';
import styles from './PropertiesPanel.module.css';

const FONT_LIST = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Lora', label: 'Lora' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond' },
  { value: 'EB Garamond', label: 'EB Garamond' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Raleway', label: 'Raleway' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Quicksand', label: 'Quicksand' },
  { value: 'Nunito', label: 'Nunito' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Space Grotesk', label: 'Space Grotesk' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
  { value: 'Sacramento', label: 'Sacramento' },
  { value: 'Great Vibes', label: 'Great Vibes' },
  { value: 'Alex Brush', label: 'Alex Brush' },
  { value: 'Pacifico', label: 'Pacifico' },
  { value: 'Dancing Script', label: 'Dancing Script' },
  { value: 'Caveat', label: 'Caveat' },
  { value: 'Amatic SC', label: 'Amatic SC' },
  { value: 'Oswald', label: 'Oswald' },
  { value: 'Bebas Neue', label: 'Bebas Neue' },
  { value: 'Anton', label: 'Anton' },
  { value: 'Limelight', label: 'Limelight' },
  { value: 'Unica One', label: 'Unica One' },
  { value: 'Josefin Sans', label: 'Josefin Sans' },
  { value: 'Abril Fatface', label: 'Abril Fatface' },
  { value: 'DM Serif Display', label: 'DM Serif Display' },
  { value: 'Old Standard TT', label: 'Old Standard TT' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Fira Sans', label: 'Fira Sans' },
  { value: 'Manrope', label: 'Manrope' },
  { value: 'Epilogue', label: 'Epilogue' },
  { value: 'Sora', label: 'Sora' },
  { value: 'Outfit', label: 'Outfit' },
  { value: 'DM Serif Text', label: 'DM Serif Text' },
  { value: 'Zilla Slab', label: 'Zilla Slab' },
  { value: 'Bitter', label: 'Bitter' },
  { value: 'Spectral', label: 'Spectral' },
  { value: 'Prata', label: 'Prata' },
  { value: 'Bodoni Moda', label: 'Bodoni Moda' },
  { value: 'Cinzel', label: 'Cinzel' },
  { value: 'Work Sans', label: 'Work Sans' },
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
  { value: 'Hanken Grotesk', label: 'Hanken Grotesk' },
  { value: 'Aleo', label: 'Aleo' },
  { value: 'Archivo', label: 'Archivo' },
  { value: 'Ubuntu', label: 'Ubuntu' },
  { value: 'Nothing You Could Do', label: 'Nothing You Could Do' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
];

interface PropertiesPanelProps {
  selected: IStripElement | null;
  slotCount: number;
  onSetSlotCount: (n: number) => void;
  onUpdateProps: (props: Record<string, any>) => void;
  onUpdate: (patch: Partial<IStripElement>) => void;
  onDelete: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBrowseStickers?: () => void;
  disabled?: boolean;
}

const SHAPES = ['rectangle', 'rounded', 'circle', 'heart', 'star', 'diamond', 'polaroid', 'hexagon'] as const;
const SHAPE_TYPES = ['rect', 'circle', 'ellipse', 'star', 'line'] as const;

export default function PropertiesPanel({
  selected,
  slotCount,
  onSetSlotCount,
  disabled,
  onUpdateProps,
  onUpdate,
  onDelete,
  onBringForward,
  onSendBackward,
  onBrowseStickers,
}: PropertiesPanelProps) {
  const slotOptions = [2, 3, 4, 5, 6];

  if (!selected) {
    return (
      <aside className="properties-panel">
        <Section label="Strip Layout">
          <FieldRow>
            <SelectField
              label="Photo Slots"
              value={String(slotCount)}
              options={slotOptions.map((n) => ({ value: String(n), label: `${n} Photos` }))}
              onChange={(v) => onSetSlotCount(Number(v))}
            />
          </FieldRow>
        </Section>
        <p className={styles.emptyState}>
          Select an element to edit
        </p>
      </aside>
    );
  }

  const p = selected.props;

  const set = (key: string, value: any) => onUpdateProps({ [key]: value });
  const setEl = (key: string, value: any) => onUpdate({ [key]: value });

  return (
    <aside className="properties-panel">
      <h3 className="section-heading">
        Properties — <span className={styles.selectedType}>{selected.type}</span>
      </h3>

      <Section label="Transform">
        <FieldRow>
          <NumberField label="X" value={selected.x} onChange={(v) => setEl('x', v)} />
          <NumberField label="Y" value={selected.y} onChange={(v) => setEl('y', v)} />
        </FieldRow>
        <FieldRow>
          <NumberField label="W" value={selected.width} onChange={(v) => setEl('width', v)} />
          <NumberField label="H" value={selected.height} onChange={(v) => setEl('height', v)} />
        </FieldRow>
        <FieldRow>
          <NumberField label="Rot" value={selected.rotation} onChange={(v) => setEl('rotation', v)} step={1} />
          <NumberField label="Opacity" value={p.opacity ?? 1} onChange={(v) => set('opacity', v)} min={0} max={1} step={0.05} />
        </FieldRow>
      </Section>

      {selected.type === 'photo-slot' && (
        <>
          <Section label="Layout">
            <FieldRow>
              <SelectField
                label="Photo Slots"
                value={String(slotCount)}
                options={slotOptions.map((n) => ({ value: String(n), label: `${n} Photos` }))}
                onChange={(v) => onSetSlotCount(Number(v))}
              />
            </FieldRow>
          </Section>
          <Section label="Photo Slot">
            <FieldRow>
              <SelectField
                label="Shape"
                value={p.shape || 'rounded'}
                options={SHAPES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
                onChange={(v) => set('shape', v)}
              />
            </FieldRow>
            <FieldRow>
              <NumberField label="Border" value={p.borderWidth ?? 2} onChange={(v) => set('borderWidth', v)} min={0} />
              <ColorField label="Color" value={p.borderColor || '#ffffff'} onChange={(v) => set('borderColor', v)} />
            </FieldRow>
            {p.shape === 'rounded' && (
              <FieldRow>
                <NumberField label="Radius" value={p.borderRadius ?? 8} onChange={(v) => set('borderRadius', v)} min={0} />
              </FieldRow>
            )}
          </Section>
        </>
      )}

      {selected.type === 'text' && (
        <Section label="Text">
          <FieldRow>
            <textarea
              value={p.content || ''}
              onChange={(e) => set('content', e.target.value)}
              rows={3}
              className={styles.textareaField}
              placeholder="Type here..."
            />
          </FieldRow>
          <FieldRow>
            <div className="grow">
              <label className={styles.fieldLabel}>Font</label>
              <select
                value={p.fontFamily || 'Inter'}
                onChange={(e) => set('fontFamily', e.target.value)}
                className={`${styles.fullWidth} form-input-compact`}
              >
                {FONT_LIST.map((f) => (
                  <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                ))}
              </select>
            </div>
          </FieldRow>
          <FieldRow>
            <NumberField label="Size" value={p.fontSize ?? 48} onChange={(v) => set('fontSize', v)} min={8} />
            <ColorField label="Color" value={p.color || '#3d2c2c'} onChange={(v) => set('color', v)} />
          </FieldRow>
          <FieldRow>
            <NumberField label="Letter Spacing" value={p.letterSpacing ?? 0} onChange={(v) => set('letterSpacing', v)} min={-5} max={20} />
          </FieldRow>
          <FieldRow>
            <div className="grow">
              <label className={styles.fieldLabel}>Weight</label>
              <select
                value={p.fontWeight || '400'}
                onChange={(e) => set('fontWeight', e.target.value)}
                className={`${styles.fullWidth} form-input-compact`}
                style={{ fontFamily: p.fontFamily || 'Inter', fontWeight: p.fontWeight || '400' }}
              >
                <option value="400" style={{ fontWeight: 400 }}>Regular</option>
                <option value="700" style={{ fontWeight: 700 }}>Bold</option>
              </select>
            </div>
            <div className="grow">
              <label className={styles.fieldLabel}>Style</label>
              <select
                value={p.fontStyle || 'normal'}
                onChange={(e) => set('fontStyle', e.target.value)}
                className={`${styles.fullWidth} form-input-compact`}
                style={{ fontFamily: p.fontFamily || 'Inter', fontStyle: p.fontStyle || 'normal' }}
              >
                {[
                  { value: 'normal', label: 'Normal' },
                  { value: 'italic', label: 'Italic' },
                ].map((o) => (
                  <option key={o.value} value={o.value} style={{ fontStyle: o.value }}>{o.label}</option>
                ))}
              </select>
            </div>
          </FieldRow>
          <FieldRow>
            <SelectField
              label="Align"
              value={p.textAlign || 'left'}
              options={[
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
                { value: 'right', label: 'Right' },
              ]}
              onChange={(v) => set('textAlign', v)}
            />
          </FieldRow>
          <FieldRow>
            <ColorField label="Outline" value={p.strokeColor || ''} onChange={(v) => set('strokeColor', v)} />
            <NumberField label="Width" value={p.strokeWidth ?? 0} onChange={(v) => set('strokeWidth', v)} min={0} max={20} />
          </FieldRow>
        </Section>
      )}

      {selected.type === 'sticker' && (
        <Section label="Sticker">
          <FieldRow>
            <div className={styles.fullWidth}>
              <label className={styles.fieldLabel}>Image URL</label>
              <input
                type="text"
                value={p.stickerUrl || ''}
                onChange={(e) => set('stickerUrl', e.target.value)}
                placeholder="https://..."
                className={styles.stickerInput}
              />
              <button
                onClick={onBrowseStickers}
                disabled={disabled}
                className={styles.browseGalleryBtn}
                style={{ background: disabled ? '#eee' : 'var(--accent-bg)', color: disabled ? '#999' : 'var(--accent-color)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}
              >
                <Palette size={16} /> Browse Gallery
              </button>
            </div>
          </FieldRow>
        </Section>
      )}

      {selected.type === 'shape' && (
        <Section label="Shape">
          <FieldRow>
            <SelectField
              label="Type"
              value={p.shapeType || 'rect'}
              options={SHAPE_TYPES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
              onChange={(v) => set('shapeType', v)}
            />
          </FieldRow>
          <FieldRow>
            <ColorField label="Fill" value={p.fillColor || '#C5D89D'} onChange={(v) => set('fillColor', v)} />
            <ColorField label="Stroke" value={p.strokeColor || '#9CAB84'} onChange={(v) => set('strokeColor', v)} />
          </FieldRow>
          <FieldRow>
            <NumberField label="Stroke W" value={p.strokeWidth ?? 2} onChange={(v) => set('strokeWidth', v)} min={0} />
          </FieldRow>
        </Section>
      )}



      <div className={styles.actionButtons}>
        <button onClick={onBringForward} disabled={disabled} className={styles.actionBtn} style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, background: disabled ? '#f5f5f5' : '#fff' }}>
          <ChevronUp size={16} /> Bring Forward
        </button>
        <button onClick={onSendBackward} disabled={disabled} className={styles.actionBtn} style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, background: disabled ? '#f5f5f5' : '#fff' }}>
          <ChevronDown size={16} /> Send Backward
        </button>
        <button onClick={onDelete} disabled={disabled} className={styles.actionBtn} style={{ borderColor: disabled ? '#ddd' : '#e74c3c', color: disabled ? '#ccc' : '#e74c3c', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, background: disabled ? '#f5f5f5' : '#fff' }}>
          <Trash2 size={16} /> Delete Element
        </button>
      </div>
    </aside>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.sectionWrapper}>
      <p className={styles.sectionLabel}>{label}</p>
      {children}
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className={styles.fieldRow}>{children}</div>;
}

function NumberField({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div className="grow">
      <label className={styles.fieldLabel}>{label}</label>
      <input
        type="number"
        value={Math.round(value * 100) / 100}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step ?? 1}
        className={`${styles.fullWidth} form-input-compact`}
      />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grow">
      <label className={styles.fieldLabel}>{label}</label>
      <div className={styles.flexRowSm}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={styles.colorPicker}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="grow form-input-compact"
          style={{ fontFamily: 'monospace' }}
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="grow">
      <label className={styles.fieldLabel}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${styles.fullWidth} form-input-compact`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
