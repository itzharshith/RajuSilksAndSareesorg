import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Extract params from URL
  const urlCategory = searchParams.get('category') || '';
  const urlSearch = searchParams.get('search') || '';
  const urlFeatured = searchParams.get('featured') || '';
  const urlDiscount = searchParams.get('discount') || '';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        const { data } = await api.get('/api/categories');
        setCategories(data);
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
        // 'newest' is default in backend

        const { data } = await api.get(url);
        setProducts(data.products);
        setTotalPages(data.pages);
        setTotalProducts(data.total);
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
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-brand-cream min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page title */}
        <div className="text-center mb-10">
          <span className="font-serif italic text-brand-creamText text-sm tracking-widest block uppercase mb-1">RAJU SILKS & SAREES</span>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-brand-blue-deep tracking-wider">
            The Weaves of Heritage
          </h1>
          <div className="h-0.5 w-28 bg-brand-creamText mx-auto mt-2"></div>
        </div>

        {/* Layout container */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Filters Panel */}
          <div className="bg-white rounded-xl border border-brand-creamText/15 p-6 shadow-luxury h-fit space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-brand-cream-dark">
              <span className="font-serif font-bold text-base text-brand-blue-deep flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-brand-creamText" />
                Refine Collection
              </span>
              <button 
                onClick={handleResetFilters}
                className="text-[11px] font-sans font-bold text-brand-blue hover:text-brand-creamText flex items-center gap-1 transition-colors uppercase tracking-wider"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </div>

            {/* Search filter in side */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Search Items</label>
              <input
                type="text"
                placeholder="Keywords..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full text-xs bg-brand-cream/40 border border-brand-creamText/15 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-creamText text-gray-800"
              />
            </div>

            {/* Category filter */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Category</label>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                <button
                  onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded transition-all duration-150 ${
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
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded transition-all duration-150 ${
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
                  className="w-full text-xs bg-brand-cream/40 border border-brand-creamText/15 rounded-lg py-2 px-2.5 focus:outline-none focus:border-brand-creamText text-gray-800"
                />
                <span className="text-gray-400 text-xs">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                  className="w-full text-xs bg-brand-cream/40 border border-brand-creamText/15 rounded-lg py-2 px-2.5 focus:outline-none focus:border-brand-creamText text-gray-800"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(e) => { setFeaturedOnly(e.target.checked); setCurrentPage(1); }}
                  className="h-4 w-4 rounded border-brand-creamText/30 text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-xs text-gray-700 font-medium select-none">Featured Masterpieces</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={discountOnly}
                  onChange={(e) => { setDiscountOnly(e.target.checked); setCurrentPage(1); }}
                  className="h-4 w-4 rounded border-brand-creamText/30 text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-xs text-gray-700 font-medium select-none">Discounted Offers</span>
              </label>
            </div>

          </div>

          {/* Right Column: Catalog Grid */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-brand-creamText/15 p-4 shadow-luxury flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-gray-500 font-sans">
                Showing <span className="font-semibold text-brand-blue-deep">{products.length}</span> of <span className="font-semibold text-brand-blue-deep">{totalProducts}</span> weavers creations
              </span>

              {/* Sorting dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-sans">Sort By:</span>
                <select
                  value={sortOption}
                  onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
                  className="text-xs bg-brand-cream/40 border border-brand-creamText/15 rounded-lg py-1.5 px-3 focus:outline-none focus:border-brand-creamText text-gray-800"
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
              <div className="bg-white border border-brand-creamText/15 rounded-xl p-16 text-center shadow-luxury">
                <p className="font-serif italic text-brand-blue-deep text-lg mb-2">No masterworks found matching your filter selections.</p>
                <p className="text-xs text-gray-500 mb-6">Try resetting the collection filters or searching for keywords.</p>
                <button
                  onClick={handleResetFilters}
                  className="bg-brand-blue hover:bg-brand-blue-deep text-white text-xs font-semibold px-6 py-2.5 rounded-full border border-brand-creamText/20"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
                      className="p-2 border border-brand-creamText/20 rounded-lg hover:border-brand-creamText disabled:opacity-40 disabled:cursor-not-allowed bg-white text-brand-blue transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                          currentPage === i + 1
                            ? 'bg-brand-blue border-brand-creamText text-white shadow-md'
                            : 'bg-white border-brand-creamText/15 text-gray-600 hover:border-brand-creamText'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 border border-brand-creamText/20 rounded-lg hover:border-brand-creamText disabled:opacity-40 disabled:cursor-not-allowed bg-white text-brand-blue transition-colors"
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
};

export default Shop;
