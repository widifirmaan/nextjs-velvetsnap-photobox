'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, Clock, DollarSign, Camera, ChevronRight, TrendingUp } from 'lucide-react';
import { AdminPageHeader, AdminStatCard, AdminStatGrid } from '@/app/admin/components';
import MobileActions from './MobileActions';
import styles from './page.module.css';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/finance').then(r => r.json()),
      fetch('/api/transactions/count').then(r => r.json()),
      fetch('/api/templates/thumbnails').then(r => r.json()),
    ]).then(([finance, txCount, templates]) => {
      const isRoot = sessionStorage.getItem('admin_is_root') === '1';
      const username = sessionStorage.getItem('admin_username') || '';
      const activeCount = (templates.data || []).filter(t => t.isActive).length;
      const templateCount = (templates.data || []).length;
      const totalSessions = txCount.total || 0;

      const fd = finance.data || {};
      const dailyData = (fd.dailyRevenue || []).map(d => ({
        date: d.date,
        dayLabel: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
        dateLabel: new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: d.total,
        count: d.count,
      }));
      const maxRevenue = Math.max(...dailyData.map(d => d.total), 1);

      setData({ isRoot, username, totalSessions, revenue: fd.allTime?.total || 0, todayRevenue: fd.today?.total || 0, activeCount, templateCount, dailyData, maxRevenue });
    }).catch(() => {});
  }, []);

  if (!data) return <div className="page-stack"><AdminPageHeader title="Dashboard" subtitle="Loading..." /></div>;

  return (
    <div className="page-stack">
      <AdminPageHeader
        title="Dashboard"
        subtitle={data.isRoot ? 'VelvetSnap Co. — Root Dashboard (all accounts)' : `VelvetSnap Co. — ${data.username || 'Account'} Dashboard`}
      />
      <MobileActions />
      <AdminStatGrid>
        <AdminStatCard icon={<Camera size={22} />} label="Total Sessions" value={data.totalSessions.toLocaleString('id-ID')} color="blue" delay={0.05} />
        <AdminStatCard icon={<DollarSign size={22} />} label="Total Revenue" value={`Rp ${data.revenue.toLocaleString('id-ID')}`} color="green" delay={0.1} />
        <AdminStatCard icon={<TrendingUp size={22} />} label="Today's Revenue" value={`Rp ${data.todayRevenue.toLocaleString('id-ID')}`} color="orange" delay={0.15} />
        <AdminStatCard icon={<Layers size={22} />} label="Active Templates" value={`${data.activeCount}`} color="purple" delay={0.2} subtext={`${data.templateCount} total`} />
      </AdminStatGrid>
      <div className={`card card-md ${styles.chartSection}`}>
        <div className={styles.chartHeader}>
          <div>
            <h2 className={styles.chartTitle}>Revenue — Last 7 Days</h2>
            <p className={styles.chartSubtitle}>Daily paid transaction totals</p>
          </div>
        </div>
        <div className={styles.barChart}>
          {data.dailyData.map((day) => {
            const heightPct = data.maxRevenue > 0 ? (day.total / data.maxRevenue) * 100 : 0;
            return (
              <div key={day.date} className={styles.barGroup}>
                {day.total > 0 && <span className={styles.barAmount}>{(day.total / 1000).toFixed(0)}k</span>}
                <div className={styles.bar} style={{ height: `${Math.max(heightPct, 2)}%` }} title={`Rp ${day.total.toLocaleString('id-ID')} (${day.count} sessions)`} />
                <span className={styles.barLabel}>{day.dayLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
      <h2 className={styles.sectionTitle}>Quick Access</h2>
      <div className={styles.quickLinksGrid}>
        <Link href="/admin/templates" className={`card card-sm ${styles.quickLink}`}>
          <div className={`${styles.quickLinkIcon} ${styles.blue}`}><Layers size={20} /></div>
          <div>
            <div className={styles.quickLinkText}>Templates</div>
            <div className={styles.quickLinkDesc}>Manage frames &amp; layouts</div>
          </div>
          <ChevronRight size={18} className={styles.quickLinkArrow} />
        </Link>
        <Link href="/admin/history" className={`card card-sm ${styles.quickLink}`}>
          <div className={`${styles.quickLinkIcon} ${styles.orange}`}><Clock size={20} /></div>
          <div>
            <div className={styles.quickLinkText}>Photo History</div>
            <div className={styles.quickLinkDesc}>Browse past sessions</div>
          </div>
          <ChevronRight size={18} className={styles.quickLinkArrow} />
        </Link>
      </div>
    </div>
  );
}
