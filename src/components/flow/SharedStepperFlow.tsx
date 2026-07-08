// File: src/components/flow/SharedStepperFlow.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import { Timer } from 'lucide-react';
import { usePhotoboothFlow, type PhotoboothFlowResult } from '@/lib/hooks/usePhotoboothFlow';
import type { ReactNode } from 'react';

interface SharedStepperFlowProps {
  step: number;
  setStep: (step: number) => void;
  sessionTimer: number;
  onRefresh?: () => void;
  wrapperClassName?: string;
  contentClassName?: string;
  renderTemplateStep: (flow: PhotoboothFlowResult) => ReactNode;
  renderBoothStep: (flow: PhotoboothFlowResult) => ReactNode;
  renderEditorStep: (flow: PhotoboothFlowResult) => ReactNode;
  renderPaymentStep: (flow: PhotoboothFlowResult) => ReactNode;
  renderResultStep: (flow: PhotoboothFlowResult) => ReactNode;
}

export default function SharedStepperFlow({
  step,
  setStep,
  sessionTimer,
  onRefresh,
  wrapperClassName,
  contentClassName,
  renderTemplateStep,
  renderBoothStep,
  renderEditorStep,
  renderPaymentStep,
  renderResultStep,
}: SharedStepperFlowProps) {
  const flow = usePhotoboothFlow({ step, setStep, onRefresh, sessionTimer });

  const timerBadge = (step >= 1 && step <= 5 && sessionTimer > 0 && flow.timeLeft > 0) ? (
    <div
      role="timer"
      aria-label={`Session time remaining: ${flow.formatTime(flow.timeLeft)}`}
      style={{
        position: 'fixed', top: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 100,
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 8,
        background: 'rgba(0,0,0,0.6)', color: '#fff',
        fontSize: 13, fontWeight: 600, fontFamily: 'monospace',
        letterSpacing: 0.5, backdropFilter: 'blur(4px)',
      }}
    >
      <Timer size={14} />
      {flow.formatTime(flow.timeLeft)}
    </div>
  ) : null;

  let content: ReactNode | null = null;

  if (step === 1) content = renderTemplateStep(flow);
  if (step === 2) content = renderBoothStep(flow);
  if (step === 3) content = renderEditorStep(flow);
  if (step === 4) content = renderPaymentStep(flow);
  if (step === 5) content = renderResultStep(flow);

  if (!content) return null;

  return (
    <div className={wrapperClassName} aria-label="Photobooth stepper">
      {timerBadge}
      <div className={contentClassName}>{content}</div>
    </div>
  );
}
