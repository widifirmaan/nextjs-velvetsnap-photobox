import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import { requireAdmin } from '@/lib/require-admin';

export async function GET(req: Request) {
  const u = await requireAdmin(req);
  if (u) return u;
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'daily';

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Today's revenue
    const todayRevenue = await Transaction.aggregate([
      { $match: { status: 'PAID', createdAt: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$price' }, count: { $sum: 1 } } },
    ]);

    // This week's revenue
    const weekRevenue = await Transaction.aggregate([
      { $match: { status: 'PAID', createdAt: { $gte: weekStart } } },
      { $group: { _id: null, total: { $sum: '$price' }, count: { $sum: 1 } } },
    ]);

    // This month's revenue
    const monthRevenue = await Transaction.aggregate([
      { $match: { status: 'PAID', createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$price' }, count: { $sum: 1 } } },
    ]);

    // Total all-time revenue
    const totalRevenue = await Transaction.aggregate([
      { $match: { status: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$price' }, count: { $sum: 1 } } },
    ]);

    // Daily revenue for the last 7 days
    const dailyRevenue = await Transaction.aggregate([
      { $match: { status: 'PAID', createdAt: { $gte: weekStart } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          total: { $sum: '$price' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const found = dailyRevenue.find((r: any) => r._id === dateStr);
      dailyData.push({
        date: dateStr,
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        total: found?.total || 0,
        count: found?.count || 0,
      });
    }

    // Revenue by template
    const templateRevenue = await Transaction.aggregate([
      { $match: { status: 'PAID' } },
      {
        $group: {
          _id: '$templateId',
          total: { $sum: '$price' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Monthly revenue for the last 6 months
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyRevenue = await Transaction.aggregate([
      { $match: { status: 'PAID', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' },
          },
          total: { $sum: '$price' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        today: { total: todayRevenue[0]?.total || 0, count: todayRevenue[0]?.count || 0 },
        week: { total: weekRevenue[0]?.total || 0, count: weekRevenue[0]?.count || 0 },
        month: { total: monthRevenue[0]?.total || 0, count: monthRevenue[0]?.count || 0 },
        allTime: { total: totalRevenue[0]?.total || 0, count: totalRevenue[0]?.count || 0 },
        dailyRevenue: dailyData,
        monthlyRevenue,
        templateRevenue,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
