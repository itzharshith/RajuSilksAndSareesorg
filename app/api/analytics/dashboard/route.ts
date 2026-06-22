import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Order } from '@/lib/models/Order';
import { Product } from '@/lib/models/Product';
import { User } from '@/lib/models/User';
import { getDB } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const db = getDB();
  const totalOrders = await Order.countDocuments({});
  const totalCustomers = await User.countDocuments({ role: 'user' });
  const totalProducts = await Product.countDocuments({});
  const revenueResult = await db.execute({ sql: `SELECT SUM("totalAmount") as total FROM "orders" WHERE "paymentStatus" = 'Paid'`, args: [] });
  const totalRevenue = revenueResult.rows[0]?.total || 0;
  const recentOrders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 }).limit(6);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);
  const monthlySalesResult = await db.execute({ sql: `SELECT CAST(strftime('%Y', "createdAt") AS INTEGER) as year, CAST(strftime('%m', "createdAt") AS INTEGER) as month, SUM("totalAmount") as revenue, COUNT(*) as orders FROM "orders" WHERE "paymentStatus" = 'Paid' AND "createdAt" >= ? GROUP BY year, month ORDER BY year ASC, month ASC`, args: [sixMonthsAgo.toISOString()] });
  const monthlySales = monthlySalesResult.rows;
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const formattedMonthlySales = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const record: any = monthlySales.find((s: any) => s.month === m && s.year === y);
    formattedMonthlySales.push({ name: `${monthNames[m - 1]} ${y}`, revenue: record ? record.revenue : 0, orders: record ? record.orders : 0 });
  }
  return NextResponse.json({ summary: { totalRevenue, totalOrders, totalCustomers, totalProducts }, recentOrders, monthlySales: formattedMonthlySales });
}
