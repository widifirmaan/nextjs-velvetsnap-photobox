import connectDB from '@/lib/db';
import Template from '@/models/Template';
import Transaction from '@/models/Transaction';
import Link from 'next/link';
import { Layers, Clock, DollarSign, Camera, ChevronRight, TrendingUp } from 'lucide-react';
import { AdminPageHeader, AdminStatCard, AdminStatGrid } from '@/app/admin/components';
import styles from './page.module.css';

export const revalidate = 0;

export default async function AdminDashboard() {
  await connectDB();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  const [templateCount, activeCount, totalSessions, aggResult] = await Promise.all([
    Template.countDocuments(),
    Template.countDocuments({ isActive: { $ne: false } }),
    Transaction.countDocuments(),
    Transaction.aggregate([
      { $match: { status: 'PAID' } },
      {
        $facet: {
          allTime: [{ $group: { _id: null, total: { $sum: '$price' } } }],
          last7Days: [
            { $match: { createdAt: { $gte: weekStart } } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                total: { $sum: '$price' },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]),
  ]);

  const todayStr = todayStart.toISOString().split('T')[0];
  const revenue = aggResult[0]?.allTime?.[0]?.total || 0;
  const dailyRevenueAgg = aggResult[0]?.last7Days || [];
  const todayAgg = dailyRevenueAgg.find((r: any) => r._id === todayStr);
  const todayRevenue = todayAgg?.total || 0;

  const dailyData = [];
  let maxRevenue = 0;
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const found = dailyRevenueAgg.find((r: any) => (r._id || r.k) === dateStr);
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
    <div className={styles.pageWrapper}>
      <AdminPageHeader
        title="Dashboard"
        subtitle="VelvetSnap Co. — Admin Dashboard"
      />

      <AdminStatGrid>
        <AdminStatCard icon={<Camera size={22} />} label="Total Sessions" value={totalSessions.toLocaleString('id-ID')} color="blue" delay={0.05} />
        <AdminStatCard icon={<DollarSign size={22} />} label="Total Revenue" value={`Rp ${revenue.toLocaleString('id-ID')}`} color="green" delay={0.1} />
        <AdminStatCard icon={<TrendingUp size={22} />} label="Today&apos;s Revenue" value={`Rp ${todayRevenue.toLocaleString('id-ID')}`} color="orange" delay={0.15} />
        <AdminStatCard icon={<Layers size={22} />} label="Active Templates" value={`${activeCount}`} color="purple" delay={0.2} subtext={`${templateCount} total`} />
      </AdminStatGrid>

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

      {/* Quick Access */}
      <h2 className={styles.sectionTitle}>Quick Access</h2>
      <div className={styles.quickLinksGrid}>
        <Link href="/admin/templates" className={styles.quickLink}>
          <div className={`${styles.quickLinkIcon} ${styles.blue}`}>
            <Layers size={20} />
          </div>
          <div>
            <div className={styles.quickLinkText}>Templates</div>
            <div className={styles.quickLinkDesc}>Manage frames &amp; layouts</div>
          </div>
          <ChevronRight size={18} className={styles.quickLinkArrow} />
        </Link>
        <Link href="/admin/history" className={styles.quickLink}>
          <div className={`${styles.quickLinkIcon} ${styles.orange}`}>
            <Clock size={20} />
          </div>
          <div>
            <div className={styles.quickLinkText}>Photo History</div>
            <div className={styles.quickLinkDesc}>Browse past sessions</div>
          </div>
          <ChevronRight size={18} className={styles.quickLinkArrow} />
        </Link>
        <Link href="/admin/finance" className={styles.quickLink}>
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


    </div>
  );
}
