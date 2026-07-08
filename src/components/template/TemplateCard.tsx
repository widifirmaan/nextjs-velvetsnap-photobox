// File: src/components/template/TemplateCard.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import type { CSSProperties } from 'react';
import LoadableImage from '@/components/ui/LoadableImage';
import SlotDots from '@/components/ui/SlotDots';
import type { TemplateData } from '@/lib/types';

interface SharedTemplateCardProps {
  template: TemplateData;
  onSelect: (template: TemplateData) => void;
  keyedFrameUrl?: string;
  sizes?: string;
  buttonClassName?: string;
  buttonStyle?: CSSProperties;
  imageWrapperClassName?: string;
  imageClassName?: string;
  bodyClassName?: string;
  nameClassName?: string;
  descClassName?: string;
  metaClassName?: string;
  footerClassName?: string;
  priceClassName?: string;
  slotDotsClassName?: string;
  slotDotClassName?: string;
  fallback?: React.ReactNode;
}

export default function SharedTemplateCard({
  template,
  onSelect,
  keyedFrameUrl,
  sizes = '200px',
  buttonClassName,
  buttonStyle,
  imageWrapperClassName,
  imageClassName,
  bodyClassName,
  nameClassName,
  descClassName,
  metaClassName,
  footerClassName,
  priceClassName,
  slotDotsClassName,
  slotDotClassName,
  fallback,
}: SharedTemplateCardProps) {
  const imageSrc = keyedFrameUrl || template.templateFull || template.templateThumb || '';
  const slotCount = template.templateData?.slots || 1;

  return (
    <button
      type="button"
      className={buttonClassName}
      style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, ...buttonStyle }}
      onClick={() => onSelect(template)}
    >
      <div className={imageWrapperClassName} style={imageWrapperClassName ? undefined : { position: 'relative', width: '100%', minHeight: 200, background: '#f3f3f3' }}>
        <LoadableImage
          src={imageSrc}
          alt={template.templateName}
          sizes={sizes}
          wrapperClassName={imageWrapperClassName}
          className={imageClassName}
          fallback={fallback}
        />
      </div>
      <div className={bodyClassName}>
        <div className={nameClassName}>{template.templateName}</div>
        {template.templateDesc ? <div className={descClassName}>{template.templateDesc}</div> : null}
        <div className={footerClassName ?? metaClassName}>
          <div className={priceClassName}>Rp {(template.templatePrice || 0).toLocaleString('id-ID')}</div>
          <SlotDots count={slotCount} className={slotDotsClassName} dotClassName={slotDotClassName} />
        </div>
      </div>
    </button>
  );
}
