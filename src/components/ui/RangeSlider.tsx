// File: src/components/ui/RangeSlider.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

interface RangeSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  display?: string;
  containerClassName?: string;
  headerClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  inputClassName?: string;
}

export default function RangeSlider({
  label,
  value,
  min,
  max,
  onChange,
  display,
  containerClassName,
  headerClassName,
  labelClassName,
  valueClassName,
  inputClassName,
}: RangeSliderProps) {
  return (
    <div className={containerClassName}>
      <div className={headerClassName}>
        <span className={labelClassName}>{label}</span>
        <span className={valueClassName}>{display ?? value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={inputClassName}
      />
    </div>
  );
}
