// File: src/components/ui/LoadableImage.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import { useState } from 'react';
import Image from 'next/image';
import LoadingSpinner from './LoadingSpinner';
import type { CSSProperties } from 'react';

interface LoadableImageProps {
  src: string;
  alt: string;
  sizes?: string;
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
  className,
  wrapperClassName,
  style,
  wrapperStyle,
  onLoad,
  onError,
  fallback,
}: LoadableImageProps) {
  const [hasLoaded, setHasLoaded] = useState(false);

  return (
    <div className={wrapperClassName} style={{ position: 'relative', width: '100%', height: '100%', ...wrapperStyle }}>
      {!hasLoaded && <LoadingSpinner className="image-loader" label={`Loading ${alt}`} />}
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={className}
          style={style}
          onLoadingComplete={() => {
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
