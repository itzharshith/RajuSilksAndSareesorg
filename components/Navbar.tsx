'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from './providers/CartProvider';
import { useState } from 'react';
import { ShoppingBag, Heart, User, Menu, X, LogOut, Settings, Package } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-brand-blue shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-tight">
            <span className="font-serif text-brand-cream-text text-lg tracking-widest uppercase font-semibold">Raju Silks</span>
            <span className="text-brand-cream-text-dark text-xs tracking-[0.3em] uppercase">& Sarees</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} className="text-brand-cream-text hover:text-white text-sm font-medium tracking-wide transition-colors duration-200">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link href="/wishlist" className="p-2 text-brand-cream-text hover:text-white transition-colors">
              <Heart size={20} />
            </Link>
            <Link href="/cart" className="relative p-2 text-brand-cream-text hover:text-white transition-colors">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {session ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2 text-brand-cream-text hover:text-white transition-colors">
                  <User size={20} />
                  <span className="hidden md:block text-sm">{session.user?.name?.split(' ')[0]}</span>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-scale-up">
                    {(session.user as any)?.role === 'admin' && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                        <Settings size={14} />Admin Panel
                      </Link>
                    )}
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                      <User size={14} />My Profile
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                      <Package size={14} />My Orders
                    </Link>
                    <hr className="my-1" />
                    <button onClick={() => { signOut({ callbackUrl: '/' }); setUserMenuOpen(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left">
                      <LogOut size={14} />Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="px-4 py-2 bg-brand-cream-text text-brand-blue text-sm font-semibold rounded-lg hover:bg-white transition-colors">
                Sign In
              </Link>
            )}

            <button className="md:hidden p-2 text-brand-cream-text" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-brand-blue-dark border-t border-brand-blue-dark px-4 py-4 space-y-3">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="block text-brand-cream-text hover:text-white text-sm font-medium py-2" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
