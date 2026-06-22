'use client';
import React from 'react';
import Link from 'next/link';
import { useCart, Product } from '@/components/providers/CartProvider';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  const handleMoveToCart = (product: Product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id);
  };

  if (wishlist.length === 0) {
    return (
      <div className="bg-brand-cream min-h-screen py-20 font-sans">
        <div className="max-w-md mx-auto px-6 py-12 bg-white rounded-xl border border-brand-cream-text/15 shadow-luxury text-center">
          <div className="h-16 w-16 bg-brand-cream text-brand-blue mx-auto rounded-full flex items-center justify-center mb-4 border border-brand-cream-text/15">
            <Heart size={28} />
          </div>
          <h1 className="font-serif font-bold text-xl text-brand-blue-deep mb-2">Your Wishlist is Empty</h1>
          <p className="text-xs text-gray-500 mb-8 leading-relaxed">Save your favorite traditional handloomed sarees to review them later and add them to your cart.</p>
          <Link
            href="/shop"
            className="inline-block bg-brand-blue hover:bg-brand-blue-deep text-white text-xs font-semibold tracking-wider px-8 py-3 rounded-full border border-brand-cream-text/20"
          >
            EXPLORE COLLECTIONS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-brand-blue-deep tracking-wider mb-8">
          My Saved Wishlist
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => {
            const discount = product.discount || 0;
            const discountedPrice = product.price * (1 - discount / 100);
            return (
              <div 
                key={product._id} 
                className="bg-white rounded-lg border border-brand-cream-text/15 overflow-hidden shadow-luxury hover:border-brand-cream-text/30 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/5] bg-brand-cream overflow-hidden">
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="absolute top-3 right-3 z-10 bg-white/90 text-red-700 p-2 rounded-full shadow-md border border-brand-cream-text/15"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={14} />
                  </button>

                  <img src={product.images?.[0] || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover" />
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-brand-blue/70 font-sans tracking-widest uppercase block mb-1 font-semibold">
                      {product.category?.name || 'Silk Sarees'}
                    </span>
                    <Link href={`/products/${product._id}`}>
                      <h3 className="font-serif font-bold text-brand-blue-deep text-xs sm:text-sm line-clamp-2 leading-snug hover:text-brand-cream-text">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="mt-4 pt-3 border-t border-brand-cream-dark flex flex-col gap-3">
                    {/* Price */}
                    <div className="flex items-baseline space-x-2">
                      <span className="text-sm font-serif font-bold text-brand-blue-deep">
                        ₹{discountedPrice.toLocaleString('en-IN')}
                      </span>
                      {discount > 0 && (
                        <span className="text-[10px] text-gray-400 line-through">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Move to Cart */}
                    {product.stock > 0 ? (
                      <button
                        onClick={() => handleMoveToCart(product)}
                        className="w-full bg-brand-blue hover:bg-brand-blue-deep text-white font-sans text-xs font-semibold py-2 rounded-full border border-brand-cream-text/20 flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <ShoppingCart size={13} />
                        <span>MOVE TO CART</span>
                      </button>
                    ) : (
                      <span className="text-center text-[10px] text-red-700 bg-red-50 border border-red-200 py-1.5 rounded uppercase font-semibold">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
