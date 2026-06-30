'use client';
import { Timer } from 'lucide-react';
import styles from '@/app/main/page.module.css';
import { usePhotoboothFlow } from '@/lib/usePhotoboothFlow';
import { TEMPLATE_CONFIGS } from './types';
import TemplateStep from './template/TemplateStep';
import BoothStep from './booth/component/BoothStep';
import EditorStep from './editor/EditorStep';
import PaymentStep from './payment/component/PaymentStep';
import ResultStep from './result/component/ResultStep';

export default function StepperFlow({ step, setStep, onRefresh, sessionTimer }: {
  step: number; setStep: (s: number) => void; onRefresh?: () => void; sessionTimer: number;
}) {
  const f = usePhotoboothFlow({ step, setStep, onRefresh, sessionTimer });
  const selectedFilter = 'none';

  const timerBadge = (step >= 1 && step <= 5 && sessionTimer > 0 && f.timeLeft > 0) ? (
    <div role="timer" aria-label={`Session time remaining: ${f.formatTime(f.timeLeft)}`} style={{
      position:'fixed', top:8, left:'50%', transform:'translateX(-50%)', zIndex:100,
      display:'flex', alignItems:'center', gap:6,
      padding:'6px 14px', borderRadius:8,
      background:'rgba(0,0,0,0.6)', color:'#fff',
      fontSize:13, fontWeight:600, fontFamily:'monospace',
      letterSpacing:0.5, backdropFilter:'blur(4px)',
    }}>
      <Timer size={14} />
      {f.formatTime(f.timeLeft)}
    </div>
  ) : null;

  let content: React.ReactNode = null;

  if (step === 1) content = (
    <TemplateStep templates={f.cachedTemplates || []} loading={f.templatesLoading} onSelect={f.handleSelectTemplate} onBack={() => setStep(0)} />
  );

  if (step === 2) content = (
    <BoothStep
      templateName={f.templateData?.templateName || TEMPLATE_CONFIGS[f.templateId || '']?.name || ''}
      slotsCount={f.slotsCount}
      filledCount={f.filledCount}
      captures={f.captures}
      onAddCapture={f.handleAddCapture}
      onDeleteCapture={f.handleDeleteCapture}
      templateData={f.templateData}
      keyedFrameImage={f.keyedFrameImage}
      frameRatio={f.frameRatio}
      stripLoading={f.stripLoading}
      onNext={() => setStep(3)}
      onBack={() => { setStep(1); f.setCaptures([]); }}
    />
  );

  if (step === 3) content = (
    <EditorStep
      captures={f.captures}
      templateData={f.templateData}
      keyedFrameImage={f.keyedFrameImage}
      frameRatio={f.frameRatio}
      photoAdjust={f.photoAdjust}
      setPhotoAdjust={f.setPhotoAdjust}
      selectedSlotIdx={f.selectedSlotIdx}
      setSelectedSlotIdx={f.setSelectedSlotIdx}
      selectedFilter={selectedFilter}
      onNext={() => setStep(4)}
      onBack={() => setStep(2)}
    />
  );

  if (step === 4) content = (
    <PaymentStep
      price={f.price}
      paid={f.paid}
      setPaid={f.setPaid}
      errMsg={f.errMsg}
      setErrMsg={f.setErrMsg}
      captures={f.captures}
      templateId={f.templateId || 't1'}
      compositedImage={f.compositedImage}
      onSuccess={f.handlePaymentSuccess}
      onBack={() => setStep(3)}
    />
  );

  if (step === 5) content = (
    <ResultStep
      compositedImage={f.compositedImage}
      onHome={f.startOver}
      txId={f.txId}
    />
  );

  if (!content) return null;

  return (
    <div aria-label="Photobooth stepper">
      {timerBadge}
      <div className={styles.stepTransition} style={timerBadge ? { paddingTop: 48 } : undefined}>{content}</div>
    </div>
  );
}
