'use client';
import { usePhotoboothFlow } from '@/lib/usePhotoboothFlow';
import styles from './page.module.css';
import StepperBar from './StepperBar';
import TemplateStep from './template/TemplateStep';
import BoothStep from './booth/component/BoothStep';
import EditorStep from './editor/EditorStep';
import PaymentStep from './payment/component/PaymentStep';
import ResultStep from './result/component/ResultStep';

export default function StepperFlow({ step, setStep, onRefresh, sessionTimer, appName, onBackToHome }: {
  step: number; setStep: (s: number) => void; onRefresh?: () => void; sessionTimer: number; appName?: string; onBackToHome?: () => void;
}) {
  const f = usePhotoboothFlow({ step, setStep, onRefresh, sessionTimer });

  return (
    <div className={styles.stepPage}>
      <StepperBar current={step - 1} total={5}
        timer={sessionTimer > 0 && step > 0 && step < 5 ? f.formatTime(f.timeLeft) : undefined}
        onBack={
          step === 1 ? (onBackToHome || (() => setStep(0))) :
          step === 2 ? (() => { setStep(1); f.setCaptures([]); }) :
          step === 3 ? (() => setStep(2)) :
          step === 4 ? (() => setStep(3)) :
          undefined
        }
      />
      {f.errMsg && (
        <div style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: 'var(--np-card)', border: '3px solid var(--np-accent)', padding: '8px 16px', fontFamily: 'var(--font-body)', fontSize: 11, boxShadow: 'var(--np-shadow)' }}>
          {f.errMsg}
        </div>
      )}

      {step === 1 && (
        <TemplateStep
          templates={f.cachedTemplates || []}
          selectedId={f.templateId}
          onSelect={(id, data) => f.handleSelectTemplate(id, data)}
          loading={f.templatesLoading}
          appName={appName}
        />
      )}

      {step === 2 && (
        <BoothStep
          totalSlots={f.slotsCount}
          appName={appName}
          templateData={f.templateData}
          keyedFrameImage={f.keyedFrameImage}
          frameRatio={f.frameRatio}
          stripLoading={f.stripLoading}
          onCaptures={(caps) => caps.forEach((url, i) => f.handleAddCapture(url, i))}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <EditorStep
          captures={f.captures}
          templateData={f.templateData}
          keyedFrameImage={f.keyedFrameImage}
          frameRatio={f.frameRatio}
          photoAdjust={f.photoAdjust}
          setPhotoAdjust={f.setPhotoAdjust}
          selectedSlotIdx={f.selectedSlotIdx}
          setSelectedSlotIdx={f.setSelectedSlotIdx}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && !f.paid && (
        <PaymentStep
          price={f.price}
          captures={f.captures}
          onSuccess={f.handlePaymentSuccess}
          onBack={() => setStep(3)}
        />
      )}

      {(step === 5 || (step === 4 && f.paid)) && (
        <ResultStep
          image={f.compositedImage}
          orderId={f.txId || ''}
          onStartOver={f.startOver}
        />
      )}

      {(step === 4 && f.paid && f.stripLoading) && (
        <div className={styles.loadingScreen}>
          <div className={styles.paymentCard}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--np-text-muted)', marginBottom: 12 }}>RENDERING PHOTO...</div>
          </div>
        </div>
      )}
    </div>
  );
}
