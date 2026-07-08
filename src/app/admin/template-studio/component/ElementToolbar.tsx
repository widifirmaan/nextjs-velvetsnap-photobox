// File: src/app/admin/template-studio/component/ElementToolbar.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import { Type, Image } from 'lucide-react';
import type { IStripElement } from '@/models/Template';
import styles from './ElementToolbar.module.css';

interface ElementToolbarProps {
  onAdd: (type: IStripElement['type']) => void;
  disabled?: boolean;
}

const TOOLS: { type: IStripElement['type']; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Text', icon: <Type size={20} /> },
  { type: 'sticker', label: 'Image', icon: <Image size={20} /> },
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
            <span className={styles.toolBtnIcon}>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
