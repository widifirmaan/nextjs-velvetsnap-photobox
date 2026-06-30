'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const V1Page = dynamic(() => import('./v1/page'), { ssr: false });
const V2Page = dynamic(() => import('./v2/page'), { ssr: false });

const pages: Record<string, React.ComponentType<any>> = {
  v1: V1Page,
  v2: V2Page,
};

export default function Page() {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((res) => {
        const t = res.data?.uiTheme;
        setTheme(t === 'v1' || t === 'v2' ? t : 'v1');
      })
      .catch(() => {
        setTheme('v1');
      });
  }, []);

  if (!theme) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: '#fff' }}>
        <div style={{ fontSize: 14, color: '#888' }}>Loading...</div>
      </div>
    );
  }

  const PageComponent = pages[theme] || V1Page;
  return <PageComponent />;
}
