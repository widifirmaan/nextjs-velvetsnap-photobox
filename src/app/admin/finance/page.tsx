'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Clock, Download, Loader2 } from 'lucide-react';
import { AdminPageHeader, AdminStatCard, AdminStatGrid } from '@/app/admin/components';
import styles from './page.module.css';

interface FinanceData {
  today: { total: number; count: number };
  week: { total: number; count: number };
  month: { total: number; count: number };
  allTime: { total: number; count: number };
  dailyRevenue: { date: string; label: string; total: number; count: number }[];
  monthlyRevenue: { _id: string; total: number; count: number }[];
  templateRevenue: { _id: string; total: number; count: number }[];
}

export default function FinancePage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchFinance(); }, []);

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/finance');
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error('Failed to fetch finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data) return;
    const rows = [
      ['Period', 'Revenue (Rp)', 'Transactions'],
      ['Today', String(data.today.total), String(data.today.count)],
      ['This Week', String(data.week.total), String(data.week.count)],
      ['This Month', String(data.month.total), String(data.month.count)],
      ['All Time', String(data.allTime.total), String(data.allTime.count)],
      [],
      ['Date', 'Revenue (Rp)', 'Transactions'],
      ...data.dailyRevenue.map((d) => [d.label, String(d.total), String(d.count)]),
      [],
      ['Template', 'Revenue (Rp)', 'Transactions'],
      ...data.templateRevenue.map((t) => [t._id || 'Unknown', String(t.total), String(t.count)]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={styles.loader}>
        <Loader2 className="spin" size={32} />
        <span>Loading finance data...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.loader}>
        <span>Failed to load finance data.</span>
      </div>
    );
  }

  const maxDaily = Math.max(...data.dailyRevenue.map((d) => d.total), 1);
  const maxTemplate = Math.max(...data.templateRevenue.map((t) => t.total), 1);

  return (
    <div className={styles.pageWrapper}>
      <AdminPageHeader
        title="Finance"
        subtitle="Revenue analytics and financial overview"
        action={
          <button className="mac-button" onClick={exportCSV}>
            <Download size={18} /> Export CSV
          </button>
        }
      />

      <AdminStatGrid>
        <AdminStatCard icon={<Clock size={22} />} label="Today" value={`Rp ${data.today.total.toLocaleString('id-ID')}`} color="orange" delay={0.05} subtext={`${data.today.count} transactions`} />
        <AdminStatCard icon={<Calendar size={22} />} label="This Week" value={`Rp ${data.week.total.toLocaleString('id-ID')}`} color="blue" delay={0.1} subtext={`${data.week.count} transactions`} />
        <AdminStatCard icon={<TrendingUp size={22} />} label="This Month" value={`Rp ${data.month.total.toLocaleString('id-ID')}`} color="purple" delay={0.15} subtext={`${data.month.count} transactions`} />
        <AdminStatCard icon={<DollarSign size={22} />} label="All Time" value={`Rp ${data.allTime.total.toLocaleString('id-ID')}`} color="green" delay={0.2} subtext={`${data.allTime.count} transactions`} />
      </AdminStatGrid>

      {/* Daily Revenue Chart */}
      <div className={`glass-panel ${styles.chartSection}`}>
        <div className={styles.chartHeader}>
          <div>
            <h2 className={styles.chartTitle}>Daily Revenue — Last 7 Days</h2>
            <p className={styles.chartSubtitle}>Revenue from paid transactions</p>
          </div>
        </div>
        <div className={styles.barChart}>
          {data.dailyRevenue.map((day, idx) => {
            const heightPct = (day.total / maxDaily) * 100;
            return (
              <div key={day.date} className={styles.barGroup}>
                {day.total > 0 && (
                  <span className={styles.barAmount}>
                    {(day.total / 1000).toFixed(0)}k
                  </span>
                )}
                <div
                  className={styles.bar}
                  style={{
                    height: `${Math.max(heightPct, 2)}%`,
                    animationDelay: `${0.3 + idx * 0.1}s`,
                  }}
                  title={`Rp ${day.total.toLocaleString('id-ID')} (${day.count} sessions)`}
                />
                <span className={styles.barLabel}>{day.label.split(',')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column: Template Breakdown + Monthly */}
      <div className={styles.twoCol}>
        <div className={`glass-panel ${styles.breakdownSection}`}>
          <h3 className={styles.breakdownTitle}>Revenue by Template</h3>
          {data.templateRevenue.length === 0 ? (
            <p className={styles.emptyBreakdown}>No template data yet.</p>
          ) : (
            <div className={styles.breakdownList}>
              {data.templateRevenue.map((t, idx) => (
                <div key={t._id || idx} className={styles.breakdownItem}>
                  <div className={styles.breakdownRank}>{idx + 1}</div>
                  <div className={styles.breakdownInfo}>
                    <div className={styles.breakdownName}>{t._id || 'Unknown'}</div>
                    <div className={styles.breakdownBar}>
                      <div className={styles.breakdownBarFill} style={{ width: `${(t.total / maxTemplate) * 100}%` }} />
                    </div>
                  </div>
                  <div className={styles.breakdownStats}>
                    <div className={styles.breakdownRevenue}>Rp {t.total.toLocaleString('id-ID')}</div>
                    <div className={styles.breakdownCount}>{t.count} sessions</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`glass-panel ${styles.breakdownSection}`}>
          <h3 className={styles.breakdownTitle}>Monthly Revenue</h3>
          {data.monthlyRevenue.length === 0 ? (
            <p className={styles.emptyBreakdown}>No monthly data yet.</p>
          ) : (
            <div className={styles.breakdownList}>
              {data.monthlyRevenue.map((m, idx) => {
                const maxMonthly = Math.max(...data.monthlyRevenue.map((x) => x.total), 1);
                const monthDate = new Date(m._id + '-01');
                const monthLabel = monthDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                return (
                  <div key={m._id} className={styles.breakdownItem}>
                    <div className={styles.breakdownRank}>{idx + 1}</div>
                    <div className={styles.breakdownInfo}>
                      <div className={styles.breakdownName}>{monthLabel}</div>
                      <div className={styles.breakdownBar}>
                        <div className={styles.breakdownBarFill} style={{ width: `${(m.total / maxMonthly) * 100}%` }} />
                      </div>
                    </div>
                    <div className={styles.breakdownStats}>
                      <div className={styles.breakdownRevenue}>Rp {m.total.toLocaleString('id-ID')}</div>
                      <div className={styles.breakdownCount}>{m.count} sessions</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
