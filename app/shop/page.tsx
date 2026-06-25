'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { SlidersHorizontal, RotateCcw, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  discount?: number;
  rating?: number;
  numReviews?: number;
  images?: string[];
  category?: {
    _id: string;
    name: string;
  };
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Extract params from URL
  const urlCategory = searchParams.get('category') || '';
  const urlSearch = searchParams.get('search') || '';
  const urlFeatured = searchParams.get('featured') || '';
  const urlDiscount = searchParams.get('discount') || '';

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(urlFeatured === 'true');
  const [discountOnly, setDiscountOnly] = useState(urlDiscount === 'true');
  const [sortOption, setSortOption] = useState('newest');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Sync state if URL changes
  useEffect(() => {
    setSelectedCategory(urlCategory);
    setSearchQuery(urlSearch);
    setFeaturedOnly(urlFeatured === 'true');
    setDiscountOnly(urlDiscount === 'true');
  }, [urlCategory, urlSearch, urlFeatured, urlDiscount]);

  // Load Categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setCategories(data);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products based on state changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let url = `/api/products?page=${currentPage}&limit=8`;

        if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
        if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
        if (minPrice) url += `&minPrice=${minPrice}`;
        if (maxPrice) url += `&maxPrice=${maxPrice}`;
        if (featuredOnly) url += `&featured=true`;
        if (discountOnly) url += `&discount=true`;

        // Sort mappings
        if (sortOption === 'priceAsc') url += `&sort=priceAsc`;
        else if (sortOption === 'priceDesc') url += `&sort=priceDesc`;
        else if (sortOption === 'discount') url += `&sort=discount`;

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.products)) {
            setProducts(data.products);
            setTotalPages(data.pages || 1);
            setTotalProducts(data.total || 0);
          }
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, searchQuery, minPrice, maxPrice, featuredOnly, discountOnly, sortOption, currentPage]);

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setFeaturedOnly(false);
    setDiscountOnly(false);
    setSortOption('newest');
    setCurrentPage(1);
    router.push('/shop');
    setMobileFiltersOpen(false);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-brand-cream min-h-screen py-6 sm:py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page title */}
        <div className="text-center mb-6 sm:mb-10">
          <span className="font-serif italic text-brand-cream-text text-xs sm:text-sm tracking-widest block uppercase mb-1">RAJU SILKS & SAREES</span>
          <h1 className="font-serif font-bold text-2xl sm:text-4xl text-brand-blue-deep tracking-wider">
            The Weaves of Heritage
          </h1>
          <div className="h-0.5 w-20 sm:w-28 bg-brand-cream-text mx-auto mt-2"></div>
        </div>

        {/* Sticky Mobile Search, Sort & Filter Bar */}
        <div className="sticky top-16 z-30 bg-brand-cream/95 backdrop-blur-md shadow-sm border-b border-brand-cream-text/10 -mx-4 px-4 py-3 mb-6 flex flex-col gap-2.5 lg:hidden">
          {/* Search bar */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search silk sarees & handlooms..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full text-xs bg-white border border-brand-cream-text/20 rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:border-brand-gold text-gray-800 shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>
          
          {/* Filter & Sort controls side-by-side */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex-1 bg-white hover:bg-brand-cream-text/10 text-brand-blue-deep text-xs font-bold py-2.5 px-4 rounded-xl border border-brand-cream-text/20 flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
            >
              <SlidersHorizontal size={14} className="text-brand-gold" />
              <span>Filters</span>
              {(selectedCategory || searchQuery || minPrice || maxPrice || featuredOnly || discountOnly) && (
                <span className="h-2 w-2 rounded-full bg-brand-gold animate-pulse"></span>
              )}
            </button>

            <div className="flex-1 relative">
              <select
                value={sortOption}
                onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
                className="w-full text-xs bg-white border border-brand-cream-text/20 rounded-xl py-2.5 px-4 focus:outline-none focus:border-brand-gold text-brand-blue-deep font-bold appearance-none shadow-sm text-center"
              >
                <option value="newest">Sort: New</option>
                <option value="priceAsc">Price: Low-High</option>
                <option value="priceDesc">Price: High-Low</option>
                <option value="discount">Sort: Discount</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-brand-gold">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="text-center mt-1">
            <span className="text-[10px] text-gray-500 font-sans">
              Showing <span className="font-semibold text-brand-blue-deep">{products.length}</span> of <span className="font-semibold text-brand-blue-deep">{totalProducts}</span> weavers creations
            </span>
          </div>
        </div>

        {/* Layout container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
          
          {/* Mobile Filter Drawer Overlay */}
          {mobileFiltersOpen && (
            <div 
              className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden transition-opacity duration-300"
              onClick={() => setMobileFiltersOpen(false)}
            />
          )}

          {/* Left Column: Filters Panel - Bottom Slide-up Drawer on Mobile, Sidebar on Desktop */}
          <div className={`
            bg-white p-6 space-y-6 transition-transform duration-300 ease-in-out z-50
            fixed bottom-0 left-0 right-0 rounded-t-3xl border-t border-brand-cream-text/20 max-h-[85vh] overflow-y-auto shadow-[0_-10px_40px_rgba(7,17,30,0.15)]
            lg:static lg:w-auto lg:translate-y-0 lg:max-h-none lg:rounded-xl lg:border lg:border-brand-cream-text/15 lg:shadow-luxury lg:block
            ${mobileFiltersOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
          `}>
            {/* Drawer handle bar for touch drag indicator */}
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 lg:hidden" />

            <div className="flex items-center justify-between pb-4 border-b border-brand-cream-dark">
              <span className="font-serif font-bold text-base text-brand-blue-deep flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-brand-cream-text" />
                Refine Collection
              </span>
              <button 
                onClick={handleResetFilters}
                className="text-[11px] font-sans font-bold text-brand-blue hover:text-brand-cream-text flex items-center gap-1 transition-colors uppercase tracking-wider"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </div>

            {/* Search filter in side (Desktop only, since mobile has sticky search) */}
            <div className="hidden lg:block">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Search Items</label>
              <input
                type="text"
                placeholder="Keywords..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full text-xs bg-brand-cream/40 border border-brand-cream-text/15 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-cream-text text-gray-800"
              />
            </div>

            {/* Category filter */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Category</label>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-2">
                <button
                  onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}
                  className={`w-full text-left text-xs px-2.5 py-2 rounded transition-all duration-150 ${
                    !selectedCategory 
                      ? 'bg-brand-blue text-white font-semibold' 
                      : 'hover:bg-brand-cream text-gray-600'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => { setSelectedCategory(cat.name); setCurrentPage(1); }}
                    className={`w-full text-left text-xs px-2.5 py-2 rounded transition-all duration-150 ${
                      selectedCategory === cat.name 
                        ? 'bg-brand-blue text-white font-semibold' 
                        : 'hover:bg-brand-cream text-gray-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price filter */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Price Range (₹)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs bg-brand-cream/40 border border-brand-cream-text/15 rounded-lg py-2 px-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800 h-10"
                />
                <span className="text-gray-400 text-xs">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs bg-brand-cream/40 border border-brand-cream-text/15 rounded-lg py-2 px-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800 h-10"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3.5 pt-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(e) => { setFeaturedOnly(e.target.checked); setCurrentPage(1); }}
                  className="h-5 w-5 rounded border-brand-cream-text/30 text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-xs text-gray-700 font-semibold select-none">Featured Masterpieces</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={discountOnly}
                  onChange={(e) => { setDiscountOnly(e.target.checked); setCurrentPage(1); }}
                  className="h-5 w-5 rounded border-brand-cream-text/30 text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-xs text-gray-700 font-semibold select-none">Discounted Offers</span>
              </label>
            </div>

            {/* Mobile Close / Apply Button */}
            <div className="pt-4 border-t border-brand-cream-dark lg:hidden">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full bg-brand-blue hover:bg-brand-blue-deep text-white font-sans font-bold text-xs py-3.5 rounded-xl shadow-md uppercase tracking-wider transition-all"
              >
                Apply Filters
              </button>
            </div>

          </div>

          {/* Right Column: Catalog Grid */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Desktop Toolbar (Hidden on Mobile) */}
            <div className="hidden lg:flex bg-white rounded-xl border border-brand-cream-text/15 p-4 shadow-luxury items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 font-sans">
                  Showing <span className="font-semibold text-brand-blue-deep">{products.length}</span> of <span className="font-semibold text-brand-blue-deep">{totalProducts}</span> weavers creations
                </span>
              </div>

              {/* Sorting dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-sans">Sort By:</span>
                <select
                  value={sortOption}
                  onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
                  className="text-xs bg-brand-cream/40 border border-brand-cream-text/15 rounded-lg py-1.5 px-3 focus:outline-none focus:border-brand-cream-text text-gray-800"
                >
                  <option value="newest">New Arrivals</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="discount">Highest Discounts</option>
                </select>
              </div>
            </div>

            {/* Product display grid */}
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-blue"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-brand-cream-text/15 rounded-xl p-16 text-center shadow-luxury">
                <p className="font-serif italic text-brand-blue-deep text-lg mb-2">No masterworks found matching your filter selections.</p>
                <p className="text-xs text-gray-500 mb-6">Try resetting the collection filters or searching for keywords.</p>
                <button
                  onClick={handleResetFilters}
                  className="bg-brand-blue hover:bg-brand-blue-deep text-white text-xs font-semibold px-6 py-2.5 rounded-full border border-brand-cream-text/20"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                  {products.map((prod) => (
                    <ProductCard key={prod._id} product={prod} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 pt-6">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 border border-brand-cream-text/20 rounded-lg hover:border-brand-cream-text disabled:opacity-40 disabled:cursor-not-allowed bg-white text-brand-blue transition-colors h-10 w-10 flex items-center justify-center"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 h-10 min-w-10 flex items-center justify-center ${
                          currentPage === i + 1
                            ? 'bg-brand-blue border-brand-cream-text text-white shadow-md'
                            : 'bg-white border-brand-cream-text/15 text-gray-600 hover:border-brand-cream-text'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-brand-cream-text/20 rounded-lg hover:border-brand-cream-text disabled:opacity-40 disabled:cursor-not-allowed bg-white text-brand-blue transition-colors h-10 w-10 flex items-center justify-center"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
