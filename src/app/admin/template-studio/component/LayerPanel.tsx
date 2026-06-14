'use client';

import type { IStripElement } from '@/models/Template';
import styles from './LayerPanel.module.css';

interface LayerPanelProps {
  elements: IStripElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onToggleVisibility: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
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
  disabled,
}: LayerPanelProps) {
  const sorted = [...elements]
    .filter((el) => el.type !== 'background')
    .sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h3 className="section-heading">
          Layers
        </h3>
      </div>

      <div className="grow scroll-y">
        {sorted.length === 0 ? (
          <p className={`text-muted-sm text-center ${styles.emptyState}`}>
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
                onClick={() => { if (!disabled) onSelect(el.id); }}
                className={styles.layerRow}
                style={{
                  cursor: disabled ? 'default' : 'pointer',
                  background: isSelected ? 'var(--accent-bg)' : 'transparent',
                  borderLeft: isSelected ? '3px solid var(--accent-color)' : '3px solid transparent',
                  opacity: disabled ? 0.5 : 1,
                }}
                onMouseEnter={(e) => { if (!isSelected && !disabled) e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
                onMouseLeave={(e) => { if (!isSelected && !disabled) e.currentTarget.style.background = 'transparent'; }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); if (!disabled) onToggleVisibility(el.id); }}
                  disabled={disabled}
                  className={styles.visToggle}
                  style={{
                    cursor: disabled ? 'default' : 'pointer',
                    opacity: disabled ? 0.2 : el.visible ? 0.6 : 0.25,
                  }}
                  title={el.visible ? 'Hide' : 'Show'}
                >
                  {el.visible ? '👁' : '👁‍🗨'}
                </button>

                <span className={styles.indexBadge}
                  style={{
                    background: isSelected ? 'var(--accent-color)' : 'rgba(0,0,0,0.04)',
                    color: isSelected ? '#fff' : 'var(--text-primary)',
                  }}
                >
                  {i + 1}
                </span>

                <span className={styles.typeIcon}
                  style={{ opacity: el.visible ? 1 : 0.4 }}
                >
                  {TYPE_ICONS[el.type] || '?'}
                </span>

                <span className="grow text-ellipsis"
                  style={{
                    fontWeight: isSelected ? 600 : 400,
                    opacity: el.visible ? 1 : 0.4,
                  }}
                >
                  {el.type === 'photo-slot' ? 'Photo' :
                   el.type === 'text' ? 'Text' :
                   el.type === 'sticker' ? 'Sticker' :
                   el.type === 'shape' ? 'Shape' : 'Background'}
                </span>

                <div className={styles.layerActions}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onBringForward(el.id); }}
                    disabled={isLast || disabled}
                    className={styles.layerBtn}
                    style={{
                      fontSize: 9,
                      cursor: isLast || disabled ? 'default' : 'pointer',
                      color: isLast || disabled ? '#ddd' : 'var(--text-muted)',
                      opacity: isLast || disabled ? 0.3 : 0.7,
                    }}
                    title="Bring forward"
                  >
                    ▲
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSendBackward(el.id); }}
                    disabled={isFirst || disabled}
                    className={styles.layerBtn}
                    style={{
                      fontSize: 9,
                      cursor: isFirst || disabled ? 'default' : 'pointer',
                      color: isFirst || disabled ? '#ddd' : 'var(--text-muted)',
                      opacity: isFirst || disabled ? 0.3 : 0.7,
                    }}
                    title="Send backward"
                  >
                    ▼
                  </button>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); if (!disabled) onDelete(el.id); }}
                  disabled={disabled}
                  className={styles.layerBtn}
                  style={{
                    fontSize: 12,
                    cursor: disabled ? 'default' : 'pointer',
                    color: disabled ? '#ddd' : '#999',
                    opacity: disabled ? 0.2 : 0.5,
                  }}
                  onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.color = '#e74c3c'; e.currentTarget.style.opacity = '1'; } }}
                  onMouseLeave={(e) => { if (!disabled) { e.currentTarget.style.color = '#999'; e.currentTarget.style.opacity = '0.5'; } }}
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

