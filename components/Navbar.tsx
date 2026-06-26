'use client';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from './providers/CartProvider';
import { useState, useEffect } from 'react';
import { ShoppingBag, Heart, User, LogOut, Settings, Package, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const { cartCount } = useCart();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('#user-menu-wrapper')) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        scrolled
          ? 'glass-nav-scrolled border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'glass-nav border-white/[0.06] shadow-[0_2px_20px_rgba(0,0,0,0.25)]'
      }`}
    >
      {/* Gold shimmer accent line at the very bottom of the bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="group flex flex-col leading-tight relative overflow-hidden" aria-label="Raju Silks Home">
            {/* Logo shimmer sweep on hover */}
            <span className="absolute inset-0 -skew-x-12 translate-x-[-110%] group-hover:translate-x-[110%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
            <span className="font-serif text-brand-cream-text text-lg tracking-widest uppercase font-semibold group-hover:text-white transition-colors duration-200">
              Raju Silks
            </span>
            <span className="text-brand-cream-text-dark text-xs tracking-[0.3em] uppercase group-hover:text-brand-gold transition-colors duration-300">
              &amp; Sarees
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={() => setHoveredLink(link.href)}
                  onMouseLeave={() => setHoveredLink(null)}
                  className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-200 rounded-lg ${
                    active
                      ? 'text-white'
                      : 'text-brand-cream-text hover:text-white'
                  }`}
                >
                  {/* Hover background pill */}
                  <span
                    className={`absolute inset-0 rounded-lg transition-all duration-200 ${
                      hoveredLink === link.href && !active
                        ? 'bg-white/[0.08] scale-100 opacity-100'
                        : 'bg-white/[0.08] scale-95 opacity-0'
                    }`}
                  />

                  <span className="relative z-10">{link.label}</span>

                  {/* Active gold underline */}
                  {active && (
                    <span className="absolute bottom-0.5 left-3 right-3 h-[2px] rounded-full bg-brand-gold shadow-[0_0_6px_rgba(212,175,55,0.7)] animate-nav-underline" />
                  )}

                  {/* Hover underline slide-in */}
                  {!active && (
                    <span
                      className={`absolute bottom-0.5 left-3 right-3 h-[2px] rounded-full bg-brand-cream-text/40 transition-transform duration-200 origin-left ${
                        hoveredLink === link.href ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-0.5 md:gap-1">

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="hidden md:flex group relative h-10 w-10 items-center justify-center rounded-full text-brand-cream-text transition-all duration-200 hover:text-white hover:bg-white/10 hover:scale-110 active:scale-95"
            >
              <Heart size={19} className="transition-transform duration-200 group-hover:scale-110 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-brand-blue-deep text-brand-cream-text text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-brand-cream-text/10 shadow-lg">
                Wishlist
              </span>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Shopping Cart"
              className="group relative h-10 w-10 flex items-center justify-center rounded-full text-brand-cream-text transition-all duration-200 hover:text-white hover:bg-white/10 hover:scale-110 active:scale-95"
            >
              <ShoppingBag size={20} className="transition-transform duration-200 group-hover:scale-110 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-brand-gold text-brand-blue-deep text-[9px] font-extrabold rounded-full h-[18px] min-w-[18px] px-0.5 flex items-center justify-center border-2 border-brand-blue animate-scale-up shadow-sm">
                  {cartCount}
                </span>
              )}
              <span className="hidden md:block absolute -bottom-8 left-1/2 -translate-x-1/2 bg-brand-blue-deep text-brand-cream-text text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none border border-brand-cream-text/10 shadow-lg">
                Cart {cartCount > 0 ? `(${cartCount})` : ''}
              </span>
            </Link>

            {/* User Account / Sign In */}
            {session ? (
              <div id="user-menu-wrapper" className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className={`group flex items-center gap-1.5 h-10 pl-2 pr-3 rounded-full text-brand-cream-text transition-all duration-200 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95 ${
                    userMenuOpen ? 'bg-white/10 text-white' : ''
                  }`}
                >
                  <span className="h-6 w-6 rounded-full bg-brand-gold/20 border border-brand-gold/50 flex items-center justify-center shrink-0 group-hover:border-brand-gold transition-colors duration-200">
                    <User size={13} className="text-brand-gold" />
                  </span>
                  <span className="text-xs font-semibold tracking-wide">
                    {session.user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 animate-dropdown overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                      <p className="text-xs font-bold text-gray-800 truncate">{session.user?.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{session.user?.email}</p>
                    </div>
                    {(session.user as any)?.role === 'admin' && (
                      <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-brand-cream/60 hover:text-brand-blue transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <Settings size={14} className="text-brand-gold" />Admin Panel
                      </Link>
                    )}
                    <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-brand-cream/60 hover:text-brand-blue transition-colors" onClick={() => setUserMenuOpen(false)}>
                      <User size={14} className="text-brand-cream-text-dark" />My Profile
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-brand-cream/60 hover:text-brand-blue transition-colors" onClick={() => setUserMenuOpen(false)}>
                      <Package size={14} className="text-brand-cream-text-dark" />My Orders
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={() => { signOut({ callbackUrl: '/' }); setUserMenuOpen(false); }} className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 w-full text-left transition-colors">
                        <LogOut size={14} />Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-brand-gold/90 hover:bg-brand-gold text-brand-blue-deep text-xs font-bold tracking-wider rounded-full transition-all duration-200 hover:scale-105 hover:shadow-[0_0_16px_rgba(212,175,55,0.45)] active:scale-95 border border-brand-gold/60"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
