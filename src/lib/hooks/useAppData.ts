// File: src/lib/hooks/useAppData.ts
// Description: Auto-added top comment for easier file identification.

'use client';
import { useEffect, useRef, useState } from 'react';
import { STORAGE_KEYS } from './constants';
import type { StripResult } from '@/lib/types';

export interface AppData {
  sessionTimer: number;
  appName: string;
  appTagline: string;
  heroSubtitle: string;
  heroImage: string;
  cardHtml: string;
  navItems: { label: string; url: string }[];
  location: string;
  footerText: string;
  strips: StripResult[];
  loaded: boolean;
}

export function useAppData(): AppData {
  const [sessionTimer, setSessionTimer] = useState(600);
  const [appName, setAppName] = useState('VelvetSnap');
  const [appTagline, setAppTagline] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [cardHtml, setCardHtml] = useState('');
  const [navItems, setNavItems] = useState<{ label: string; url: string }[]>([]);
  const [location, setLocation] = useState('');
  const [footerText, setFooterText] = useState('');
  const [strips, setStrips] = useState<StripResult[]>([]);
  const [loaded, setLoaded] = useState(false);
  const pendingRef = useRef(2);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEYS.PHOTOBOOTH_SESSION);
      if (!stored) sessionStorage.setItem(STORAGE_KEYS.PHOTOBOOTH_SESSION, `session_${Date.now()}`);
    } catch {}

    const tryDone = () => {
      pendingRef.current--;
      if (pendingRef.current <= 0) setLoaded(true);
    };

    fetch('/api/settings').then(r => r.json()).then(data => {
      if (data.success && data.data) {
        if (data.data.system) setSessionTimer(data.data.system.sessionTimer || 600);
        if (data.data.appName) setAppName(data.data.appName);
        if (data.data.appTagline) setAppTagline(data.data.appTagline);
        if (data.data.heroSubtitle) setHeroSubtitle(data.data.heroSubtitle);
        if (data.data.header?.location) setLocation(data.data.header.location);
        if (data.data.header?.navItems) {
          try { setNavItems(JSON.parse(data.data.header.navItems)); } catch {}
        }
        if (data.data.slideshowImages?.length) {
          setHeroImage(data.data.slideshowImages[0]);
        }
        if (data.data.cardSmallHtml) setCardHtml(data.data.cardSmallHtml);
        if (data.data.footer?.text) setFooterText(data.data.footer.text);
      }
    }).catch(() => {}).finally(tryDone);

    fetch('/api/transactions/strips').then(r => r.json()).then(data => {
      if (data.success && Array.isArray(data.data)) {
        setStrips(data.data.slice(0, 10));
      }
    }).catch(() => {}).finally(tryDone);

    // Preload templates like v1: cache in sessionStorage + global promise
    const tmplPromise = fetch('/api/templates/list').then(r => r.json());
    // @ts-expect-error global shared promise for StepperFlow
    if (typeof window !== 'undefined') window.__templatePromise = tmplPromise;
    try { sessionStorage.removeItem(STORAGE_KEYS.TEMPLATES); } catch {}
    tmplPromise.then(res => {
      if (res.success && res.data?.length) {
        const list = res.data;
        try { sessionStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(list)); } catch {}
      }
    }).catch((e) => { console.error('preload templates failed', e); });
  }, []);

  return {
    sessionTimer, appName, appTagline, heroSubtitle, heroImage,
    cardHtml, navItems, location, footerText, strips, loaded,
  };
}
