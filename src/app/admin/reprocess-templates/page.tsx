'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, Play } from 'lucide-react';
import { renderStripFrame, removeGreenScreen } from '@/lib/canvas-utils';
import type { IStripElement } from '@/models/Template';

const HI_RES_MULTIPLIER = 3;

interface TemplateItem {
  _id: string;
  templateId: string;
  templateName: string;
  templateFull?: string;
  templateData?: {
    elements?: IStripElement[];
    canvasWidth?: number;
    canvasHeight?: number;
    color?: string;
    type?: string;
    slots?: number;
  };
}

type Status = 'pending' | 'processing' | 'done' | 'error';

export default function ReprocessTemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);

  useEffect(() => {
    fetch('/api/templates/list')
      .then((r) => r.json())
      .then((res) => {
        const list = (res.success ? res.data : []) as TemplateItem[];
        const editable = list.filter((t) => t.templateData?.elements?.length);
        setTemplates(editable);
        const s: Record<string, Status> = {};
        for (const t of editable) s[t._id] = 'pending';
        setStatus(s);
      })
      .finally(() => setLoading(false));
  }, []);

  const processTemplate = async (t: TemplateItem) => {
    const td = t.templateData!;
    const elements = td.elements!;
    const cw = td.canvasWidth || 1000;
    const ch = td.canvasHeight || 3000;
    const color = td.color || '#ffffff';
    const maxW = cw * HI_RES_MULTIPLIER;

    try {
      setStatus((s) => ({ ...s, [t._id]: 'processing' }));

      // Step 1: Render template elements at high resolution
      const frameB64 = await renderStripFrame(elements, cw, ch, color, maxW);

      // Step 2: Remove green chroma key from photo slots
      const cleanB64 = await removeGreenScreen(frameB64, maxW);

      // Step 3: Upload to Cloudinary
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUri: cleanB64, folder: 'velvetsnap/templates' }),
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) throw new Error(uploadData.error || 'Upload failed');

      // Step 4: Update template with new templateFull URL
      const updateRes = await fetch(`/api/templates/${t._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateFull: uploadData.url,
          templateName: t.templateName,
          templateData: td,
        }),
      });
      const updateData = await updateRes.json();
      if (!updateData.success) throw new Error(updateData.error || 'Update failed');

      setStatus((s) => ({ ...s, [t._id]: 'done' }));
    } catch (err: any) {
      setStatus((s) => ({ ...s, [t._id]: 'error' }));
      setErrors((e) => ({ ...e, [t._id]: err.message }));
    }
  };

  const processAll = async () => {
    setRunning(true);
    for (const t of templates) {
      if (status[t._id] === 'done') continue;
      await processTemplate(t);
    }
    setRunning(false);
  };

  const countByStatus = (st: Status) =>
    Object.values(status).filter((s) => s === st).length;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 className="spin" size={32} />
      </div>
    );
  }

  if (!templates.length) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Reprocess Templates</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>
          No templates with editable elements found.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Reprocess Templates</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>
        Re-render all templates at {HI_RES_MULTIPLIER}x resolution ({templates.length} templates found, {countByStatus('done')} done, {countByStatus('error')} failed)
      </p>

      <button
        onClick={processAll}
        disabled={running}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 24px', borderRadius: 10, border: 'none',
          background: running ? '#ccc' : '#262626', color: '#fff',
          fontWeight: 700, fontSize: 14, cursor: running ? 'not-allowed' : 'pointer',
          marginBottom: 24,
        }}
      >
        {running ? <Loader2 className="spin" size={18} /> : <Play size={18} />}
        {running ? 'Processing...' : 'Process All'}
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {templates.map((t) => (
          <div
            key={t._id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 10,
              background: status[t._id] === 'error' ? '#fff5f5' : '#fff',
              border: '1px solid',
              borderColor: status[t._id] === 'error' ? '#fecaca' : 'var(--mn-border)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{t.templateName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {t.templateData?.canvasWidth}×{t.templateData?.canvasHeight} → {t.templateData?.canvasWidth! * HI_RES_MULTIPLIER}×{t.templateData?.canvasHeight! * HI_RES_MULTIPLIER}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {status[t._id] === 'pending' && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pending</span>
              )}
              {status[t._id] === 'processing' && <Loader2 className="spin" size={18} />}
              {status[t._id] === 'done' && <CheckCircle2 size={18} color="#16a34a" />}
              {status[t._id] === 'error' && (
                <span title={errors[t._id]}>
                  <XCircle size={18} color="#dc2626" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
