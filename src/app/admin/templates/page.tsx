'use client';

import { useState, useEffect } from 'react';
import { Edit2, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { AdminPageHeader, AdminTableCard } from '@/app/admin/components';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

interface TemplateData {
  _id: string;
  templateId: string;
  templateName: string;
  templateDesc: string;
  slots: number;
  templatePrice: number;
  color: string;
  isActive: boolean;
  type?: 'frame' | 'strip';
  templateFull?: string;
  templateThumb?: string;
  templateData?: {
    canvasWidth?: number;
    canvasHeight?: number;
    elements?: any[];
  };
}

export default function TemplatesAdmin() {
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (data.success) setTemplates(data.data || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (t: TemplateData) => {
    sessionStorage.setItem('stripTemplateData', JSON.stringify(t));
    router.push(`/admin/template-studio?edit=${t._id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      fetchTemplates();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleToggleActive = async (t: TemplateData) => {
    try {
      await fetch(`/api/templates/${t._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !t.isActive }),
      });
      fetchTemplates();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <AdminPageHeader
        title="Templates"
        subtitle="Manage photobooth templates and frames"
      />

      <AdminTableCard>
        {loading ? (
          <div className={styles.loader}><Loader2 className="spin" size={32} /></div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Preview</th>
                <th>ID</th>
                <th>Name</th>
                <th>Slots</th>
                <th>Price</th>
                <th>Color</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t._id}>
                  <td>
                    <div className={styles.templateThumb}>
                      {t.templateThumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.templateThumb} alt={t.templateName} />
                      ) : t.templateFull ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.templateFull} alt={t.templateName} />
                      ) : (
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>—</span>
                      )}
                    </div>
                  </td>
                  <td>{t.templateId}</td>
                  <td>{t.templateName}</td>
                  <td>{t.templateData?.slots || 1}</td>
                  <td>Rp {(t.templatePrice || 0).toLocaleString('id-ID')}</td>
                  <td><span className={styles.colorSwatch} style={{ backgroundColor: t.templateData?.color || '#000000' }} /></td>
                  <td>
                    <div className={styles.statusToggle}>
                      <button className={`${styles.toggleSwitch} ${t.isActive !== false ? styles.active : styles.inactive}`} onClick={() => handleToggleActive(t)} type="button">
                        <span className={styles.toggleKnob} />
                      </button>
                      <span className={`${styles.statusLabel} ${t.isActive !== false ? styles.active : styles.inactive}`}>
                        {t.isActive !== false ? 'Active' : 'Off'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionBtns}>
                      <button className={styles.iconBtn} onClick={() => handleEdit(t)} title="Edit in Strips Studio">
                        <ExternalLink size={18} color="var(--accent-color)" />
                      </button>
                      <button className={`${styles.iconBtn} ${styles.danger}`} onClick={() => handleDelete(t._id)} title="Delete template">
                        <Trash2 size={18} color="var(--danger-color)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                    No templates found. Create one in the Strips Studio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </AdminTableCard>
    </div>
  );
}
