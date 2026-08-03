// File: src/components/ui/LoadableImage.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import LoadingSpinner from './LoadingSpinner';
import type { CSSProperties } from 'react';

interface LoadableImageProps {
  src: string;
  alt: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  className?: string;
  wrapperClassName?: string;
  style?: CSSProperties;
  wrapperStyle?: CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  fallback?: React.ReactNode;
}

export default function LoadableImage({
  src,
  alt,
  sizes = '100vw',
  loading = 'lazy',
  fetchPriority = 'auto',
  className,
  wrapperClassName,
  style,
  wrapperStyle,
  onLoad,
  onError,
  fallback,
}: LoadableImageProps) {
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setHasLoaded(false);
  }, [src]);

  useEffect(() => {
    if (!src) return;
    const t = setTimeout(() => setHasLoaded(true), 12000);
    return () => clearTimeout(t);
  }, [src]);

  return (
    <div className={wrapperClassName} style={{ position: 'relative', width: '100%', height: '100%', ...wrapperStyle }}>
      {src && !hasLoaded && <LoadingSpinner className="image-loader" label={`Loading ${alt}`} />}
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={loading}
          fetchPriority={fetchPriority}
          className={className}
          style={style}
          onLoad={() => {
            setHasLoaded(true);
            onLoad?.();
          }}
          onError={() => {
            setHasLoaded(true);
            onError?.();
          }}
        />
      ) : (
        fallback ?? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: 12 }}>
            No preview available
          </div>
        )
      )}
    </div>
  );
}
