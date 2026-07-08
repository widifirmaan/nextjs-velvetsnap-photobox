// File: src/components/ui/LoadingSpinner.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import { Loader2 } from 'lucide-react';
import type { CSSProperties } from 'react';

export default function LoadingSpinner({
  size = 28,
  className,
  style,
  label = 'Loading',
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  return (
    <div role="status" aria-label={label} className={className} style={style}>
      <Loader2 size={size} className="spin" />
    </div>
  );
}
