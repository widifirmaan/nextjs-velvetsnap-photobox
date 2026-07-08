// File: src/components/ui/SlotDots.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import type { CSSProperties, MouseEventHandler } from 'react';

export default function SlotDots({
  count,
  className,
  dotClassName,
  style,
}: {
  count: number;
  className?: string;
  dotClassName?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={className} style={style} aria-hidden="true">
      {Array.from({ length: Math.max(0, count) }).map((_, index) => (
        <span key={index} className={dotClassName} />
      ))}
    </div>
  );
}
