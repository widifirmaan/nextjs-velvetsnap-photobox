'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function DownloadRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  useEffect(() => {
    const target = `/download?id=${id ? encodeURIComponent(id) : ''}`;
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        const uiTheme = data.data?.uiTheme || 'v1';
        const theme = /^v\d+$/.test(uiTheme) ? uiTheme : 'v1';
        router.replace(`/${theme}${target}`);
      })
      .catch(() => router.replace(`/v1${target}`));
  }, [router, id]);

  return null;
}

export default function DownloadPage() {
  return <Suspense fallback={null}><DownloadRedirect /></Suspense>;
}
