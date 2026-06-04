import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { CreditCard, MapPin, Plus, CheckCircle, AlertTriangle } from 'lucide-react';

const Checkout = () => {
  const { user, addAddress } = useAuth();
  const { cartItems, getCartTotal, coupon, clearCart } = useCart();
  const navigate = useNavigate();

  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [addingNewAddress, setAddingNewAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Custom mock Razorpay Modal overlay state
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [createdOrderDetails, setCreatedOrderDetails] = useState(null);

  // Address Form state
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [addressLoading, setAddressLoading] = useState(false);

  // Redirect if cart is empty on load
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Set default address
  useEffect(() => {
    if (user?.addresses) {
      const defaultIdx = user.addresses.findIndex(addr => addr.isDefault);
      if (defaultIdx !== -1) {
        setSelectedAddressIdx(defaultIdx);
      }
    }
  }, [user]);

  const subtotal = getCartTotal();
  const discountVal = coupon ? (coupon.discountType === 'flat' ? Math.min(subtotal, coupon.discountValue) : (subtotal * (coupon.discountValue / 100))) : 0;
  const taxableAmount = subtotal - discountVal;
  const taxAmount = Math.round(taxableAmount * 0.05);
  const shippingCharges = taxableAmount > 5000 ? 0 : 100;
  const totalAmount = Math.round(taxableAmount + taxAmount + shippingCharges);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !postalCode || !country) {
      setErrorMsg('Please fill in all address fields.');
      return;
    }
    try {
      setAddressLoading(true);
      setErrorMsg('');
      const res = await addAddress({ street, city, state, postalCode, country });
      if (res.success) {
        setAddingNewAddress(false);
        setStreet('');
        setCity('');
        setState('');
        setPostalCode('');
        // Select newly added address (the last one)
        if (res.addresses) {
          setSelectedAddressIdx(res.addresses.length - 1);
        }
      }
    } catch (err) {
      setErrorMsg('Failed to add address.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user.addresses || user.addresses.length === 0) {
      setErrorMsg('Please add a delivery address to proceed.');
      return;
    }
    
    setErrorMsg('');
    setLoading(true);

    try {
      // 1. Create order on mock payment backend API
      const { data: payOrder } = await api.post('/api/payment/create-order', {
        amount: totalAmount
      });

      // Store payOrder details and open mock Razorpay modal
      setCreatedOrderDetails(payOrder);
      setShowRazorpayModal(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to initialize payment order');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!createdOrderDetails) return;
    
    setLoading(true);
    setShowRazorpayModal(false);

    try {
      // 2. Call mock verification endpoint
      const mockPayId = `pay_${Math.random().toString(36).substr(2, 9)}`;
      const mockSig = `sig_${Math.random().toString(36).substr(2, 15)}`;
      
      const { data: verifyRes } = await api.post('/api/payment/verify', {
        razorpay_order_id: createdOrderDetails.id,
        razorpay_payment_id: mockPayId,
        razorpay_signature: mockSig
      });

      if (verifyRes.success) {
        // 3. Place actual Order inside DB
        const targetAddress = user.addresses[selectedAddressIdx];
        const orderData = {
          products: cartItems.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.price * (1 - (item.product.discount || 0) / 100)
          })),
          shippingAddress: {
            street: targetAddress.street,
            city: targetAddress.city,
            state: targetAddress.state,
            postalCode: targetAddress.postalCode,
            country: targetAddress.country
          },
          couponCode: coupon?.code,
          paymentDetails: {
            razorpayOrderId: createdOrderDetails.id,
            razorpayPaymentId: mockPayId,
            razorpaySignature: mockSig
          }
        };

        const { data: finalOrder } = await api.post('/api/orders', orderData);
        
        clearCart();
        alert('Order placed successfully! Redirecting to your purchase history.');
        navigate('/order-history');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to place order after payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePaymentFailure = () => {
    setShowRazorpayModal(false);
    setErrorMsg('Payment transaction declined by user. Order placement aborted.');
  };

  return (
    <div className="bg-brand-cream min-h-screen py-12 font-sans relative">
      
      {/* MOCK RAZORPAY DIALOG OVERLAY */}
      {showRazorpayModal && createdOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
          <div className="bg-[#1A1F2C] text-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-brand-creamText/30 animate-scale-up font-sans">
            
            {/* Header */}
            <div className="bg-brand-blue px-6 py-4 flex items-center justify-between border-b border-brand-creamText/20">
              <div className="flex flex-col">
                <span className="font-serif font-bold text-base text-brand-creamText tracking-widest">RAJU SILKS & SAREES</span>
                <span className="text-[10px] text-brand-cream/70 uppercase font-sans">Razorpay Secure Checkout</span>
              </div>
              <div className="text-[10px] bg-brand-creamText/15 text-brand-creamText px-2 py-0.5 rounded border border-brand-creamText/25 font-bold">MOCK MODE</div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5">
              <div className="flex justify-between items-center text-xs pb-3 border-b border-gray-700/50">
                <span className="text-gray-400">Order ID:</span>
                <span className="font-mono text-brand-creamText font-semibold">{createdOrderDetails.id}</span>
              </div>

              <div className="text-center py-4 bg-brand-blue/20 rounded-lg border border-brand-creamText/10">
                <span className="text-[10px] text-gray-400 block mb-1 uppercase tracking-widest">Amount to Pay</span>
                <span className="text-3xl font-serif font-bold text-brand-creamText">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="text-xs text-gray-400 space-y-1.5 leading-relaxed bg-[#11151e] p-4 rounded-lg border border-gray-800">
                <p className="flex items-center gap-1.5 text-brand-creamText font-bold">
                  <CheckCircle size={14} />
                  Razorpay Sandbox Environment
                </p>
                <p>Clicking "Simulate Success" triggers mock validation and creates the database order document.</p>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  onClick={handleSimulatePaymentSuccess}
                  className="w-full bg-[#18b87e] hover:bg-[#149d6b] text-white text-xs font-bold py-3 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <CheckCircle size={14} />
                  <span>SIMULATE PAYMENT SUCCESS</span>
                </button>
                
                <button
                  onClick={handleSimulatePaymentFailure}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <AlertTriangle size={14} />
                  <span>SIMULATE PAYMENT FAILURE</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#11151e] py-3 text-center text-[9px] text-gray-500 border-t border-gray-800">
              Payments processed securely using mock keys.
            </div>

          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-brand-blue-deep tracking-wider mb-8">
          Checkout & Delivery Address
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Address Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Address Selection Card */}
            <div className="bg-white rounded-xl border border-brand-creamText/15 p-6 shadow-luxury">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-cream-dark">
                <span className="font-serif font-bold text-base text-brand-blue-deep flex items-center gap-1.5">
                  <MapPin size={18} className="text-brand-creamText" />
                  Select Delivery Address
                </span>
                {!addingNewAddress && (
                  <button
                    onClick={() => setAddingNewAddress(true)}
                    className="text-xs font-sans font-bold text-brand-blue hover:text-brand-creamText flex items-center gap-1 uppercase transition-colors"
                  >
                    <Plus size={14} />
                    Add Address
                  </button>
                )}
              </div>

              {errorMsg && <p className="text-xs font-semibold text-red-700 mb-4 bg-red-50 border border-red-200 p-2.5 rounded-lg">{errorMsg}</p>}

              {addingNewAddress ? (
                /* Address Form */
                <form onSubmit={handleCreateAddress} className="space-y-4 bg-brand-cream/30 p-4 rounded-lg border border-brand-creamText/10">
                  <h3 className="text-xs font-bold text-brand-blue-deep uppercase tracking-widest mb-2">New Shipping Address</h3>
                  
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Street Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 12 Weaver St, Silk Nagar"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full text-xs bg-white border border-brand-creamText/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-creamText text-gray-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">City</label>
                      <input
                        type="text"
                        placeholder="e.g. Kanchipuram"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full text-xs bg-white border border-brand-creamText/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-creamText text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">State</label>
                      <input
                        type="text"
                        placeholder="e.g. Tamil Nadu"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full text-xs bg-white border border-brand-creamText/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-creamText text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Postal Code (PIN)</label>
                      <input
                        type="text"
                        placeholder="e.g. 631501"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full text-xs bg-white border border-brand-creamText/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-creamText text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full text-xs bg-white border border-brand-creamText/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-creamText text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setAddingNewAddress(false)}
                      className="px-4 py-2 border border-gray-250 text-gray-500 text-xs font-semibold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addressLoading}
                      className="bg-brand-blue text-white text-xs font-bold px-5 py-2 rounded-lg border border-brand-creamText/25"
                    >
                      {addressLoading ? 'Saving...' : 'Add Address'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Address Lists selection */
                user.addresses && user.addresses.length > 0 ? (
                  <div className="space-y-3">
                    {user.addresses.map((addr, idx) => (
                      <label
                        key={addr._id}
                        className={`flex items-start space-x-3.5 p-4 border rounded-xl cursor-pointer transition-all duration-150 ${
                          selectedAddressIdx === idx
                            ? 'border-brand-creamText bg-brand-cream/35'
                            : 'border-brand-creamText/15 hover:bg-brand-cream/10'
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressIdx === idx}
                          onChange={() => setSelectedAddressIdx(idx)}
                          className="h-4 w-4 mt-1 border-brand-creamText/30 text-brand-blue focus:ring-brand-blue"
                        />
                        <div className="text-xs font-sans text-gray-600">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-brand-blue-deep">{user.name}</span>
                            <span className="text-[9px] bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded font-bold uppercase">{user.phone}</span>
                            {addr.isDefault && (
                              <span className="text-[9px] bg-brand-creamText/15 text-brand-blue-deep border border-brand-creamText/25 px-1.5 py-0.5 rounded font-bold uppercase">Default</span>
                            )}
                          </div>
                          <p>{addr.street}</p>
                          <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
                          <p>{addr.country}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-brand-creamText/20 rounded-lg">
                    <p className="text-xs text-gray-500 font-sans mb-4">No shipping addresses found in your profile.</p>
                    <button
                      onClick={() => setAddingNewAddress(true)}
                      className="bg-brand-blue text-white text-xs font-bold px-6 py-2 rounded-full border border-brand-creamText/25"
                    >
                      Create First Address
                    </button>
                  </div>
                )
              )}
            </div>

          </div>

          {/* Right Column: Order breakdown */}
          <div className="space-y-6">
            
            {/* Items summary */}
            <div className="bg-white rounded-xl border border-brand-creamText/15 p-5 shadow-luxury">
              <span className="text-xs font-bold text-brand-blue-deep uppercase tracking-widest block mb-4 border-b border-brand-cream-dark pb-2">
                Order Summary Items
              </span>
              <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2.5 max-w-[70%]">
                      <img src={item.product.images[0]} alt="" className="h-10 w-8 object-cover rounded border border-brand-creamText/10" />
                      <div className="truncate">
                        <span className="font-serif font-bold text-brand-blue-deep block truncate">{item.product.name}</span>
                        <span className="text-[10px] text-gray-400 block font-sans">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-gray-700">
                      ₹{(item.product.price * (1 - (item.product.discount || 0) / 100) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout Pricing Card */}
            <div className="bg-white rounded-xl border border-brand-creamText/15 p-6 shadow-luxury space-y-4">
              <span className="font-serif font-bold text-base text-brand-blue-deep tracking-wider block border-b border-brand-cream-dark pb-3">
                Payment Breakdown
              </span>

              <div className="space-y-2.5 text-xs font-sans text-gray-600">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-gray-800">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                
                {coupon && (
                  <div className="flex justify-between text-green-700">
                    <span>Coupon Discount</span>
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

              {/* Checkout trigger */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading || !user.addresses || user.addresses.length === 0}
                className="w-full bg-brand-blue hover:bg-brand-blue-deep text-white font-sans font-semibold tracking-wider text-xs py-3.5 rounded-full flex items-center justify-center space-x-2 shadow-md transition-all duration-200 border border-brand-creamText/20 disabled:opacity-50"
              >
                <CreditCard size={15} />
                <span>{loading ? 'INITIALIZING PAYMENT...' : 'PAY WITH RAZORPAY'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;
