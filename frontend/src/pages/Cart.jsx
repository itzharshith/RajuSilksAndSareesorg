import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ArrowRight, ShoppingCart, Ticket, X } from 'lucide-react';

const Cart = () => {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal, 
    coupon, 
    couponError, 
    applyCoupon, 
    removeCoupon 
  } = useCart();
  const navigate = useNavigate();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getCartTotal();
  const discountVal = coupon ? (coupon.discountType === 'flat' ? Math.min(subtotal, coupon.discountValue) : (subtotal * (coupon.discountValue / 100))) : 0;
  const taxableAmount = subtotal - discountVal;

  // 5% GST on textiles
  const taxAmount = Math.round(taxableAmount * 0.05);

  // Shipping charges: Rs. 100 flat, free above Rs. 5000
  const shippingCharges = taxableAmount > 5000 || taxableAmount === 0 ? 0 : 100;

  const totalAmount = Math.round(taxableAmount + taxAmount + shippingCharges);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    try {
      setCouponLoading(true);
      const success = await applyCoupon(couponCodeInput.trim());
      if (success) {
        setCouponCodeInput('');
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="bg-brand-cream min-h-screen py-20 font-sans">
        <div className="max-w-md mx-auto px-6 py-12 bg-white rounded-xl border border-brand-creamText/15 shadow-luxury text-center">
          <div className="h-16 w-16 bg-brand-cream text-brand-blue mx-auto rounded-full flex items-center justify-center mb-4 border border-brand-creamText/15">
            <ShoppingCart size={28} />
          </div>
          <h1 className="font-serif font-bold text-xl text-brand-blue-deep mb-2">Your Shopping Cart is Empty</h1>
          <p className="text-xs text-gray-500 mb-8 leading-relaxed">Browse our master weavers collections to discover elegant silk creations and place your first order.</p>
          <Link
            to="/shop"
            className="inline-block bg-brand-blue hover:bg-brand-blue-deep text-white text-xs font-semibold tracking-wider px-8 py-3 rounded-full border border-brand-creamText/20"
          >
            START SHOPPING
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-brand-blue-deep tracking-wider mb-8">
          Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Side: Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const product = item.product;
              const discountedPrice = product.price * (1 - (product.discount || 0) / 100);
              return (
                <div 
                  key={product._id} 
                  className="bg-white rounded-xl border border-brand-creamText/15 p-4 flex gap-4 shadow-luxury hover:border-brand-creamText/30 transition-all duration-200"
                >
                  {/* Image */}
                  <Link to={`/product/${product._id}`} className="h-24 w-20 shrink-0 bg-brand-cream rounded overflow-hidden border border-brand-creamText/10">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  </Link>

                  {/* Details column */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <Link to={`/product/${product._id}`} className="hover:text-brand-creamText">
                          <h3 className="font-serif font-bold text-brand-blue-deep text-sm leading-snug line-clamp-1">{product.name}</h3>
                        </Link>
                        <button
                          onClick={() => removeFromCart(product._id)}
                          className="text-gray-400 hover:text-red-700 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase">{product.category?.name || 'Silk Sarees'}</p>
                    </div>

                    {/* Price and quantity adjuster */}
                    <div className="flex flex-wrap justify-between items-center gap-2 mt-3 pt-2 border-t border-brand-cream-dark">
                      
                      {/* Price calculations */}
                      <div className="flex items-baseline space-x-2">
                        <span className="text-sm font-serif font-bold text-brand-blue-deep">
                          ₹{discountedPrice.toLocaleString('en-IN')}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-[10px] text-gray-400 line-through">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center border border-brand-creamText/30 rounded-full bg-brand-cream/50 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(product._id, item.quantity - 1)}
                          className="px-2.5 py-1 hover:bg-brand-creamText/15 text-brand-blue font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-brand-blue-deep font-sans">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(product._id, item.quantity + 1)}
                          disabled={item.quantity >= product.stock}
                          className="px-2.5 py-1 hover:bg-brand-creamText/15 text-brand-blue font-bold text-xs disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Right Side: Order Summary Panel */}
          <div className="space-y-6">
            
            {/* Coupon Panel */}
            <div className="bg-white rounded-xl border border-brand-creamText/15 p-5 shadow-luxury">
              <span className="text-xs font-bold text-brand-blue-deep uppercase tracking-widest block mb-3 flex items-center gap-1.5">
                <Ticket size={16} className="text-brand-creamText" />
                Apply Coupon
              </span>

              {coupon ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-green-800 block">Code: {coupon.code}</span>
                    <span className="text-[10px] text-green-600 font-medium">{coupon.discountType === 'flat' ? `₹${coupon.discountValue} flat` : `${coupon.discountValue}%`} discount applied</span>
                  </div>
                  <button onClick={removeCoupon} className="text-green-800 hover:text-red-700 p-1">
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value)}
                      className="flex-1 text-xs bg-brand-cream/30 border border-brand-creamText/15 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-creamText text-gray-800 uppercase"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="bg-brand-blue hover:bg-brand-blue-deep text-white font-sans text-xs font-bold px-4 py-2 rounded-lg border border-brand-creamText/25"
                    >
                      {couponLoading ? '...' : 'APPLY'}
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] font-semibold text-red-700">{couponError}</p>}
                </form>
              )}

              {/* Quick hints */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                <button 
                  onClick={() => applyCoupon('WELCOME10')} 
                  className="text-[10px] bg-brand-cream hover:bg-brand-creamText/10 border border-brand-creamText/20 text-brand-blue px-2.5 py-1 rounded"
                >
                  WELCOME10 (10%)
                </button>
                <button 
                  onClick={() => applyCoupon('FESTIVE15')} 
                  className="text-[10px] bg-brand-cream hover:bg-brand-creamText/10 border border-brand-creamText/20 text-brand-blue px-2.5 py-1 rounded"
                >
                  FESTIVE15 (15%)
                </button>
                <button 
                  onClick={() => applyCoupon('FLAT500')} 
                  className="text-[10px] bg-brand-cream hover:bg-brand-creamText/10 border border-brand-creamText/20 text-brand-blue px-2.5 py-1 rounded"
                >
                  FLAT500 (₹500 Flat)
                </button>
              </div>
            </div>

            {/* Calculations Card */}
            <div className="bg-white rounded-xl border border-brand-creamText/15 p-6 shadow-luxury space-y-4">
              <span className="font-serif font-bold text-base text-brand-blue-deep tracking-wider block border-b border-brand-cream-dark pb-3">
                Order Summary
              </span>

              <div className="space-y-2.5 text-xs font-sans text-gray-600">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-gray-800">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                
                {coupon && (
                  <div className="flex justify-between text-green-700">
                    <span>Coupon Discount {coupon.discountType === 'flat' ? '' : `(${coupon.discountValue}%)`}</span>
                    <span className="font-semibold">-₹{discountVal.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Tax (5% GST)</span>
                  <span className="font-semibold text-gray-800">₹{taxAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-gray-800">
                    {shippingCharges > 0 ? `₹${shippingCharges}` : <span className="text-green-700">FREE</span>}
                  </span>
                </div>

                <div className="border-t border-brand-cream-dark pt-3 flex justify-between text-brand-blue-deep font-bold text-sm">
                  <span>Total Amount</span>
                  <span className="font-serif text-base">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-brand-blue hover:bg-brand-blue-deep text-white font-sans font-semibold tracking-wider text-xs py-3.5 rounded-full flex items-center justify-center space-x-2 shadow-md transition-all duration-200 border border-brand-creamText/20"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Cart;
