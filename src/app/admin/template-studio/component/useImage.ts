'use client';

import { useEffect, useState } from 'react';

const imageCache = new Map<string, HTMLImageElement>();

export function useImage(url: string): [HTMLImageElement | undefined, 'loaded' | 'loading' | 'failed'] {
  const [state, setState] = useState<'loaded' | 'loading' | 'failed'>(
    url && imageCache.has(url) ? 'loaded' : url ? 'loading' : 'failed'
  );
  const [img, setImg] = useState<HTMLImageElement | undefined>(
    url ? imageCache.get(url) : undefined
  );

  useEffect(() => {
    if (!url) {
      setState('failed');
      setImg(undefined);
      return;
    }
    if (imageCache.has(url)) {
      setImg(imageCache.get(url));
      setState('loaded');
      return;
    }
    let cancelled = false;
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      if (cancelled) return;
      imageCache.set(url, image);
      setImg(image);
      setState('loaded');
    };
    image.onerror = () => {
      if (cancelled) return;
      setState('failed');
    };
    image.src = url;
    return () => { cancelled = true; };
  }, [url]);

  return [img, state];
}
