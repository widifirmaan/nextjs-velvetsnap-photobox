'use client';
import { Download, RefreshCcw } from 'lucide-react';
import styles from '../../page.module.css';

export default function ResultActions({ onDownload, onStartOver }: {
  onDownload: () => void; onStartOver: () => void;
}) {
  return (
    <div className={styles.resultActions}>
      <button className={`${styles.boothBtn} ${styles.boothBtnPrimary}`} onClick={onDownload}>
        <Download size={16} /> DOWNLOAD
      </button>
      <button className={styles.boothBtn} onClick={onStartOver}>
        <RefreshCcw size={16} /> NEW SESSION
      </button>
    </div>
  );
}
