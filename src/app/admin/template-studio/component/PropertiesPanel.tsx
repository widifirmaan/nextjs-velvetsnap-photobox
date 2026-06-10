'use client';

import type { IStripElement } from '@/models/Template';

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
}

const SHAPES = ['rectangle', 'rounded', 'circle', 'heart', 'star', 'diamond', 'polaroid', 'hexagon'] as const;
const SHAPE_TYPES = ['rect', 'circle', 'ellipse', 'star', 'line'] as const;

export default function PropertiesPanel({
  selected,
  slotCount,
  onSetSlotCount,
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
        <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', marginTop: 24 }}>
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
      <h3 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>
        Properties — <span style={{ color: 'var(--text-primary)' }}>{selected.type}</span>
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
              style={{ width: '100%', padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', fontFamily: 'inherit', fontSize: 13, resize: 'vertical' }}
              placeholder="Type here..."
            />
          </FieldRow>
          <FieldRow>
            <SelectField
              label="Font"
              value={p.fontFamily || 'Inter'}
              options={[
                { value: 'Inter', label: 'Inter' },
                { value: 'Georgia', label: 'Georgia' },
                { value: 'Courier New', label: 'Courier New' },
                { value: 'Arial', label: 'Arial' },
                { value: 'Arial Black', label: 'Arial Black' },
                { value: 'Times New Roman', label: 'Times New Roman' },
                { value: 'Verdana', label: 'Verdana' },
                { value: 'Trebuchet MS', label: 'Trebuchet MS' },
                { value: 'Palatino Linotype', label: 'Palatino Linotype' },
                { value: 'Impact', label: 'Impact' },
                { value: 'Comic Sans MS', label: 'Comic Sans MS' },
                { value: 'Lucida Console', label: 'Lucida Console' },
                { value: 'Tahoma', label: 'Tahoma' },
                { value: 'Garamond', label: 'Garamond' },
                { value: 'Bookman', label: 'Bookman' },
              ]}
              onChange={(v) => set('fontFamily', v)}
            />
          </FieldRow>
          <FieldRow>
            <NumberField label="Size" value={p.fontSize ?? 48} onChange={(v) => set('fontSize', v)} min={8} />
            <ColorField label="Color" value={p.color || '#3d2c2c'} onChange={(v) => set('color', v)} />
          </FieldRow>
          <FieldRow>
            <NumberField label="Letter Spacing" value={p.letterSpacing ?? 0} onChange={(v) => set('letterSpacing', v)} min={-5} max={20} />
          </FieldRow>
          <FieldRow>
            <SelectField
              label="Weight"
              value={p.fontWeight || '400'}
              options={[
                { value: '100', label: 'Thin' },
                { value: '200', label: 'Extra Light' },
                { value: '300', label: 'Light' },
                { value: '400', label: 'Regular' },
                { value: '500', label: 'Medium' },
                { value: '600', label: 'Semi Bold' },
                { value: '700', label: 'Bold' },
                { value: '800', label: 'Extra Bold' },
                { value: '900', label: 'Black' },
              ]}
              onChange={(v) => set('fontWeight', v)}
            />
            <SelectField
              label="Style"
              value={p.fontStyle || 'normal'}
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'italic', label: 'Italic' },
              ]}
              onChange={(v) => set('fontStyle', v)}
            />
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
            <div style={{ width: '100%' }}>
              <label style={{...labelStyle}}>Image URL</label>
              <input
                type="text"
                value={p.stickerUrl || ''}
                onChange={(e) => set('stickerUrl', e.target.value)}
                placeholder="https://..."
                style={{ width: '100%', padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)', fontSize: 13, marginBottom: 6 }}
              />
              <button
                onClick={onBrowseStickers}
                style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid var(--accent-color)', background: 'var(--accent-bg)', color: 'var(--accent-color)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
              >
                🎨 Browse Gallery
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



      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button onClick={onBringForward} style={{ ...btnStyle }}>
          ↑ Bring Forward
        </button>
        <button onClick={onSendBackward} style={{ ...btnStyle }}>
          ↓ Send Backward
        </button>
        <button onClick={onDelete} style={{ ...btnStyle, borderColor: '#e74c3c', color: '#e74c3c' }}>
          ✕ Delete Element
        </button>
      </div>
    </aside>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>{label}</p>
      {children}
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>{children}</div>;
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-muted)',
  marginBottom: 2,
};

function NumberField({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type="number"
        value={Math.round(value * 100) / 100}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        min={min}
        max={max}
        step={step ?? 1}
        style={{ width: '100%', padding: '4px 6px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.08)', fontSize: 12 }}
      />
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 28, height: 28, padding: 0, border: 'none', borderRadius: 6, cursor: 'pointer' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, padding: '4px 6px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.08)', fontSize: 12, fontFamily: 'monospace' }}
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div style={{ flex: 1 }}>
      <label style={labelStyle}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '4px 6px', borderRadius: 6, border: '1px solid rgba(0,0,0,0.08)', fontSize: 12, background: '#fff' }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 10,
  border: '1px solid var(--mn-border)',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  textAlign: 'left',
  color: 'var(--text-primary)',
};
