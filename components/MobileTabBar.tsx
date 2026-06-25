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
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.label}
              href={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-2.5 rounded-2xl transition-all duration-300 relative ${
                active 
                  ? 'bg-brand-gold/10 text-brand-gold scale-105' 
                  : 'text-brand-cream-text/60 hover:text-brand-cream-text hover:bg-brand-cream-text/5'
              }`}
            >
              <div className="relative flex items-center justify-center p-0.5">
                <Icon 
                  size={24} 
                  className={`transition-all duration-300 ${
                    active ? 'stroke-[2.2px] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'stroke-[1.8px]'
                  }`} 
                />
                
                {/* Badges */}
                {item.badge !== undefined && item.badge > 0 ? (
                  <span className={`absolute -top-1.5 -right-2 font-sans font-bold text-[9px] h-4.5 w-4.5 rounded-full flex items-center justify-center border shadow-sm transition-all duration-300 ${
                    active 
                      ? 'bg-brand-cream text-brand-blue-deep border-brand-gold' 
                      : 'bg-brand-gold text-brand-blue-deep border-brand-blue-deep'
                  }`}>
                    {item.badge}
                  </span>
                ) : null}
              </div>
              
              <span className={`text-[10px] tracking-widest font-sans font-semibold mt-1 uppercase transition-colors duration-300 ${
                active ? 'text-brand-gold font-bold' : 'text-brand-cream-text/50'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
