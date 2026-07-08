// File: src/lib/hooks/useThemeAccent.ts
// Description: Auto-added top comment for easier file identification.

'use client';
import { useEffect, useState } from 'react';
import { vintageAccent } from '@/lib/utils/vintage-theme';

export interface ThemeAccent {
  accent: string;
  accentHover: string;
}

export function useThemeAccent(fallbackAccent = '#c73e3e', fallbackHover = '#a83232'): ThemeAccent {
  const [accent, setAccent] = useState(fallbackAccent);
  const [accentHover, setAccentHover] = useState(fallbackHover);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const ac = data.data?.system?.accentColor;
          if (ac) {
            const result = vintageAccent(ac);
            setAccent(result.accent);
            setAccentHover(result.accentHover);
          }
        }
      })
      .catch(() => {});
  }, []);

  return { accent, accentHover };
}
