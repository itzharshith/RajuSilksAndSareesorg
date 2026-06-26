'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from './providers/CartProvider';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';

export default function MobileTabBar() {
  const { data: session } = useSession();
  const { cartCount = 0, wishlist = [] } = useCart() || {};
  const pathname = usePathname() || '';

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    {
      label: 'Home',
      path: '/',
      icon: Home,
    },
    {
      label: 'Shop',
      path: '/shop',
      icon: Search,
    },
    {
      label: 'Wishlist',
      path: '/wishlist',
      icon: Heart,
      badge: wishlist?.length || 0,
    },
    {
      label: 'Cart',
      path: '/cart',
      icon: ShoppingBag,
      badge: cartCount || 0,
    },
    {
      label: 'Account',
      path: session ? '/profile' : '/login',
      icon: User,
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-blue-deep/95 backdrop-blur-lg border-t border-brand-gold/20 shadow-[0_-8px_30px_rgba(7,17,30,0.4)] pb-safe">
      <div className="flex justify-around items-stretch h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.label}
              href={item.path}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all duration-200 touch-manipulation min-h-[44px] ${
                active
                  ? 'text-brand-gold'
                  : 'text-brand-cream-text/55 active:text-brand-cream-text active:bg-brand-cream-text/5'
              }`}
            >
              {/* Active pill background */}
              {active && (
                <span className="absolute inset-x-1 inset-y-1 rounded-xl bg-brand-gold/15 border border-brand-gold/25 animate-tab-pill" />
              )}

              <div className="relative flex items-center justify-center z-10">
                <Icon
                  size={24}
                  className={`transition-all duration-200 ${
                    active
                      ? 'stroke-[2.2px] drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]'
                      : 'stroke-[1.7px]'
                  }`}
                />

                {/* Badges */}
                {item.badge !== undefined && item.badge > 0 ? (
                  <span
                    className={`absolute -top-2 -right-2.5 font-sans font-extrabold text-[9px] h-[18px] min-w-[18px] px-0.5 rounded-full flex items-center justify-center border-2 shadow-sm transition-all duration-200 ${
                      active
                        ? 'bg-brand-cream text-brand-blue-deep border-brand-gold'
                        : 'bg-brand-gold text-brand-blue-deep border-brand-blue-deep'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </div>

              <span
                className={`text-[10px] tracking-widest font-sans font-semibold mt-0.5 uppercase transition-colors duration-200 z-10 ${
                  active ? 'text-brand-gold font-bold' : 'text-brand-cream-text/45'
                }`}
              >
                {item.label}
              </span>

              {/* Gold underline accent pill */}
              {active && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-brand-gold shadow-[0_0_6px_rgba(212,175,55,0.8)] animate-tab-pill" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
