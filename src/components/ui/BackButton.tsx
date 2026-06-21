'use client';
import { ArrowLeft } from 'lucide-react';

interface Props {
  onClick: () => void;
  iconOnly?: boolean;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const btnStyle: React.CSSProperties = {
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
  cursor: 'pointer',
  color: '#262626',
  fontSize: 13,
  fontWeight: 500,
  flexShrink: 0,
};

const roundStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '50%',
  transition: 'background 0.15s',
};

const textStyle: React.CSSProperties = {
  padding: '10px 16px',
  border: '1px solid #e0e0e0',
  borderRadius: 12,
  background: '#fff',
  transition: 'background 0.15s',
};

export default function BackButton({ onClick, iconOnly, label = 'Back', className, disabled }: Props) {
  return (
    <button
      className={className}
      style={iconOnly ? { ...btnStyle, ...roundStyle } : { ...btnStyle, ...textStyle }}
      onClick={onClick}
      disabled={disabled}
    >
      <ArrowLeft size={iconOnly ? 18 : 16} />
      {!iconOnly && label}
    </button>
  );
}
