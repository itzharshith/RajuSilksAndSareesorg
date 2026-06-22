'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  IndianRupee, 
  ShoppingBag, 
  Users, 
  Package, 
  ChevronRight, 
  ArrowUpRight 
} from 'lucide-react';

interface Summary {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

interface Order {
  _id: string;
  user?: {
    name: string;
  };
  createdAt: string;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
}

interface MonthlySale {
  name: string;
  revenue: number;
}

interface DashboardStats {
  summary: Summary;
  recentOrders: Order[];
  monthlySales: MonthlySale[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/analytics/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error loading dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  const { summary, recentOrders, monthlySales } = stats || {
    summary: { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, totalProducts: 0 },
    recentOrders: [],
    monthlySales: []
  };

  const maxRevenue = monthlySales.length > 0 
    ? Math.max(...monthlySales.map(item => item.revenue)) 
    : 1;

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. Stats Counter Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue */}
        <div className="bg-white rounded-xl border border-brand-cream-text/15 p-5 shadow-luxury flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Sales Revenue</span>
            <p className="text-2xl font-serif font-bold text-brand-blue-deep">₹{summary.totalRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="h-12 w-12 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center justify-center">
            <IndianRupee size={22} />
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-xl border border-brand-cream-text/15 p-5 shadow-luxury flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Total Orders placed</span>
            <p className="text-2xl font-serif font-bold text-brand-blue-deep">{summary.totalOrders}</p>
          </div>
          <div className="h-12 w-12 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg flex items-center justify-center">
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white rounded-xl border border-brand-cream-text/15 p-5 shadow-luxury flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Registered Patrons</span>
            <p className="text-2xl font-serif font-bold text-brand-blue-deep">{summary.totalCustomers}</p>
          </div>
          <div className="h-12 w-12 bg-purple-50 border border-purple-200 text-purple-700 rounded-lg flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl border border-brand-cream-text/15 p-5 shadow-luxury flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Weaving Designs</span>
            <p className="text-2xl font-serif font-bold text-brand-blue-deep">{summary.totalProducts}</p>
          </div>
          <div className="h-12 w-12 bg-amber-50 border border-amber-200 text-brand-cream-text rounded-lg flex items-center justify-center">
            <Package size={22} />
          </div>
        </div>

      </div>

      {/* 2. Analytical Graphs and distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Custom SVG Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-brand-cream-text/15 p-6 shadow-luxury">
          <span className="font-serif font-bold text-base text-brand-blue-deep tracking-wider block mb-6">
            Monthly Revenue timeline
          </span>

          <div className="relative w-full h-64 border-l border-b border-gray-250 pb-2">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-2">
              <div className="border-t border-gray-100 text-[10px] text-gray-400 text-right pt-0.5">₹{Math.round(maxRevenue).toLocaleString('en-IN')}</div>
              <div className="border-t border-gray-100 text-[10px] text-gray-400 text-right pt-0.5">₹{Math.round(maxRevenue * 0.67).toLocaleString('en-IN')}</div>
              <div className="border-t border-gray-100 text-[10px] text-gray-400 text-right pt-0.5">₹{Math.round(maxRevenue * 0.33).toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-gray-400 text-right">₹0</div>
            </div>

            {/* Bars container */}
            <div className="absolute inset-x-4 bottom-0 top-4 flex items-end justify-around">
              {monthlySales.map((item, idx) => {
                const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={idx} className="flex flex-col items-center group w-12">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1 bg-brand-blue text-brand-cream-text text-[10px] py-1 px-2 rounded shadow-md border border-brand-cream-text/20 transition-opacity whitespace-nowrap z-20">
                      ₹{item.revenue.toLocaleString('en-IN')}
                    </div>
                    {/* Bar */}
                    <div 
                      style={{ height: `${Math.max(5, heightPercent)}%` }}
                      className="w-8 bg-gradient-to-t from-brand-blue-deep to-brand-cream-text rounded-t hover:brightness-110 shadow transition-all duration-300 cursor-pointer"
                    />
                    {/* Label */}
                    <span className="text-[10px] text-gray-500 font-sans mt-2 whitespace-nowrap overflow-hidden text-center">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Business details summary box */}
        <div className="bg-white rounded-xl border border-brand-cream-text/15 p-6 shadow-luxury flex flex-col justify-between">
          <div>
            <span className="font-serif font-bold text-base text-brand-blue-deep tracking-wider block mb-4">
              Weaver Store Insights
            </span>
            <p className="text-xs text-gray-500 leading-relaxed font-sans">
              Welcome to the administrative portal of Raju Silks & Sarees. Use the sidebar to manage catalog stocks, handle orders delivery, monitor coupons promotions, and check patron customer lists.
            </p>
          </div>

          <div className="border-t border-brand-cream-dark pt-4 mt-4 space-y-3">
            <Link
              href="/admin/products"
              className="flex items-center justify-between text-xs text-brand-blue hover:text-brand-cream-text font-semibold transition-colors"
            >
              <span>Manage Products inventory</span>
              <ChevronRight size={14} />
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center justify-between text-xs text-brand-blue hover:text-brand-cream-text font-semibold transition-colors"
            >
              <span>Manage Orders statuses</span>
              <ChevronRight size={14} />
            </Link>
            <Link
              href="/admin/coupons"
              className="flex items-center justify-between text-xs text-brand-blue hover:text-brand-cream-text font-semibold transition-colors"
            >
              <span>Edit Promotions codes</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

      </div>

      {/* 3. Recent Orders Activity Table */}
      <div className="bg-white rounded-xl border border-brand-cream-text/15 p-6 shadow-luxury">
        <div className="flex items-center justify-between mb-6">
          <span className="font-serif font-bold text-base text-brand-blue-deep tracking-wider">Recent Orders Activity</span>
          <Link
            href="/admin/orders"
            className="flex items-center space-x-1 text-xs text-brand-blue hover:text-brand-cream-text font-semibold transition-colors"
          >
            <span>VIEW ALL ORDERS</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No recent orders placed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-brand-cream/50 text-gray-500 uppercase font-bold border-b border-brand-cream-text/10">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Placed Date</th>
                  <th className="px-4 py-3">Net Total</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                {recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-brand-cream/20">
                    <td className="px-4 py-3.5 font-mono text-brand-blue-deep">{ord._id}</td>
                    <td className="px-4 py-3.5">{ord.user?.name || 'Guest'}</td>
                    <td className="px-4 py-3.5">{new Date(ord.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800">₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${
                        ord.paymentStatus === 'Paid' ? 'text-green-700 bg-green-50 border-green-200' : 'text-yellow-700 bg-yellow-50 border-yellow-200'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-bold uppercase">{ord.orderStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
