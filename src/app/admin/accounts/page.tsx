// File: src/app/admin/accounts/page.tsx
// Description: Auto-added top comment for easier file identification.

'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Key, User as UserIcon } from 'lucide-react';
import { AdminPageHeader, AdminTableCard, AdminConfirmModal, AdminModal } from '@/app/admin/components';
import { adminFetch } from '@/lib/utils/admin-fetch';
import styles from './page.module.css';

interface AccountItem {
  _id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [createErr, setCreateErr] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [resetPwTarget, setResetPwTarget] = useState<string | null>(null);
  const [resetPwVal, setResetPwVal] = useState('');
  const [resetPwErr, setResetPwErr] = useState('');
  const [resetPwLoading, setResetPwLoading] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/accounts');
      const data = await res.json();
      if (data.success) setAccounts(data.data || []);
    } catch (e) { console.error('fetchAccounts failed', e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleCreate = async () => {
    setCreateErr('');
    if (newUsername.trim().length < 2) { setCreateErr('Username minimal 2 karakter'); return; }
    if (newPassword.length < 4) { setCreateErr('Password minimal 4 karakter'); return; }
    setCreateLoading(true);
    try {
      const res = await adminFetch('/api/admin/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername.trim(), password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setCreateOpen(false);
        setNewUsername('');
        setNewPassword('');
        fetchAccounts();
      } else {
        setCreateErr(data.error || 'Gagal membuat akun');
      }
    } catch { setCreateErr('Network error'); } finally { setCreateLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminFetch(`/api/admin/accounts/${deleteTarget}`, { method: 'DELETE' });
      setDeleteTarget(null);
      fetchAccounts();
    } catch (e) { console.error('delete account failed', e); } finally { setDeleteLoading(false); }
  };

  const handleResetPw = async () => {
    if (!resetPwTarget) return;
    if (resetPwVal.length < 4) { setResetPwErr('Minimal 4 karakter'); return; }
    setResetPwLoading(true);
    setResetPwErr('');
    try {
      const res = await adminFetch(`/api/admin/accounts/${resetPwTarget}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPwVal }),
      });
      const data = await res.json();
      if (data.success) {
        setResetPwTarget(null);
        setResetPwVal('');
      } else {
        setResetPwErr(data.error || 'Gagal');
      }
    } catch { setResetPwErr('Network error'); } finally { setResetPwLoading(false); }
  };

  return (
    <div className="page-stack">
      <AdminPageHeader title="Account Management" subtitle="Manage admin accounts — each account has own templates, settings, and history" />

      <div className={styles.toolbar}>
        <button className="mac-button" onClick={() => { setCreateOpen(true); setCreateErr(''); }}>
          <Plus size={16} /> Tambah Akun
        </button>
      </div>

      <AdminTableCard>
        {loading ? (
          <div className={styles.loader}><Loader2 className="spin" size={32} /></div>
        ) : accounts.length === 0 ? (
          <div className={styles.empty}>
            <UserIcon size={28} />
            <p>Belum ada akun. Buat akun pertama.</p>
          </div>
        ) : (
          <div className={styles.responsiveTable}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Dibuat</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a._id}>
                    <td><span className={styles.username}><UserIcon size={16} /> {a.username}</span></td>
                    <td className={styles.dateCell}>{new Date(a.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td>
                      <div className={styles.actionRow}>
                        <button className="icon-btn" title="Reset Password" onClick={() => { setResetPwTarget(a._id); setResetPwVal(''); setResetPwErr(''); }}>
                          <Key size={16} />
                        </button>
                        <button className="icon-btn icon-btn-danger" title="Hapus Akun" onClick={() => setDeleteTarget(a._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminTableCard>

      {/* Create Modal */}
      <AdminModal open={createOpen} onClose={() => setCreateOpen(false)} title="Tambah Akun Baru">
        <div className={styles.modalBody}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="contoh: studio-1" autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimal 4 karakter" />
          </div>
          {createErr && <p className={styles.err}>{createErr}</p>}
          <div className={styles.modalActions}>
            <button className="mac-button secondary" onClick={() => setCreateOpen(false)}>Batal</button>
            <button className="mac-button" onClick={handleCreate} disabled={createLoading}>
              {createLoading ? <Loader2 className="spin" size={16} /> : null} Buat Akun
            </button>
          </div>
        </div>
      </AdminModal>

      {/* Delete Confirm */}
      <AdminConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Akun?"
        message="Akun, template, dan history akun ini akan tetap tersimpan di database."
        confirmLabel="Hapus"
        loading={deleteLoading}
        variant="danger"
      />

      {/* Reset Password Modal */}
      <AdminModal open={!!resetPwTarget} onClose={() => setResetPwTarget(null)} title="Reset Password">
        <div className={styles.modalBody}>
          <div className="form-group">
            <label className="form-label">Password Baru</label>
            <input className="form-input" type="password" value={resetPwVal} onChange={(e) => setResetPwVal(e.target.value)} placeholder="Minimal 4 karakter" autoFocus />
          </div>
          {resetPwErr && <p className={styles.err}>{resetPwErr}</p>}
          <div className={styles.modalActions}>
            <button className="mac-button secondary" onClick={() => setResetPwTarget(null)}>Batal</button>
            <button className="mac-button" onClick={handleResetPw} disabled={resetPwLoading}>
              {resetPwLoading ? <Loader2 className="spin" size={16} /> : null} Simpan
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
