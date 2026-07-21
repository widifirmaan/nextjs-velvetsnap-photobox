'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        const uiTheme = data.data?.uiTheme || 'v1';
        const theme = /^v\d+$/.test(uiTheme) ? uiTheme : 'v1';
        router.replace(`/${theme}`);
      })
      .catch(() => router.replace('/v1'));
  }, [router]);

  return null;
}
