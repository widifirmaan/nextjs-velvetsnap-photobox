'use client';

import styles from '@/app/page.module.css';

export default function SlotSelector({
  slotSources, selectedSlotIdx, setSelectedSlotIdx,
}: {
  slotSources: (string | undefined)[]; selectedSlotIdx: number; setSelectedSlotIdx: (v: number) => void;
}) {
  return (
    <div className={styles.editorSlotGrid}>
      {slotSources.map((src, idx) => (
        <button key={idx}
          className={`${styles.editorSlotThumb} ${selectedSlotIdx === idx ? styles.editorSlotThumbActive : ''}`}
          onClick={() => setSelectedSlotIdx(idx)}>
          {src ? (
            <img src={src} alt={`Slot ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span>{idx + 1}</span>
          )}
        </button>
      ))}
    </div>
  );
}
