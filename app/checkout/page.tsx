'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/components/providers/CartProvider';
import { MapPin, Plus, CheckCircle } from 'lucide-react';
import CheckoutButton from '@/components/CheckoutButton';

interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { cartItems, getCartTotal, coupon, clearCart } = useCart();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [userPhone, setUserPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [addingNewAddress, setAddingNewAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  


  // Address Form state
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [addressLoading, setAddressLoading] = useState(false);

  // Redirect if cart is empty or user is unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/checkout');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && cartItems.length === 0) {
      router.push('/cart');
    }
  }, [cartItems, status, router]);

  // Load User details and addresses on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status !== 'authenticated') return;
      try {
        setPageLoading(true);
        const res = await fetch('/api/users/profile');
        if (res.ok) {
          const profile = await res.json();
          setAddresses(profile.addresses || []);
          setUserPhone(profile.phone || '');
          setUserName(profile.name || '');

          const defaultIdx = (profile.addresses || []).findIndex((addr: Address) => addr.isDefault);
          if (defaultIdx !== -1) {
            setSelectedAddressIdx(defaultIdx);
          } else if ((profile.addresses || []).length > 0) {
            setSelectedAddressIdx(0);
          }
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
      } finally {
        setPageLoading(false);
      }
    };
    fetchUserProfile();
  }, [status]);

  const subtotal = getCartTotal();
  const discountVal = coupon ? (coupon.discountType === 'flat' ? Math.min(subtotal, coupon.discountValue) : (subtotal * (coupon.discountValue / 100))) : 0;
  const taxableAmount = subtotal - discountVal;
  const taxAmount = Math.round(taxableAmount * 0.05);
  const shippingCharges = taxableAmount > 5000 ? 0 : 100;
  const totalAmount = Math.round(taxableAmount + taxAmount + shippingCharges);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !state || !postalCode || !country) {
      setErrorMsg('Please fill in all address fields.');
      return;
    }
    try {
      setAddressLoading(true);
      setErrorMsg('');
      const res = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ street, city, state, postalCode, country })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to add address');
      }

      setAddresses(data || []);
      setAddingNewAddress(false);
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
      
      // Select newly added address (the last one)
      if (data && data.length > 0) {
        setSelectedAddressIdx(data.length - 1);
      }
    } catch (err) {
      setErrorMsg('Failed to add address.');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleBeforeCheckout = async (): Promise<string | null> => {
    if (!addresses || addresses.length === 0) {
      setErrorMsg('Please add a delivery address to proceed.');
      return null;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const targetAddress = addresses[selectedAddressIdx];
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
        couponCode: coupon?.code
      };

      const placeOrderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const placeOrderData = await placeOrderRes.json();
      if (!placeOrderRes.ok) {
        throw new Error(placeOrderData.message || 'Failed to place order');
      }

      return placeOrderData._id;
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order.');
      setLoading(false);
      return null;
    }
  };

  if (pageLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen py-12 font-sans relative">
      


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-brand-blue-deep tracking-wider mb-8">
          Checkout & Delivery Address
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Address Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Address Selection Card */}
            <div className="bg-white rounded-xl border border-brand-cream-text/15 p-6 shadow-luxury">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-brand-cream-dark">
                <span className="font-serif font-bold text-base text-brand-blue-deep flex items-center gap-1.5">
                  <MapPin size={18} className="text-brand-cream-text" />
                  Select Delivery Address
                </span>
                {!addingNewAddress && (
                  <button
                    onClick={() => setAddingNewAddress(true)}
                    className="text-xs font-sans font-bold text-brand-blue hover:text-brand-cream-text flex items-center gap-1 uppercase transition-colors"
                  >
                    <Plus size={14} />
                    Add Address
                  </button>
                )}
              </div>

              {errorMsg && <p className="text-xs font-semibold text-red-700 mb-4 bg-red-50 border border-red-200 p-2.5 rounded-lg">{errorMsg}</p>}

              {addingNewAddress ? (
                /* Address Form */
                <form onSubmit={handleCreateAddress} className="space-y-4 bg-brand-cream/30 p-4 rounded-lg border border-brand-cream-text/10">
                  <h3 className="text-xs font-bold text-brand-blue-deep uppercase tracking-widest mb-2">New Shipping Address</h3>
                  
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Street Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 12 Weaver St, Silk Nagar"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full text-xs bg-white border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">City</label>
                      <input
                        type="text"
                        placeholder="e.g. Kanchipuram"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full text-xs bg-white border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">State</label>
                      <input
                        type="text"
                        placeholder="e.g. Tamil Nadu"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full text-xs bg-white border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Postal Code (PIN)</label>
                      <input
                        type="text"
                        placeholder="e.g. 631501"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full text-xs bg-white border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full text-xs bg-white border border-brand-cream-text/15 rounded-lg p-2.5 focus:outline-none focus:border-brand-cream-text text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setAddingNewAddress(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-500 text-xs font-semibold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addressLoading}
                      className="bg-brand-blue text-white text-xs font-bold px-5 py-2 rounded-lg border border-brand-cream-text/25"
                    >
                      {addressLoading ? 'Saving...' : 'Add Address'}
                    </button>
                  </div>
                </form>
              ) : (
                /* Address Lists selection */
                addresses && addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((addr, idx) => (
                      <label
                        key={addr._id}
                        className={`flex items-start space-x-3.5 p-4 border rounded-xl cursor-pointer transition-all duration-150 ${
                          selectedAddressIdx === idx
                            ? 'border-brand-cream-text bg-brand-cream/35'
                            : 'border-brand-cream-text/15 hover:bg-brand-cream/10'
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressIdx === idx}
                          onChange={() => setSelectedAddressIdx(idx)}
                          className="h-4 w-4 mt-1 border-brand-cream-text/30 text-brand-blue focus:ring-brand-blue"
                        />
                        <div className="text-xs font-sans text-gray-600">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-brand-blue-deep">{userName}</span>
                            {userPhone && <span className="text-[9px] bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded font-bold uppercase">{userPhone}</span>}
                            {addr.isDefault && (
                              <span className="text-[9px] bg-brand-cream-text/15 text-brand-blue-deep border border-brand-cream-text/25 px-1.5 py-0.5 rounded font-bold uppercase">Default</span>
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
                  <div className="text-center py-8 border border-dashed border-brand-cream-text/20 rounded-lg">
                    <p className="text-xs text-gray-500 font-sans mb-4">No shipping addresses found in your profile.</p>
                    <button
                      onClick={() => setAddingNewAddress(true)}
                      className="bg-brand-blue text-white text-xs font-bold px-6 py-2 rounded-full border border-brand-cream-text/25"
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
            <div className="bg-white rounded-xl border border-brand-cream-text/15 p-5 shadow-luxury">
              <span className="text-xs font-bold text-brand-blue-deep uppercase tracking-widest block mb-4 border-b border-brand-cream-dark pb-2">
                Order Summary Items
              </span>
              <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-2.5 max-w-[70%]">
                      <img src={item.product.images?.[0] || '/placeholder.png'} alt="" className="h-10 w-8 object-cover rounded border border-brand-cream-text/10" />
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
            <div className="bg-white rounded-xl border border-brand-cream-text/15 p-6 shadow-luxury space-y-4">
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
              <CheckoutButton
                amount={totalAmount}
                customerId={(session?.user as any)?.id || 'guest_user'}
                customerName={userName || session?.user?.name || 'Guest User'}
                customerEmail={session?.user?.email || 'guest@example.com'}
                customerPhone={userPhone || '9999999999'}
                disabled={loading || !addresses || addresses.length === 0}
                onBeforeCheckout={handleBeforeCheckout}
              />
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
