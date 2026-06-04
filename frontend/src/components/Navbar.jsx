import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  Search, 
  Menu, 
  X, 
  LogOut, 
  Sliders, 
  History 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems, wishlist } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-brand-blue-deep border-b border-brand-creamText/30 shadow-luxury text-white">
      {/* Upper bar (Announcements) */}
      <div className="bg-brand-blue text-brand-creamText text-[11px] font-sans tracking-widest text-center py-2 border-b border-brand-creamText/10 uppercase">
        ✨ Free Shipping on Orders Above ₹5000 | Authentic Silk Handloom Guarantee ✨
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Tagline */}
          <Link to="/" className="flex flex-col flex-shrink-0 group">
            <span className="font-serif font-bold text-xl sm:text-2xl text-brand-creamText tracking-widest group-hover:text-brand-creamText-glow transition-colors">
              RAJU SILKS & SAREES
            </span>
            <span className="text-[9px] text-brand-cream/80 tracking-wider font-sans -mt-1 italic">
              An Ethnic Master Weavers Store
            </span>
          </Link>

          {/* Search bar (Large screens) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Search pure silks, Kanjeevarams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-blue/40 text-brand-cream placeholder-brand-cream/50 text-sm py-2 pl-4 pr-10 rounded-full border border-brand-creamText/30 focus:outline-none focus:border-brand-creamText focus:ring-1 focus:ring-brand-creamText"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-brand-creamText hover:text-brand-creamText-glow">
              <Search size={18} />
            </button>
          </form>

          {/* Navigation Links (Large screens) */}
          <nav className="hidden lg:flex space-x-8 items-center text-sm font-sans tracking-wider">
            <Link to="/" className="hover:text-brand-creamText transition-colors">HOME</Link>
            <Link to="/shop" className="hover:text-brand-creamText transition-colors">SHOP COLLECTION</Link>
            <Link to="/shop?category=Kanjeevaram%20Silks" className="hover:text-brand-creamText transition-colors">KANJEEVARAM</Link>
            <Link to="/shop?featured=true" className="hover:text-brand-creamText transition-colors">BEST SELLERS</Link>
          </nav>

          {/* Icon buttons & Profile */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Search Trigger for small/mid screens */}
            <button 
              onClick={() => navigate('/shop')} 
              className="md:hidden text-brand-creamText hover:text-white transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative text-brand-creamText hover:text-white transition-colors">
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white font-bold text-[10px] h-5 w-5 rounded-full flex items-center justify-center border border-brand-blue-deep">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative text-brand-creamText hover:text-white transition-colors">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-creamText text-brand-blue-deep font-bold text-[10px] h-5 w-5 rounded-full flex items-center justify-center border border-brand-blue-deep shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Authentication user menu */}
            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-1.5 focus:outline-none text-brand-creamText hover:text-white transition-colors"
                  >
                    <User size={20} />
                    <span className="text-xs hidden sm:block max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                  </button>

                  {userDropdownOpen && (
                    <>
                      {/* Click outside overlay */}
                      <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2.5 w-52 bg-white rounded-lg shadow-xl py-2 z-50 text-gray-800 border border-brand-creamText/20 animate-fade-in">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-xs text-gray-400">Signed in as</p>
                          <p className="text-sm font-semibold truncate text-brand-blue-deep">{user.name}</p>
                        </div>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-brand-cream text-brand-blue-deep font-medium"
                          >
                            <Sliders size={16} />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-brand-cream text-gray-700"
                        >
                          <User size={16} />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/order-history"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-brand-cream text-gray-700"
                        >
                          <History size={16} />
                          <span>Order History</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm hover:bg-red-50 text-red-600 border-t border-gray-100"
                        >
                          <LogOut size={16} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-brand-creamText hover:bg-brand-creamText-glow text-brand-blue-deep text-xs font-semibold px-4 py-2 rounded-full tracking-wider transition-all duration-200"
                >
                  SIGN IN
                </Link>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-brand-creamText hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-brand-creamText/20 bg-brand-blue-deep px-4 py-6 space-y-4 animate-slide-down">
          {/* Mobile search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-blue/40 text-brand-cream placeholder-brand-cream/50 text-sm py-2 pl-4 pr-10 rounded-full border border-brand-creamText/30"
            />
            <button type="submit" className="absolute right-3 top-2 text-brand-creamText">
              <Search size={18} />
            </button>
          </form>

          {/* Mobile Nav links */}
          <div className="flex flex-col space-y-3 font-sans tracking-wide text-sm pl-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-creamText transition-colors">HOME</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-creamText transition-colors">SHOP ALL SAREES</Link>
            <Link to="/shop?category=Kanjeevaram%20Silks" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-creamText transition-colors">KANJEEVARAM SILKS</Link>
            <Link to="/shop?featured=true" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-creamText transition-colors">BEST SELLERS</Link>
            {user && user.role === 'admin' && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-brand-creamText font-semibold hover:text-white">ADMIN DASHBOARD</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
