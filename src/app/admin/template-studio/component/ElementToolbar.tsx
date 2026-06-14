'use client';

import type { IStripElement } from '@/models/Template';
import styles from './ElementToolbar.module.css';

interface ElementToolbarProps {
  onAdd: (type: IStripElement['type']) => void;
  disabled?: boolean;
}

const TOOLS: { type: IStripElement['type']; label: string; icon: string }[] = [
  { type: 'text', label: 'Text', icon: 'Aa' },
  { type: 'sticker', label: 'Image', icon: '🖼' },
];

export default function ElementToolbar({ onAdd, disabled }: ElementToolbarProps) {
  return (
    <aside className="toolbar">
      <h3 className="section-heading">Elements</h3>
      <div className={styles.toolWrap}>
        {TOOLS.map((t) => (
          <button
            key={t.type}
            onClick={() => onAdd(t.type)}
            disabled={disabled}
            className={`${styles.toolBtn} ${disabled ? styles.toolBtnDisabled : styles.toolBtnEnabled}`}
          >
            <span className={`${styles.toolBtnIcon} ${t.type === 'text' ? styles.iconText : styles.iconImage}`}>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
