'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, Camera, Loader2, Search, X } from 'lucide-react';
import styles from './page.module.css';

interface Transaction {
  _id: string;
  sessionId: string;
  templateId: string;
  price: number;
  status: string;
  photoUrls: string[];
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

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handleSearch = () => {
    fetchData(1);
  };

  const handleClear = () => {
    setStatusFilter('ALL');
    setFromDate('');
    setToDate('');
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className="title" style={{ textAlign: 'left', marginBottom: '8px' }}>Photo History</h1>
          <p className="subtitle" style={{ textAlign: 'left', marginBottom: 0 }}>
            Browse and filter past photobooth sessions
          </p>
        </div>
      </div>

      {/* Filters */}
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

      {/* Content */}
      {loading ? (
        <div className={styles.loader}>
          <Loader2 className="spin" size={32} />
          <span>Loading sessions...</span>
        </div>
      ) : transactions.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Camera size={28} />
          </div>
          <div className={styles.emptyTitle}>No sessions found</div>
          <div className={styles.emptyDesc}>Try adjusting your filters or check back later.</div>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {transactions.map((tx, idx) => (
              <div
                key={tx._id}
                className={`glass-panel ${styles.card}`}
                style={{ animationDelay: `${0.05 * idx}s` }}
              >
                <div className={styles.cardHeader}>
                  <span className={styles.sessionId}>#{tx.sessionId?.substring(0, 8) || 'N/A'}</span>
                  <span className={`${styles.badge} ${styles[(tx.status || 'PENDING').toLowerCase()]}`}>
                    {tx.status || 'PENDING'}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Template</span>
                    <span className={styles.cardValue}>{tx.templateId || 'Unknown'}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Price</span>
                    <span className={styles.cardPrice}>Rp {(tx.price || 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Photos</span>
                    <span className={styles.photoCount}>
                      <Camera size={14} /> {tx.photoUrls?.length || 0} taken
                    </span>
                  </div>
                </div>
                <div className={styles.cardDate}>
                  <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                  {new Date(tx.createdAt || new Date()).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className="mac-button secondary"
                disabled={pagination.page <= 1}
                onClick={() => fetchData(pagination.page - 1)}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                ← Previous
              </button>
              <span className={styles.pageInfo}>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <button
                className="mac-button secondary"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchData(pagination.page + 1)}
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
