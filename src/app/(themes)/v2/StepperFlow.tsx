// File: src/app/(themes)/v2/StepperFlow.tsx
// Description: Auto-added top comment for easier file identification.

'use client';
import SharedStepperFlow from '@/components/flow/SharedStepperFlow';
import { TEMPLATE_CONFIGS } from './types';
import styles from './page.module.css';
import StepperBar from './StepperBar';
import TemplateStep from './template/TemplateStep';
import BoothStep from './booth/component/BoothStep';
import EditorStep from './editor/EditorStep';
import PaymentStep from './payment/component/PaymentStep';
import ResultStep from './result/component/ResultStep';

export default function StepperFlow({ step, setStep, onRefresh, sessionTimer, onBackToHome }: {
  step: number; setStep: (s: number) => void; onRefresh?: () => void; sessionTimer: number; onBackToHome?: () => void;
}) {
  const stepBack = step === 1 ? (onBackToHome || (() => setStep(0)))
    : step === 2 ? (() => { setStep(1); })
    : step === 3 ? (() => setStep(2))
    : step === 4 ? (() => setStep(3))
    : undefined;

  const wrapScene = (inner: React.ReactNode) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <StepperBar current={step - 1} total={5} onBack={stepBack} />
      {inner}
    </div>
  );

  return (
    <SharedStepperFlow
      step={step}
      setStep={setStep}
      onRefresh={onRefresh}
      sessionTimer={sessionTimer}
      wrapperClassName={styles.stepPage}
      renderTemplateStep={(flow) => wrapScene(
        <TemplateStep templates={flow.cachedTemplates || []} loading={flow.templatesLoading} onSelect={flow.handleSelectTemplate} />
      )}
      renderBoothStep={(flow) => wrapScene(
        <BoothStep
          templateName={flow.templateData?.templateName || TEMPLATE_CONFIGS[flow.templateId || '']?.name || ''}
          slotsCount={flow.slotsCount}
          filledCount={flow.filledCount}
          captures={flow.captures}
          onAddCapture={flow.handleAddCapture}
          onDeleteCapture={flow.handleDeleteCapture}
          templateData={flow.templateData}
          keyedFrameImage={flow.keyedFrameImage}
          frameRatio={flow.frameRatio}
          stripLoading={flow.stripLoading}
          onNext={() => setStep(3)}
          onBack={() => { setStep(1); flow.setCaptures([]); }}
        />
      )}
      renderEditorStep={(flow) => wrapScene(
        <EditorStep
          captures={flow.captures}
          templateData={flow.templateData}
          keyedFrameImage={flow.keyedFrameImage}
          frameRatio={flow.frameRatio}
          photoAdjust={flow.photoAdjust}
          setPhotoAdjust={flow.setPhotoAdjust}
          selectedSlotIdx={flow.selectedSlotIdx}
          setSelectedSlotIdx={flow.setSelectedSlotIdx}
          selectedFilter="none"
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      renderPaymentStep={(flow) => wrapScene(
        <PaymentStep
          price={flow.price}
          paid={flow.paid}
          setPaid={flow.setPaid}
          errMsg={flow.errMsg}
          setErrMsg={flow.setErrMsg}
          captures={flow.captures}
          templateId={flow.templateId || 't1'}
          compositedImage={flow.compositedImage}
          onSuccess={flow.handlePaymentSuccess}
          onBack={() => setStep(3)}
        />
      )}
      renderResultStep={(flow) => wrapScene(
        <ResultStep
          compositedImage={flow.compositedImage}
          onHome={flow.startOver}
          txId={flow.txId}
        />
      )}
    />
  );
}
