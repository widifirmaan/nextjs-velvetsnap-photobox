'use client';

import { useState, useEffect } from 'react';
import { Trash2, Loader2, ExternalLink } from 'lucide-react';
import { AdminPageHeader, AdminTableCard, AdminConfirmModal } from '@/app/admin/components';
import styles from './page.module.css';

interface TemplateData {
  _id: string;
  templateId: string;
  templateName: string;
  templateDesc: string;
  templatePrice: number;
  isActive: boolean;
  templateFull?: string;
  templateThumb?: string;
  templateData?: {
    canvasWidth?: number;
    canvasHeight?: number;
    elements?: any[];
    color?: string;
    slots?: number;
  };
}

export default function TemplatesAdmin() {
  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/templates/list', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setTemplates(data.data || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTarget(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/templates/${deleteTarget}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(res.statusText);
      setDeleteTarget(null);
      const removedId = deleteTarget;
      setTemplates((prev) => prev.filter((t) => t._id !== removedId));
      fetchTemplates();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleteLoading(false);
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
    <div className="page-stack">
      <AdminPageHeader
        title="Templates"
        subtitle="Manage photobooth templates and frames"
      />

      <AdminTableCard>
        {loading ? (
          <div className={styles.loader}><Loader2 className="spin" size={32} /></div>
        ) : (
          <div className={styles.responsiveTable}><table className="admin-table">
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
                        <span className="text-muted-sm">—</span>
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
                    <div className="flex-row flex-row-sm">
                      <a href={`/admin/template-studio?edit=${t._id}`} className="icon-btn" title="Edit in Strips Studio">
                        <ExternalLink size={18} color="var(--accent-color)" />
                      </a>
                      <button className="icon-btn icon-btn-danger" onClick={() => handleDelete(t._id)} title="Delete template">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr>
                  <td colSpan={8} className={styles.emptyCell}>
                    No templates found. Create one in the Strips Studio.
                  </td>
                </tr>
              )}
            </tbody>
          </table></div>
        )}
      </AdminTableCard>

      <AdminConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Template?"
        message="Apakah anda yakin ingin menghapus template ini?"
        confirmLabel="Hapus"
        loading={deleteLoading}
        variant="danger"
      />
    </div>
  );
}
