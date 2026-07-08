// File: src/components/template/TemplateList.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import { type ReactNode } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { TemplateData } from '@/lib/types';

interface TemplateListProps {
  templates: TemplateData[];
  loading: boolean;
  emptyMessage?: string;
  listClassName?: string;
  renderTemplate: (template: TemplateData) => ReactNode;
}

export default function TemplateList({
  templates,
  loading,
  emptyMessage = 'No templates available',
  listClassName,
  renderTemplate,
}: TemplateListProps) {
  if (loading && templates.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--np-text-muted)' }}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  return <div className={listClassName}>{templates.map((template) => renderTemplate(template))}</div>;
}
