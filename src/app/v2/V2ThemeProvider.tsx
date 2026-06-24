'use client';
import { useEffect, useState } from 'react';
import { vintageAccent } from '@/lib/vintage-theme';

const defaultVars: Record<string, string> = {
  '--font-heading': 'var(--font-unifraktur, UnifrakturMaguntia, serif)',
  '--font-body': 'var(--font-ebgaramond, EB Garamond, Georgia, serif)',
  '--np-bg': '#f5f0e8',
  '--np-card': '#faf6ef',
  '--np-text': '#1a1a1a',
  '--np-text-secondary': '#4a4a4a',
  '--np-text-muted': '#8a8a8a',
  '--np-border': '#1a1a1a',
  '--np-accent': '#c73e3e',
  '--np-accent-hover': '#a83232',
  '--np-gold': '#d4a017',
  '--np-shadow': '6px 6px 0px #1a1a1a',
  '--np-shadow-sm': '3px 3px 0px #1a1a1a',
  '--np-radius': '0px',
  '--np-radius-sm': '0px',
};

export default function V2ThemeProvider({ children }: { children: React.ReactNode }) {
  const [vars, setVars] = useState(defaultVars);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const ac = data.data?.system?.accentColor as string | undefined;
          if (ac) {
            const { accent, accentHover } = vintageAccent(ac);
            setVars(prev => ({ ...prev, '--np-accent': accent, '--np-accent-hover': accentHover }));
          }
        }
      })
      .catch(() => {});
  }, []);

  return <div style={vars as React.CSSProperties}>{children}</div>;
}
