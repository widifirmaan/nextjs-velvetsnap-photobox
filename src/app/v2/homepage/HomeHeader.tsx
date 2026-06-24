'use client';
import { useEffect, useState } from 'react';
import styles from '../page.module.css';

function splitTitle(appName: string): [string, string] {
  let caps = 0;
  for (let i = 0; i < appName.length; i++) {
    if (appName[i] >= 'A' && appName[i] <= 'Z') caps++;
    if (caps === 2) return [appName.slice(0, i), appName.slice(i)];
  }
  const mid = Math.ceil(appName.length / 2);
  return [appName.slice(0, mid), appName.slice(mid)];
}

export default function HomeHeader({ appName, location, navItems, tagline }: {
  appName?: string; location?: string; navItems?: { label: string; url: string }[]; tagline?: string;
}) {
  const [time, setTime] = useState('');
  const [today, setToday] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const now = new Date();
    setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setToday(now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    setMounted(true);

    const id = setInterval(() => {
      const n = new Date();
      setTime(n.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const [accent, rest] = splitTitle(appName || 'VelvetSnap');

  return (
    <div className={styles.newspaperHeader}>
      <div className={styles.mastheadMeta}>
        <span>{mounted ? time : '--:--:--'}</span>
        <span>{mounted ? today : ''}</span>
        <span>{(location || 'Jakarta')} — Edition</span>
      </div>
      <div className={styles.mastheadRule} />
      <h1 className={styles.mastheadTitle}>
        <span className={styles.mastheadAccent}>{accent}</span>{rest}
      </h1>
      <p className={styles.mastheadTagline}>
        {tagline || 'The photobooth that freezes time'}
      </p>
      <div className={styles.mastheadRule} />
      <div className={styles.mastheadMeta}>
        <span>Price Rp 35.000</span>
        <span>Est. 2024</span>
        <span className={styles.navItems}>
          {(navItems || []).map((item, i) => (
            <a key={i} href={item.url} className={styles.mastheadLink}>{item.label}</a>
          ))}
        </span>
      </div>
    </div>
  );
}
