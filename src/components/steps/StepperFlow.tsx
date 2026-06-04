'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from '@/app/page.module.css';
import { composeFrameImage, removeGreenScreen } from '@/lib/canvas-utils';
import TemplateStep from './TemplateStep';
import BoothStep from './BoothStep';
import EditorStep from './EditorStep';
import PaymentStep from './PaymentStep';
import ResultStep from './ResultStep';
import type { TemplateData, PhotoAdjust } from './types';
import { TEMPLATE_CONFIGS } from './types';

export default function StepperFlow({ step, setStep, allTemplates }: {
  step: number; setStep: (s: number) => void; allTemplates: TemplateData[];
}) {
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);
  const [captures, setCaptures] = useState<string[]>([]);
  const [photoAdjust, setPhotoAdjust] = useState<PhotoAdjust[]>([]);
  const [selectedSlotIdx, setSelectedSlotIdx] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [keyedFrameImage, setKeyedFrameImage] = useState('');
  const [frameRatio, setFrameRatio] = useState(2 / 3);
  const [compositedImage, setCompositedImage] = useState<string | null>(null);
  const [price, setPrice] = useState(35000);
  const [paid, setPaid] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  const handleSelectTemplate = useCallback((id: string) => {
    setTemplateId(id);
    setStep(2);
  }, [setStep]);

  useEffect(() => {
    if (!templateId) return;
    fetch('/api/templates')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const matched = data.data.find((t: any) => t.templateId === templateId);
          if (matched) {
            setTemplateData(matched);
            setPrice(matched.price || 35000);
            if (matched.frameImage) {
              removeGreenScreen(matched.frameImage).then((keyed) => {
                setKeyedFrameImage(keyed);
                const img = new window.Image();
                img.onload = () => setFrameRatio(img.naturalWidth / img.naturalHeight);
                img.src = keyed;
              });
            }
          } else {
            const fallback = TEMPLATE_CONFIGS[templateId];
            if (fallback) {
              setTemplateData({ templateId, name: fallback.name, slots: fallback.slots, price: 35000, color: '#ffffff' } as TemplateData);
            }
          }
        }
      })
      .catch(() => {});
  }, [templateId]);

  const handleAddCapture = useCallback((url: string) => {
    setCaptures((prev) => {
      const idx = prev.findIndex((c) => c === '');
      if (idx !== -1) { const n = [...prev]; n[idx] = url; return n; }
      return [...prev, url];
    });
  }, []);

  const handleDeleteCapture = (idx: number) => {
    setCaptures((prev) => { const n = [...prev]; n[idx] = ''; return n; });
  };

  useEffect(() => {
    setPhotoAdjust(captures.map(() => ({ scale: 1, x: 0, y: 0, brightness: 100, contrast: 100, saturation: 100, temperature: 0, sharpen: 0 })));
  }, [captures]);

  useEffect(() => {
    if (!captures.length || !templateData?.slotsLayout?.length) return;
    const frameSrc = keyedFrameImage || templateData.frameImage || '';
    if (!frameSrc) return;
    composeFrameImage(frameSrc, templateData.slotsLayout, captures, photoAdjust, templateData.color || '#ffffff')
      .then(setCompositedImage)
      .catch(() => {});
  }, [captures, photoAdjust, templateData, keyedFrameImage]);

  const slotsCount = templateData?.slots || TEMPLATE_CONFIGS[templateId || '']?.slots || 3;
  const filledCount = useMemo(() => captures.filter((c) => c !== '').length, [captures]);

  const startOver = () => { setStep(0); setCaptures([]); setTemplateId(null); setTemplateData(null); setCompositedImage(null); setPaid(false); setErrMsg(null); };

  if (step === 1) return <div className={styles.stepTransition}><TemplateStep templates={allTemplates} onSelect={handleSelectTemplate} onBack={() => setStep(0)} /></div>;

  if (step === 2) return (
    <div className={styles.stepTransition}>
    <BoothStep
      templateId={templateId || 't1'}
      templateName={templateData?.name || TEMPLATE_CONFIGS[templateId || '']?.name || ''}
      slotsCount={slotsCount}
      filledCount={filledCount}
      captures={captures}
      onAddCapture={handleAddCapture}
      onDeleteCapture={handleDeleteCapture}
      templateData={templateData}
      keyedFrameImage={keyedFrameImage}
      frameRatio={frameRatio}
      onNext={() => setStep(3)}
      onBack={() => { setStep(1); setCaptures([]); }}
    />
    </div>
  );

  if (step === 3) return (
    <div className={styles.stepTransition}>
    <EditorStep
      captures={captures}
      templateData={templateData}
      keyedFrameImage={keyedFrameImage}
      frameRatio={frameRatio}
      photoAdjust={photoAdjust}
      setPhotoAdjust={setPhotoAdjust}
      selectedSlotIdx={selectedSlotIdx}
      setSelectedSlotIdx={setSelectedSlotIdx}
      selectedFilter={selectedFilter}
      setSelectedFilter={setSelectedFilter}
      onNext={() => setStep(4)}
      onBack={() => setStep(2)}
    />
    </div>
  );

  if (step === 4) return (
    <div className={styles.stepTransition}>
    <PaymentStep
      price={price}
      paid={paid}
      setPaid={setPaid}
      errMsg={errMsg}
      setErrMsg={setErrMsg}
      captcha={captures}
      templateId={templateId || 't1'}
      compositedImage={compositedImage}
      onSuccess={(id) => { setTxId(id); setStep(5); }}
      onBack={() => setStep(3)}
    />
    </div>
  );

  if (step === 5) return (
    <div className={styles.stepTransition}>
      <ResultStep
        compositedImage={compositedImage}
        onHome={startOver}
      />
    </div>
  );

  return null;
}
