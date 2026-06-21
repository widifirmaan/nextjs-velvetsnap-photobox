'use client';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  variant: 'primary' | 'secondary';
  icon?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
}

const base: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  cursor: 'pointer', fontWeight: 600, fontSize: 14,
  transition: 'opacity 0.15s',
};

const variants: Record<string, React.CSSProperties> = {
  primary: {
    ...base,
    padding: '12px 20px',
    border: 'none',
    borderRadius: 12,
    background: '#262626',
    color: '#fff',
  },
  secondary: {
    ...base,
    padding: '10px 16px',
    border: '1px solid #e0e0e0',
    borderRadius: 12,
    background: '#fff',
    color: '#262626',
    fontWeight: 500,
    fontSize: 13,
  },
};

const disabledStyle: React.CSSProperties = {
  opacity: 0.35,
  cursor: 'default',
};

export default function Button({ variant, icon, onClick, disabled, loading, className, style, children }: Props) {
  return (
    <button
      className={className}
      style={{ ...variants[variant], ...(disabled ? disabledStyle : {}), ...style }}
      onClick={onClick}
      disabled={disabled}
    >
      {loading ? <Loader2 className="spin" size={22} /> : icon}
      {children}
    </button>
  );
}
