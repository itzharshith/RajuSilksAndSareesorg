'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from './providers/CartProvider';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';

export default function MobileTabBar() {
  const { data: session } = useSession();
  const { cartCount, wishlist } = useCart();
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
      badge: wishlist.length,
    },
    {
      label: 'Cart',
      path: '/cart',
      icon: ShoppingBag,
      badge: cartCount,
    },
    {
      label: 'Account',
      path: session ? '/profile' : '/login',
      icon: User,
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-brand-blue-deep/90 backdrop-blur-md border-t border-brand-cream-text/25 shadow-[0_-5px_15px_rgba(7,17,30,0.3)] pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const ActiveIcon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.label}
              href={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200"
            >
              <div className={`p-1.5 rounded-full transition-all duration-300 relative ${
                active ? 'text-brand-cream-text scale-110' : 'text-gray-400 hover:text-brand-cream-text/70'
              }`}>
                <ActiveIcon size={20} className={active ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
                
                {/* Badges */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`absolute -top-1 -right-1.5 font-bold text-[9px] h-4 w-4 rounded-full flex items-center justify-center border ${
                    item.label === 'Cart' 
                      ? 'bg-brand-cream-text text-brand-blue-deep border-brand-blue-deep' 
                      : 'bg-red-600 text-white border-brand-blue-deep'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
              
              <span className={`text-[9px] tracking-wider font-sans font-semibold mt-0.5 uppercase transition-colors ${
                active ? 'text-brand-cream-text font-bold' : 'text-gray-500'
              }`}>
                {item.label}
              </span>

              {/* Active gold dot */}
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-cream-text animate-fade-in" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
