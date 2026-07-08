// File: src/components/flow/SharedTemplateStep.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import { useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import TemplateList from '@/components/template/TemplateList';
import TemplateCard from '@/components/template/TemplateCard';
import type { TemplateData } from '@/lib/types';

interface SharedTemplateStepProps {
  templates: TemplateData[];
  loading: boolean;
  onSelect: (id: string, data?: TemplateData) => void;
  onBack?: () => void;
  title?: string;
  wrapperClassName?: string;
  headerClassName?: string;
  backButtonClassName?: string;
  headingClassName?: string;
  listClassName?: string;
}

// Shared template step renders a header and list of selectable template cards.
export default function SharedTemplateStep({
  templates,
  loading,
  onSelect,
  onBack,
  title = 'Pilih Frame',
  wrapperClassName,
  headerClassName,
  backButtonClassName,
  headingClassName,
  listClassName,
}: SharedTemplateStepProps) {
  // When the user clicks a template card, forward the selection to the parent flow.
  const handleCardClick = useCallback((template: TemplateData) => {
    onSelect(template.templateId, template);
  }, [onSelect]);

  return (
    <div className={wrapperClassName}>
      <div className={headerClassName}>
        {onBack ? (
          <button type="button" className={backButtonClassName} onClick={onBack}>
            <ArrowLeft size={18} />
          </button>
        ) : null}
        <h1 className={headingClassName}>{title}</h1>
      </div>
      <TemplateList
        templates={templates}
        loading={loading}
        emptyMessage="No templates available"
        listClassName={listClassName}
        renderTemplate={(template) => (
          <TemplateCard key={template._id || template.templateId} template={template} onSelect={handleCardClick} />
        )}
      />
    </div>
  );
}
