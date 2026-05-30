'use client';

import { Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/templates');
  };

  return (
    <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className={`glass-panel ${styles.heroCard}`}>
        <div className={styles.iconWrapper}>
          <Camera size={48} color="var(--accent-color)" />
        </div>
        <h1 className="title">Photo Booth</h1>
        <p className="subtitle">Capture your best moments with vintage aesthetics</p>
        
        <button className="mac-button" onClick={handleStart} style={{ padding: '16px 32px', fontSize: '20px', borderRadius: '12px', marginTop: '16px' }}>
          <Camera size={24} />
          Start Session
        </button>
      </div>
    </div>
  );
}
