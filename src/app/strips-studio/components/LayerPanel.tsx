'use client';

import type { IStripElement } from '@/models/Template';

interface LayerPanelProps {
  elements: IStripElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onToggleVisibility: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onDelete: (id: string) => void;
}

const TYPE_ICONS: Record<string, string> = {
  'photo-slot': '📷',
  text: 'Aa',
  sticker: '✨',
  shape: '◇',
  background: '🎨',
};

export default function LayerPanel({
  elements,
  selectedId,
  onSelect,
  onToggleVisibility,
  onBringForward,
  onSendBackward,
  onDelete,
}: LayerPanelProps) {
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid var(--mn-border)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 14px 8px',
        borderBottom: '1px solid var(--mn-border)',
      }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: 0 }}>
          Layers
        </h3>
      </div>

      <div style={{ maxHeight: 280, overflowY: 'auto' }}>
        {sorted.length === 0 ? (
          <p style={{ padding: '24px 14px', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            No elements yet
          </p>
        ) : (
          sorted.map((el, i) => {
            const isSelected = el.id === selectedId;
            const isFirst = i === 0;
            const isLast = i === sorted.length - 1;
            return (
              <div
                key={el.id}
                onClick={() => onSelect(el.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--accent-bg)' : 'transparent',
                  borderLeft: isSelected ? '3px solid var(--accent-color)' : '3px solid transparent',
                  transition: 'all 0.1s',
                  userSelect: 'none',
                  fontSize: 13,
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleVisibility(el.id); }}
                  style={{
                    width: 22, height: 22, borderRadius: 6, border: 'none',
                    background: 'transparent', cursor: 'pointer', fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: el.visible ? 0.6 : 0.25, padding: 0,
                  }}
                  title={el.visible ? 'Hide' : 'Show'}
                >
                  {el.visible ? '👁' : '👁‍🗨'}
                </button>

                <span style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: isSelected ? 'var(--accent-color)' : 'rgba(0,0,0,0.04)',
                  color: isSelected ? '#fff' : 'var(--text-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>
                  {i + 1}
                </span>

                <span style={{
                  width: 20, fontSize: 14, textAlign: 'center', flexShrink: 0,
                  opacity: el.visible ? 1 : 0.4,
                }}>
                  {TYPE_ICONS[el.type] || '?'}
                </span>

                <span style={{
                  flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  fontWeight: isSelected ? 600 : 400,
                  opacity: el.visible ? 1 : 0.4,
                }}>
                  {el.type === 'photo-slot' ? 'Photo' :
                   el.type === 'text' ? 'Text' :
                   el.type === 'sticker' ? 'Sticker' :
                   el.type === 'shape' ? 'Shape' : 'Background'}
                </span>

                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onBringForward(el.id); }}
                    disabled={isLast}
                    style={arrowBtnStyle(isLast)}
                    title="Bring forward"
                  >
                    ▲
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSendBackward(el.id); }}
                    disabled={isFirst}
                    style={arrowBtnStyle(isFirst)}
                    title="Send backward"
                  >
                    ▼
                  </button>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(el.id); }}
                  style={{
                    width: 20, height: 20, borderRadius: 4, border: 'none',
                    background: 'transparent', cursor: 'pointer', fontSize: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                    color: '#999', opacity: 0.5,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#e74c3c'; e.currentTarget.style.opacity = '1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#999'; e.currentTarget.style.opacity = '0.5'; }}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function arrowBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    width: 20,
    height: 20,
    borderRadius: 4,
    border: 'none',
    background: 'transparent',
    cursor: disabled ? 'default' : 'pointer',
    fontSize: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    color: disabled ? '#ddd' : 'var(--text-muted)',
    opacity: disabled ? 0.3 : 0.7,
  };
}
