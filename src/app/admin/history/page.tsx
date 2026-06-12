'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, Camera, Loader2, Search, X, Trash2, Printer, ImageIcon } from 'lucide-react';
import { AdminPageHeader, AdminBadge, AdminEmptyState, AdminModal, AdminConfirmModal } from '@/app/admin/components';
import styles from './page.module.css';

interface Transaction {
  _id: string;
  sessionId: string;
  templateId: string;
  price: number;
  status: string;
  captures: string[];
  finalImage: string;
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({ total: 0, page: 1, limit: 12, totalPages: 0 });

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '12');
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data || []);
        setPagination(data.pagination || { total: 0, page: 1, limit: 12, totalPages: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, fromDate, toDate]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const handleSearch = () => fetchData(1);

  const handleClear = () => {
    setStatusFilter('ALL');
    setFromDate('');
    setToDate('');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/transactions?id=${deleteTarget}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTransactions((prev) => prev.filter((t) => t._id !== deleteTarget));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
        if (selectedTx?._id === deleteTarget) setSelectedTx(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handlePrintFoto = (tx: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tx.finalImage) return;
    const img = new window.Image();
    img.onload = () => {
      const pw = img.naturalWidth;
      const ph = img.naturalHeight;
      const win = window.open('', '_blank');
      if (!win) return;
      win.document.write(`<!DOCTYPE html>
<html><head><title>Hasil Foto - ${tx.sessionId}</title>
<style>
  @page{size:${pw}px ${ph}px;margin:0}
  *{margin:0;padding:0;box-sizing:border-box}
  body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff}
  img{display:block;width:${pw}px;height:${ph}px}
</style></head><body>
<img src="${tx.finalImage}" onload="setTimeout(function(){window.print()},200)" />
</body></html>`);
      win.document.close();
    };
    img.src = tx.finalImage;
  };

  const handlePrintNota = (tx: Transaction, e: React.MouseEvent) => {
    e.stopPropagation();
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Nota - ${tx.sessionId}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; width: 300px; }
        h2 { text-align: center; font-size: 16px; margin-bottom: 4px; letter-spacing: 2px; }
        .sub { text-align: center; font-size: 10px; color: #666; margin-bottom: 16px; }
        hr { border: none; border-top: 1px dashed #333; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .total { font-weight: bold; font-size: 14px; }
        .footer { text-align: center; font-size: 10px; color: #666; margin-top: 16px; }
      </style></head><body>
        <h2>PHOTOBOOTH</h2>
        <div class="sub">${new Date(tx.createdAt).toLocaleString('id-ID')}</div>
        <hr>
        <div class="row"><span>Session</span><span>#${tx.sessionId || ''}</span></div>
        <div class="row"><span>Template</span><span>${tx.templateId || 'Unknown'}</span></div>
        <div class="row"><span>Photos</span><span>${tx.captures?.length || 0}</span></div>
        <div class="row"><span>Status</span><span>${tx.status || 'PENDING'}</span></div>
        <hr>
        <div class="row total"><span>Total</span><span>Rp ${(tx.price || 0).toLocaleString('id-ID')}</span></div>
        <hr>
        <div class="footer">Terima kasih telah menggunakan layanan kami</div>
        <script>window.print();<\/script>
      </body></html>`);
    win.document.close();
  };

  return (
    <div className={styles.pageWrapper}>
      <AdminPageHeader
        title="Photo History"
        subtitle="Browse and filter past photobooth sessions"
      />

      <div className={`glass-panel ${styles.filters}`}>
        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className={styles.filterGroup}>
            <label>To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className={styles.filterActions}>
            <button className="mac-button" onClick={handleSearch} style={{ padding: '10px 20px' }}>
              <Search size={16} /> Search
            </button>
            <button className="mac-button secondary" onClick={handleClear} style={{ padding: '10px 20px' }}>
              <X size={16} /> Clear
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={styles.loader}>
          <Loader2 className="spin" size={32} />
          <span>Loading sessions...</span>
        </div>
      ) : transactions.length === 0 ? (
        <AdminEmptyState icon={<Camera size={28} />} title="No sessions found" description="Try adjusting your filters or check back later." />
      ) : (
        <>
          <div className={`glass-panel ${styles.tableContainer}`}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Session ID</th>
                  <th>Template</th>
                  <th>Price</th>
                  <th>Photos</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} className={styles.tableRow} onClick={() => setSelectedTx(tx)}>
                    <td>
                      {tx.finalImage ? (
                        <img src={tx.finalImage} alt="" className={styles.tableThumb} />
                      ) : (
                        <span className={styles.tableThumbPlaceholder} />
                      )}
                    </td>
                    <td><span className={styles.sessionId}>#{tx.sessionId || 'N/A'}</span></td>
                    <td>{tx.templateId || 'Unknown'}</td>
                    <td className={styles.tablePrice}>Rp {(tx.price || 0).toLocaleString('id-ID')}</td>
                    <td><Camera size={14} /> {tx.captures?.length || 0}</td>
                    <td><AdminBadge status={tx.status || 'PENDING'} /></td>
                    <td className={styles.tableDate}>
                      {new Date(tx.createdAt || new Date()).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button className={styles.actionBtn} title="Cetak Nota" onClick={(e) => handlePrintNota(tx, e)}>
                          <Printer size={15} />
                        </button>
                        <button className={styles.actionBtn} title="Cetak Foto" onClick={(e) => handlePrintFoto(tx, e)}>
                          <ImageIcon size={15} />
                        </button>
                        <button className={`${styles.actionBtn} ${styles.actionDanger}`} title="Hapus" onClick={(e) => { e.stopPropagation(); setDeleteTarget(tx._id); }}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button className="mac-button secondary" disabled={pagination.page <= 1} onClick={() => fetchData(pagination.page - 1)} style={{ padding: '8px 16px', fontSize: '14px' }}>
                ← Previous
              </button>
              <span className={styles.pageInfo}>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <button className="mac-button secondary" disabled={pagination.page >= pagination.totalPages} onClick={() => fetchData(pagination.page + 1)} style={{ padding: '8px 16px', fontSize: '14px' }}>
                Next →
              </button>
            </div>
          )}
        </>
      )}

      <AdminConfirmModal
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus Transaksi?"
        message="Tindakan ini tidak dapat dibatalkan."
        loading={deleting}
      />

      <AdminModal open={!!selectedTx} onClose={() => setSelectedTx(null)} title={`Transaction #${selectedTx?.sessionId || ''}`}>
        {selectedTx && (
          <div className={styles.modalBody}>
            <div className={styles.modalInfo}>
              <span>Template: {selectedTx.templateId}</span>
              <span>Status: <AdminBadge status={selectedTx.status} /></span>
              <span>Price: Rp {(selectedTx.price || 0).toLocaleString('id-ID')}</span>
              <span>Date: {new Date(selectedTx.createdAt).toLocaleString()}</span>
            </div>

            {(selectedTx.finalImage || (selectedTx.captures && selectedTx.captures.length > 0)) && (
              <div className={styles.modalSection}>
                <h3>Photos</h3>
                <div className={styles.modalGrid}>
                  {selectedTx.finalImage && (
                    <div className={styles.modalGridItem}>
                      <img src={selectedTx.finalImage} alt="Final" />
                      <div className={styles.modalActionRow}>
                        <button className={styles.modalDownloadBtn} onClick={() => {
                          const link = document.createElement('a');
                          link.href = selectedTx.finalImage;
                          link.download = `photobooth-${selectedTx.sessionId}.jpg`;
                          link.click();
                        }}>
                          Download
                        </button>
                        <button className={styles.modalPrintBtn} onClick={() => {
                          const img = new window.Image();
                          img.onload = () => {
                            const pw = img.naturalWidth;
                            const ph = img.naturalHeight;
                            const win = window.open('', '_blank');
                            if (!win) return;
                            win.document.write(`<!DOCTYPE html>
<html><head><title>Hasil Foto - ${selectedTx.sessionId}</title>
<style>
  @page{size:${pw}px ${ph}px;margin:0}
  *{margin:0;padding:0;box-sizing:border-box}
  body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff}
  img{display:block;width:${pw}px;height:${ph}px}
</style></head><body>
<img src="${selectedTx.finalImage}" onload="setTimeout(function(){window.print()},200)" />
</body></html>`);
                            win.document.close();
                          };
                          img.src = selectedTx.finalImage;
                        }}>
                          <Printer size={13} /> Cetak
                        </button>
                      </div>
                    </div>
                  )}
                  {selectedTx.captures?.map((src, i) => (
                    <div key={i} className={styles.modalGridItem}>
                      <img src={src} alt={`Capture ${i + 1}`} />
                      <button className={styles.modalDownloadBtn} onClick={() => {
                        const link = document.createElement('a');
                        link.href = src;
                        link.download = `capture-${selectedTx.sessionId}-${i + 1}.jpg`;
                        link.click();
                      }}>
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </div>
  );
}
