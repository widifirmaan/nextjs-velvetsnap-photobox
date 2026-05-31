import connectDB from '@/lib/db';
import Template from '@/models/Template';
import Transaction from '@/models/Transaction';
import Link from 'next/link';
import { Layers, Clock, DollarSign, Camera, ChevronRight, TrendingUp } from 'lucide-react';
import styles from './page.module.css';

export const revalidate = 0;

export default async function AdminDashboard() {
  await connectDB();

  const templates = await Template.find({}).lean();
  const activeTemplates = templates.filter((t: any) => t.isActive !== false);
  const transactions = await Transaction.find({}).sort({ createdAt: -1 }).limit(10).lean();
  const totalSessions = await Transaction.countDocuments();

  // Total revenue
  const totalRevenueAgg = await Transaction.aggregate([
    { $match: { status: 'PAID' } },
    { $group: { _id: null, total: { $sum: '$price' } } },
  ]);
  const revenue = totalRevenueAgg[0]?.total || 0;

  // Today's revenue
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayRevenueAgg = await Transaction.aggregate([
    { $match: { status: 'PAID', createdAt: { $gte: todayStart } } },
    { $group: { _id: null, total: { $sum: '$price' } } },
  ]);
  const todayRevenue = todayRevenueAgg[0]?.total || 0;

  // Daily revenue for the last 7 days
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);
  const dailyRevenueAgg = await Transaction.aggregate([
    { $match: { status: 'PAID', createdAt: { $gte: weekStart } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        total: { $sum: '$price' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill in missing days
  const dailyData = [];
  let maxRevenue = 0;
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const found = dailyRevenueAgg.find((r: any) => r._id === dateStr);
    const total = found?.total || 0;
    if (total > maxRevenue) maxRevenue = total;
    dailyData.push({
      date: dateStr,
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total,
      count: found?.count || 0,
    });
  }

  return (
    <div className="page-container">
      <h1 className="title" style={{ textAlign: 'left', marginBottom: '8px' }}>Dashboard</h1>
          <p className="subtitle" style={{ textAlign: 'left', marginBottom: '32px' }}>
            VelvetSnap Co. — Admin Dashboard
          </p>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        <div className={`glass-panel ${styles.statCard}`}>
          <div className={`${styles.statIcon} ${styles.blue}`}>
            <Camera size={22} />
          </div>
          <p className={styles.statLabel}>Total Sessions</p>
          <p className={styles.statValue}>{totalSessions.toLocaleString('id-ID')}</p>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <div className={`${styles.statIcon} ${styles.green}`}>
            <DollarSign size={22} />
          </div>
          <p className={styles.statLabel}>Total Revenue</p>
          <p className={styles.statValue}>Rp {revenue.toLocaleString('id-ID')}</p>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <div className={`${styles.statIcon} ${styles.orange}`}>
            <TrendingUp size={22} />
          </div>
          <p className={styles.statLabel}>Today&apos;s Revenue</p>
          <p className={styles.statValue}>Rp {todayRevenue.toLocaleString('id-ID')}</p>
        </div>
        <div className={`glass-panel ${styles.statCard}`}>
          <div className={`${styles.statIcon} ${styles.purple}`}>
            <Layers size={22} />
          </div>
          <p className={styles.statLabel}>Active Templates</p>
          <p className={styles.statValue}>{activeTemplates.length}</p>
          <p className={styles.statSubtext}>{templates.length} total</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className={`glass-panel ${styles.chartSection}`}>
        <div className={styles.chartHeader}>
          <div>
            <h2 className={styles.chartTitle}>Revenue — Last 7 Days</h2>
            <p className={styles.chartSubtitle}>
              Daily paid transaction totals
            </p>
          </div>
        </div>
        <div className={styles.barChart}>
          {dailyData.map((day) => {
            const heightPct = maxRevenue > 0 ? (day.total / maxRevenue) * 100 : 0;
            return (
              <div key={day.date} className={styles.barGroup}>
                {day.total > 0 && (
                  <span className={styles.barAmount}>
                    {(day.total / 1000).toFixed(0)}k
                  </span>
                )}
                <div
                  className={styles.bar}
                  style={{ height: `${Math.max(heightPct, 2)}%` }}
                  title={`Rp ${day.total.toLocaleString('id-ID')} (${day.count} sessions)`}
                />
                <span className={styles.barLabel}>{day.dayLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Links */}
      <div className={styles.quickLinksGrid}>
        <Link href="/admin/templates" className={`glass-panel ${styles.quickLink}`}>
          <div className={`${styles.quickLinkIcon} ${styles.blue}`}>
            <Layers size={20} />
          </div>
          <div>
            <div className={styles.quickLinkText}>Templates</div>
            <div className={styles.quickLinkDesc}>Manage frames &amp; layouts</div>
          </div>
          <ChevronRight size={18} className={styles.quickLinkArrow} />
        </Link>
        <Link href="/admin/history" className={`glass-panel ${styles.quickLink}`}>
          <div className={`${styles.quickLinkIcon} ${styles.orange}`}>
            <Clock size={20} />
          </div>
          <div>
            <div className={styles.quickLinkText}>Photo History</div>
            <div className={styles.quickLinkDesc}>Browse past sessions</div>
          </div>
          <ChevronRight size={18} className={styles.quickLinkArrow} />
        </Link>
        <Link href="/admin/finance" className={`glass-panel ${styles.quickLink}`}>
          <div className={`${styles.quickLinkIcon} ${styles.green}`}>
            <DollarSign size={20} />
          </div>
          <div>
            <div className={styles.quickLinkText}>Finance</div>
            <div className={styles.quickLinkDesc}>Revenue &amp; analytics</div>
          </div>
          <ChevronRight size={18} className={styles.quickLinkArrow} />
        </Link>
      </div>

      {/* Recent Transactions Table */}
      <div className={styles.sections}>
        <div className={`glass-panel ${styles.section}`}>
          <div className={styles.sectionHeader}>
            <h2>Recent Transactions</h2>
            <Link href="/admin/history" className={styles.viewAll}>
              View All →
            </Link>
          </div>
          {transactions.length === 0 ? (
            <p className={styles.emptyState}>No transactions yet.</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Template</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx: any) => (
                  <tr key={tx._id.toString()}>
                    <td>{tx.sessionId ? tx.sessionId.substring(0, 8) : 'N/A'}...</td>
                    <td>{tx.templateId || 'Unknown'}</td>
                    <td>
                      <span className={`${styles.badge} ${styles[(tx.status || 'PENDING').toLowerCase()]}`}>
                        {tx.status || 'PENDING'}
                      </span>
                    </td>
                    <td>Rp {(tx.price || 0).toLocaleString('id-ID')}</td>
                    <td>{new Date(tx.createdAt || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
