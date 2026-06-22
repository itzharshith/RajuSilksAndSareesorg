'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FolderTree, 
  ClipboardList, 
  Ticket, 
  Users, 
  Home, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname() || '';
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Orders', path: '/admin/orders', icon: ClipboardList },
    { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { name: 'Customers', path: '/admin/customers', icon: Users },
  ];

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  const user = session?.user as any;

  return (
    <div className="min-h-screen bg-brand-cream-dark flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-brand-blue-deep border-r border-brand-cream-text/30 text-white transform transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-brand-cream-text/20">
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg text-brand-cream-text tracking-wider">RAJU SILKS</span>
            <span className="text-[10px] text-brand-cream/70 tracking-widest uppercase">Admin Panel</span>
          </div>
          <button 
            className="lg:hidden text-brand-cream-text hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all duration-200
                  ${isActive 
                    ? 'bg-brand-cream-text text-brand-blue-deep font-semibold' 
                    : 'hover:bg-brand-blue/50 text-brand-cream/80 hover:text-white'}
                `}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 w-full p-4 border-t border-brand-cream-text/20 space-y-2">
          <Link
            href="/"
            className="flex items-center space-x-3 px-4 py-2 rounded-lg text-sm text-brand-cream/80 hover:text-white hover:bg-brand-blue/50 transition-colors"
          >
            <Home size={18} />
            <span>Go To Store</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-sm text-red-300 hover:text-red-100 hover:bg-red-950/40 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-brand-cream-text/20 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 mr-2 text-brand-blue hover:bg-brand-cream rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-serif font-bold text-brand-blue-deep">
              {menuItems.find(item => item.path === pathname)?.name || 'Admin Panel'}
            </h1>
          </div>
          
          {/* User profile dropdown indicator */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-brand-blue-deep">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <div className="h-10 w-10 bg-brand-blue text-brand-cream-text rounded-full flex items-center justify-center font-serif font-bold border border-brand-cream-text shadow-sm">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8 bg-brand-cream/30">
          {children}
        </main>
      </div>
    </div>
  );
}
