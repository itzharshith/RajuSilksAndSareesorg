import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();

  const isSaved = isInWishlist(product._id);
  const discountedPrice = product.price * (1 - (product.discount || 0) / 100);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaved) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product, 1);
    }
  };

  // Helper to handle image fallback visually
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.style.display = 'none';
    e.target.parentNode.querySelector('.fallback-container').style.display = 'flex';
  };

  return (
    <div className="group bg-white rounded-lg border border-brand-creamText/15 overflow-hidden shadow-luxury hover:shadow-luxury-hover hover:border-brand-creamText/45 transition-all duration-300 flex flex-col h-full relative">
      
      {/* Product Image Section */}
      <Link to={`/product/${product._id}`} className="block relative aspect-[4/5] bg-brand-cream overflow-hidden">
        {/* Wishlist Heart */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white text-brand-blue p-2 rounded-full shadow-md border border-brand-creamText/20 transition-all duration-200"
        >
          <Heart size={16} fill={isSaved ? '#721c24' : 'none'} className={isSaved ? 'scale-110' : ''} />
        </button>

        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-brand-creamText text-brand-blue-deep font-sans font-bold text-[10px] tracking-wider px-2.5 py-1 rounded shadow-sm">
            {product.discount}% OFF
          </span>
        )}

        {/* Main Product Image */}
        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            onError={handleImageError}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blue-dark to-brand-blue text-brand-creamText p-4 text-center">
            <span className="font-serif italic text-sm">Raju Silks & Sarees</span>
          </div>
        )}

        {/* Styled CSS Silk Pattern Fallback (Hidden by default, shown if image fails to load) */}
        <div className="fallback-container absolute inset-0 hidden flex-col items-center justify-center bg-gradient-to-br from-brand-blue-dark to-brand-blue text-brand-creamText p-6 text-center border-b border-brand-creamText/15">
          <div className="h-12 w-12 rounded-full border border-brand-creamText/30 flex items-center justify-center mb-2 bg-brand-blue-deep/30">
            <span className="font-serif font-bold text-lg">RS</span>
          </div>
          <span className="font-serif italic text-xs tracking-wider text-brand-creamText/80 block">Premium Ethnic Wear</span>
          <span className="text-[10px] text-brand-cream/60 mt-1 uppercase block max-w-[150px] truncate">{product.name}</span>
        </div>
      </Link>

      {/* Product Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[10px] text-brand-blue/70 font-sans tracking-widest uppercase font-semibold mb-1">
            <span>{product.category?.name || 'Silk Collection'}</span>
            {product.stock <= 3 && product.stock > 0 && (
              <span className="text-orange-600 font-bold">Only {product.stock} Left!</span>
            )}
          </div>

          <Link to={`/product/${product._id}`} className="block">
            <h3 className="font-serif font-bold text-brand-blue-deep text-sm leading-snug hover:text-brand-creamText transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center space-x-1.5 mt-2">
            <div className="flex text-brand-creamText">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < Math.round(product.rating || 5) ? '#D4AF37' : 'none'}
                  className="stroke-brand-creamText"
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-500 font-sans">({product.numReviews || 1})</span>
          </div>
        </div>

        {/* Price & Cart CTA */}
        <div className="mt-4 pt-3 border-t border-brand-cream-dark flex items-center justify-between">
          <div className="flex flex-col">
            {product.discount > 0 ? (
              <>
                <span className="text-brand-blue-deep font-serif font-bold text-base leading-none">
                  ₹{discountedPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-gray-400 line-through mt-1">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
              </>
            ) : (
              <span className="text-brand-blue-deep font-serif font-bold text-base leading-none">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {product.stock > 0 ? (
            <button
              onClick={handleAddToCart}
              className="bg-brand-blue hover:bg-brand-blue-deep text-white p-2 rounded-full border border-brand-creamText/20 hover:border-brand-creamText transition-all duration-200"
              title="Add to Cart"
            >
              <ShoppingCart size={15} />
            </button>
          ) : (
            <span className="text-[10px] text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded font-semibold uppercase tracking-wider">
              Out of Stock
            </span>
          )}
        </div>

      </div>

    </div>
  );
};

export default ProductCard;
