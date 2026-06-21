'use client';
import { Loader2 } from 'lucide-react';

interface Props {
  size?: number;
  overlay?: boolean;
  text?: string;
}

export default function LoadingSpinner({ size = 32, overlay, text }: Props) {
  if (overlay) {
    return (
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', zIndex: 5, gap: 8,
      }}>
        <Loader2 className="spin" size={size} />
        {text && <span style={{ color: '#888', fontSize: 13 }}>{text}</span>}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 }}>
      <Loader2 className="spin" size={size} />
      {text && <span style={{ color: '#888', fontSize: 13 }}>{text}</span>}
    </div>
  );
}
