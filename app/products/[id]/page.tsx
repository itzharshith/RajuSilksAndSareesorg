'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCart } from '@/components/providers/CartProvider';
import ProductCard from '@/components/ProductCard';
import { Star, ShieldCheck, Truck, RefreshCw, ShoppingCart, Heart, Send } from 'lucide-react';

interface Review {
  _id: string;
  user: {
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  discount?: number;
  rating?: number;
  numReviews?: number;
  images?: string[];
  category?: {
    _id: string;
    name: string;
  };
  reviews?: Review[];
}

export default function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data: session } = useSession();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Review states
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');

  // Touch swipe state for image gallery
  const touchStartX = React.useRef<number>(0);
  const touchEndX = React.useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const delta = touchStartX.current - touchEndX.current;
    if (Math.abs(delta) < 50) return; // ignore short swipes
    if (delta > 0) {
      // Swiped left — go to next image
      setActiveImageIdx(prev =>
        product && product.images ? Math.min(product.images.length - 1, prev + 1) : prev
      );
    } else {
      // Swiped right — go to previous image
      setActiveImageIdx(prev => Math.max(0, prev - 1));
    }
  };

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          setActiveImageIdx(0);
          setQuantity(1);

          // Fetch Related Products (same category)
          if (data.category?._id) {
            const relRes = await fetch(`/api/products?category=${data.category._id}&limit=4`);
            if (relRes.ok) {
              const relData = await relRes.json();
              if (relData && Array.isArray(relData.products)) {
                const filteredRelated = relData.products.filter((p: Product) => p._id !== data._id);
                setRelatedProducts(filteredRelated);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-cream-text"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-20 text-center animate-fade-in">
        <p className="font-serif italic text-lg text-brand-cream-text mb-4">Masterwork Saree not found.</p>
        <Link href="/shop" className="bg-brand-blue hover:bg-brand-blue-deep text-white text-xs px-6 py-2 rounded-full border border-brand-cream-text/20 transition-colors">
          Back to Shop
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product._id);
  const discount = product.discount || 0;
  const discountedPrice = product.price * (1 - discount / 100);

  const handleQtyChange = (type: 'inc' | 'dec') => {
    if (type === 'inc') {
      setQuantity(prev => Math.min(product.stock, prev + 1));
    } else {
      setQuantity(prev => Math.max(1, prev - 1));
    }
  };

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images,
        stock: product.stock,
        discount: product.discount
      }, quantity);
      alert(`${quantity} item(s) added to cart.`);
    }
  };

  const handleWishlistToggle = () => {
    if (isSaved) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist({
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images,
        stock: product.stock,
        discount: product.discount
      });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) {
      setReviewErrorMsg('Please write a review comment.');
      return;
    }

    try {
      setReviewSubmitLoading(true);
      setReviewErrorMsg('');
      setReviewSuccessMsg('');

      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: ratingInput,
          comment: commentInput
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || 'Failed to submit review');
      }

      setReviewSuccessMsg('Thank you! Your review has been saved.');
      setCommentInput('');

      // Reload product details to show new review
      const updatedRes = await fetch(`/api/products/${product._id}`);
      if (updatedRes.ok) {
        const updatedData = await updatedRes.json();
        setProduct(updatedData);
      }
    } catch (err: any) {
      setReviewErrorMsg(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.onerror = null;
    target.style.display = 'none';
    const fallback = target.parentNode?.querySelector('.details-fallback-container') as HTMLElement;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  const user = session?.user;

  return (
    <div className="min-h-screen pt-12 pb-28 md:pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumbs */}
        <div className="text-xs text-brand-cream-text/60 mb-8 flex items-center space-x-1.5 font-sans">
          <Link href="/" className="hover:text-brand-cream-text transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-brand-cream-text transition-colors">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${encodeURIComponent(product.category?.name || '')}`} className="hover:text-brand-cream-text transition-colors">{product.category?.name}</Link>
          <span>/</span>
          <span className="text-brand-cream-text font-semibold truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Product core structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 glass-panel rounded-xl border border-brand-cream-text/15 p-6 md:p-8 shadow-luxury mb-12">

          {/* Left Column: Image Previews */}
          <div className="space-y-4">

            {/* Active Display — touch swipeable on mobile */}
            <div
              className="aspect-[4/5] bg-black/20 rounded-lg overflow-hidden border border-brand-cream-text/10 relative select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {product.images && product.images[activeImageIdx] ? (
                <img
                  src={product.images[activeImageIdx]}
                  alt={product.name}
                  onError={handleImageError}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blue-dark to-brand-blue text-brand-cream-text font-serif italic text-lg p-6">
                  Raju Silks & Sarees
                </div>
              )}

              {/* Styled Fallback */}
              <div className="details-fallback-container absolute inset-0 hidden flex-col items-center justify-center bg-gradient-to-br from-brand-blue-dark to-brand-blue text-brand-cream-text p-6 text-center">
                <div className="h-16 w-16 rounded-full border border-brand-cream-text/30 flex items-center justify-center mb-3 bg-brand-blue-deep/30 shadow-inner">
                  <span className="font-serif font-bold text-xl">RS</span>
                </div>
                <span className="font-serif italic text-sm tracking-wider text-brand-cream-text/80 block mb-1">Premium Ethnic Masterwork</span>
                <span className="text-xs text-brand-cream/60 mt-1 uppercase max-w-[250px] truncate">{product.name}</span>
              </div>
            </div>

            {/* Thumbnails row + swipe hint on mobile */}
            {product.images && product.images.length > 1 && (
              <>
                <div className="flex gap-3 overflow-x-auto py-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`h-20 w-16 bg-black/20 rounded overflow-hidden border-2 shrink-0 transition-all duration-150 ${activeImageIdx === idx ? 'border-brand-cream-text shadow-md' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                {/* Swipe indicator dots — mobile only */}
                {product.images.length > 1 && (
                  <div className="flex justify-center gap-1.5 sm:hidden pb-1">
                    {product.images.map((_, idx) => (
                      <span
                        key={idx}
                        className={`block rounded-full transition-all duration-200 ${
                          activeImageIdx === idx
                            ? 'w-4 h-1.5 bg-brand-gold'
                            : 'w-1.5 h-1.5 bg-brand-cream-text/30'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

          </div>

          {/* Right Column: Descriptions & Actions */}
          <div className="flex flex-col justify-between">
            <div className="space-y-5">
              <span className="text-xs text-brand-blue font-sans tracking-widest font-bold uppercase">{product.category?.name}</span>

              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-brand-blue-deep leading-tight">
                {product.name}
              </h1>

              {/* Star Rating details */}
              <div className="flex items-center space-x-2">
                <div className="flex text-brand-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={15}
                      fill={i < Math.round(product.rating || 5) ? '#D4AF37' : 'none'}
                      className="stroke-brand-gold"
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-sans font-medium">({product.numReviews || 0} customer reviews)</span>
              </div>

              {/* Price Details */}
              <div className="p-4 bg-brand-cream/40 border border-brand-cream-text/10 rounded-lg flex items-center gap-4">
                <div className="flex flex-col">
                  {discount > 0 ? (
                    <>
                      <div className="flex items-baseline space-x-2.5">
                        <span className="text-2xl font-serif font-bold text-brand-blue-deep">
                          ₹{discountedPrice.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-brand-cream-text font-sans font-bold uppercase tracking-wider bg-brand-blue/10 px-2 py-0.5 rounded">
                          {discount}% OFF
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 line-through mt-1">
                        M.R.P: ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-serif font-bold text-brand-blue-deep">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {/* Inventory availability indicator */}
              <div className="flex items-center text-xs font-sans">
                <span className="text-gray-500 mr-2">Availability:</span>
                {product.stock > 0 ? (
                  <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded font-semibold uppercase tracking-wider">
                    In Stock ({product.stock} units)
                  </span>
                ) : (
                  <span className="text-rose-400 bg-rose-500/10 border border-rose-500/25 px-2.5 py-1 rounded font-semibold uppercase tracking-wider">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Saree description body */}
              <div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2 font-sans">Description</span>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-sans font-normal">
                  {product.description}
                </p>
              </div>

              {/* Core features block */}
              <div className="grid grid-cols-3 gap-3 border-y border-brand-cream-dark py-4 text-center">
                <div className="flex flex-col items-center">
                  <ShieldCheck size={18} className="text-brand-blue mb-1" />
                  <span className="text-[10px] text-gray-700 font-semibold uppercase">100% Pure Silk</span>
                </div>
                <div className="flex flex-col items-center border-x border-brand-cream-dark">
                  <Truck size={18} className="text-brand-blue mb-1" />
                  <span className="text-[10px] text-gray-700 font-semibold uppercase">Free Delivery</span>
                </div>
                <div className="flex flex-col items-center">
                  <RefreshCw size={18} className="text-brand-blue mb-1" />
                  <span className="text-[10px] text-gray-700 font-semibold uppercase">Easy Exchange</span>
                </div>
              </div>
            </div>

            {/* Shopping Cart CTAs */}
            <div className="mt-8 space-y-4">
              {product.stock > 0 && (
                <div className="flex items-center space-x-4">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-brand-cream-text/30 rounded-full bg-brand-cream/50 overflow-hidden">
                    <button
                      onClick={() => handleQtyChange('dec')}
                      className="px-3.5 py-2 hover:bg-brand-cream-text/15 text-brand-blue font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-xs font-bold text-brand-blue-deep font-sans">{quantity}</span>
                    <button
                      onClick={() => handleQtyChange('inc')}
                      className="px-3.5 py-2 hover:bg-brand-cream-text/15 text-brand-blue font-bold text-sm"
                    >
                      +
                    </button>
                  </div>

                  {/* Add to cart button */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-brand-blue hover:bg-brand-blue-deep text-white font-sans font-semibold tracking-wider text-xs py-3 rounded-full flex items-center justify-center space-x-2 shadow-md transition-all duration-200 border border-brand-cream-text/20"
                  >
                    <ShoppingCart size={15} />
                    <span>ADD TO CART</span>
                  </button>
                </div>
              )}

              {/* Wishlist toggle */}
              <button
                onClick={handleWishlistToggle}
                className={`w-full py-2.5 rounded-full border text-xs font-semibold tracking-wider flex items-center justify-center space-x-2 transition-all duration-150 ${isSaved
                    ? 'bg-brand-blue/5 border-brand-blue text-brand-blue-deep'
                    : 'bg-white border-brand-cream-text/20 text-gray-700 hover:border-brand-cream-text'
                  }`}
              >
                <Heart size={14} fill={isSaved ? '#721c24' : 'none'} />
                <span>{isSaved ? 'REMOVE FROM WISHLIST' : 'ADD TO WISHLIST'}</span>
              </button>
            </div>

          </div>

        </div>

        {/* Reviews Section */}
        <div className="glass-panel rounded-xl border border-brand-cream-text/15 p-6 md:p-8 shadow-luxury mb-12">
          <h2 className="font-serif font-bold text-xl text-brand-blue-deep tracking-wider mb-6">
            Customer Reviews & Feedback
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Reviews list */}
            <div className="lg:col-span-2 space-y-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div key={rev._id} className="p-4 border border-brand-cream-text/10 bg-brand-cream/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-semibold text-brand-blue-deep block">{rev.user?.name}</span>
                        <span className="text-[10px] text-gray-400 font-sans">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex text-brand-cream-text">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            fill={i < rev.rating ? '#D4AF37' : 'none'}
                            className="stroke-brand-cream-text"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-sans">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 border border-dashed border-brand-cream-text/20 rounded-lg">
                  <p className="text-xs text-gray-500 font-sans">No reviews submitted yet for this saree. Be the first to review!</p>
                </div>
              )}
            </div>

            {/* Add Review Panel */}
            <div className="bg-brand-cream/25 border border-brand-cream-text/15 p-5 rounded-lg h-fit">
              <h3 className="text-xs font-bold text-brand-blue-deep uppercase tracking-widest mb-4">Write a Review</h3>
              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {reviewSuccessMsg && <p className="text-xs font-semibold text-green-700">{reviewSuccessMsg}</p>}
                  {reviewErrorMsg && <p className="text-xs font-semibold text-red-700">{reviewErrorMsg}</p>}

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Rating</label>
                    <div className="flex items-center space-x-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingInput(star)}
                          className="text-brand-cream-text focus:outline-none"
                        >
                          <Star
                            size={18}
                            fill={star <= ratingInput ? '#D4AF37' : 'none'}
                            className="stroke-brand-cream-text hover:scale-110 transition-transform"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">Your Experience</label>
                    <textarea
                      rows={3}
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Comment on the texture, weave, look..."
                      className="w-full text-xs bg-white border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitLoading}
                    className="w-full bg-brand-blue hover:bg-brand-blue-deep text-white font-sans font-semibold tracking-wider text-xs py-2 rounded-lg flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    <Send size={12} />
                    <span>{reviewSubmitLoading ? 'SAVING...' : 'SUBMIT REVIEW'}</span>
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500 font-sans mb-3">Please sign in to write a product review.</p>
                  <Link
                    href="/login"
                    className="inline-block bg-brand-blue text-white text-[11px] font-semibold px-4 py-1.5 rounded-full"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="font-serif font-bold text-lg text-brand-cream-text tracking-wider mb-6">
              You May Also Adore
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Sticky Mobile Add To Cart CTA Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-30 glass-dark border-t border-white/10 px-4 py-3.5 flex items-center justify-between shadow-[0_-6px_24px_rgba(7,17,30,0.3)] md:hidden backdrop-blur-md">
        <div className="flex flex-col justify-center">
          <span className="text-[10px] text-brand-cream-text/50 uppercase tracking-widest leading-none font-sans mb-0.5">Total Price</span>
          <span className="text-lg font-serif font-bold text-brand-cream-text leading-none">
            ₹{discountedPrice.toLocaleString('en-IN')}
          </span>
          {discount > 0 && (
            <span className="text-[10px] text-brand-gold font-sans font-bold mt-0.5">{discount}% OFF applied</span>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          {/* Wishlist quick-toggle */}
          <button
            onClick={handleWishlistToggle}
            className={`h-11 w-11 rounded-full border flex items-center justify-center shrink-0 transition-all duration-150 touch-manipulation ${
              isSaved
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-white/10 border-white/20 text-brand-cream-text active:bg-white/20'
            }`}
            aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={18} fill={isSaved ? '#ef4444' : 'none'} className="transition-colors" />
          </button>

          {product.stock > 0 ? (
            <button
              onClick={handleAddToCart}
              className="bg-brand-blue hover:bg-brand-blue-deep active:scale-95 text-white font-sans font-bold tracking-wider text-[11px] h-11 px-6 rounded-full flex items-center justify-center space-x-2 border border-brand-cream-text/20 shadow-md transition-all duration-150 touch-manipulation"
            >
              <ShoppingCart size={15} />
              <span>ADD TO CART</span>
            </button>
          ) : (
            <span className="text-[10px] text-red-700 bg-red-50 border border-red-200 px-4 py-2.5 rounded-full font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
