'use client';

import type { IStripElement } from '@/models/Template';

interface ElementToolbarProps {
  onAdd: (type: IStripElement['type']) => void;
}

const TOOLS: { type: IStripElement['type']; label: string; icon: string }[] = [
  { type: 'text', label: 'Text', icon: 'Aa' },
  { type: 'sticker', label: 'Image', icon: '🖼' },
];

export default function ElementToolbar({ onAdd }: ElementToolbarProps) {
  return (
    <aside className="toolbar">
      <h3 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>Elements</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {TOOLS.map((t) => (
          <button
            key={t.type}
            onClick={() => onAdd(t.type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid var(--mn-border)',
              background: 'var(--clay-bg)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-primary)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-color)'; e.currentTarget.style.background = 'var(--accent-bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--mn-border)'; e.currentTarget.style.background = 'var(--clay-bg)'; }}
          >
            <span style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'var(--accent-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: t.type === 'text' ? 12 : 16,
              fontWeight: 700,
              color: 'var(--accent-color)',
            }}>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
