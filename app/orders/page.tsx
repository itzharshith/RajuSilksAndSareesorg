'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ClipboardList, Calendar, DollarSign, Eye, X } from 'lucide-react';

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images?: string[];
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  createdAt: string;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  shippingCharges: number;
  paymentStatus: string;
  orderStatus: string;
  couponApplied?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  products: OrderItem[];
  user?: {
    name: string;
  };
}

export default function OrderHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/orders');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (status !== 'authenticated') return;
      try {
        setLoading(true);
        const res = await fetch('/api/orders?myorders=true');
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [status]);

  const getStatusColor = (statusText: string) => {
    switch (statusText) {
      case 'Pending': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'Processing': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Shipped': return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'Delivered': return 'text-green-700 bg-green-50 border-green-200';
      case 'Cancelled': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-250';
    }
  };

  const getTrackingPercent = (statusText: string) => {
    switch (statusText) {
      case 'Pending': return 'w-[15%]';
      case 'Processing': return 'w-[45%]';
      case 'Shipped': return 'w-[75%]';
      case 'Delivered': return 'w-[100%]';
      default: return 'w-0';
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream min-h-screen py-12 font-sans relative">
      
      {/* ORDER ITEMS DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl border border-brand-cream-text/20 animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-brand-blue px-6 py-4 flex items-center justify-between border-b border-brand-cream-text/25 text-white">
              <div className="flex flex-col">
                <span className="font-serif font-bold text-sm text-brand-cream-text">Order Details</span>
                <span className="text-[10px] text-brand-cream/80 font-mono">ID: {selectedOrder._id}</span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="text-brand-cream-text hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              
              {/* Visual Tracker */}
              {selectedOrder.orderStatus !== 'Cancelled' ? (
                <div>
                  <div className="flex justify-between text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2 gap-1">
                    <span>Order Placed</span>
                    <span>Processing</span>
                    <span>Shipped</span>
                    <span>Delivered</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className={`bg-gradient-to-r from-brand-blue to-brand-cream-text h-full ${getTrackingPercent(selectedOrder.orderStatus)}`} />
                  </div>
                  <span className="text-[10px] font-semibold text-brand-blue block mt-2 text-center uppercase tracking-wider">
                    Current Status: {selectedOrder.orderStatus}
                  </span>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-lg text-center uppercase tracking-wider">
                  This order has been cancelled.
                </div>
              )}

              {/* Shipping address details */}
              <div className="border border-brand-cream-text/15 p-4 rounded-lg bg-brand-cream/20 text-xs text-gray-600">
                <span className="font-serif font-bold text-brand-blue-deep block mb-2">Delivery Address</span>
                <p className="font-semibold text-gray-800">{selectedOrder.user?.name || session?.user?.name}</p>
                <p>{selectedOrder.shippingAddress.street}</p>
                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}</p>
                <p>{selectedOrder.shippingAddress.country}</p>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <span className="font-serif font-bold text-sm text-brand-blue-deep block">Items Purchased</span>
                <div className="divide-y divide-gray-100">
                  {selectedOrder.products.map((item) => (
                    <div key={item._id} className="py-3 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={item.product?.images?.[0] || '/placeholder.png'} 
                          alt="" 
                          className="h-12 w-10 object-cover rounded border border-brand-cream-text/10" 
                        />
                        <div>
                          <span className="font-serif font-bold text-brand-blue-deep block">{item.product?.name || 'Silk Saree'}</span>
                          <span className="text-[10px] text-gray-400 font-sans">Quantity: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-serif font-bold text-gray-700">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing details */}
              <div className="border-t border-brand-cream-dark pt-4 text-xs font-sans text-gray-600 space-y-2">
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Coupon Discount {selectedOrder.couponApplied && `(${selectedOrder.couponApplied})`}</span>
                    <span>-₹{selectedOrder.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Tax (5% GST)</span>
                  <span>₹{selectedOrder.taxAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Charges</span>
                  <span>{selectedOrder.shippingCharges > 0 ? `₹${selectedOrder.shippingCharges}` : 'FREE'}</span>
                </div>
                <div className="flex justify-between text-brand-blue-deep font-bold text-sm border-t border-brand-cream-dark pt-2.5">
                  <span>Total Amount Paid</span>
                  <span className="font-serif text-base">₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-brand-cream/30 px-6 py-3 text-right border-t border-brand-cream-dark">
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="bg-brand-blue hover:bg-brand-blue-deep text-white text-xs font-semibold px-5 py-2 rounded-lg border border-brand-cream-text/20"
              >
                Close details
              </button>
            </div>

          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-brand-blue-deep tracking-wider mb-8">
          Order History
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white border border-brand-cream-text/15 rounded-xl p-16 text-center shadow-luxury max-w-md mx-auto">
            <div className="h-16 w-16 bg-brand-cream text-brand-blue mx-auto rounded-full flex items-center justify-center mb-4 border border-brand-cream-text/15">
              <ClipboardList size={28} />
            </div>
            <p className="font-serif italic text-brand-blue-deep text-lg mb-2">No purchase records found.</p>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">You haven't placed any orders yet. Visit our shop catalog to place your first weave purchase.</p>
            <Link
              href="/shop"
              className="inline-block bg-brand-blue hover:bg-brand-blue-deep text-white text-xs font-semibold px-6 py-2.5 rounded-full border border-brand-cream-text/20"
            >
              Shop Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="bg-white rounded-xl border border-brand-cream-text/15 p-5 shadow-luxury hover:border-brand-cream-text/30 transition-all duration-200 grid grid-cols-1 md:grid-cols-5 gap-4 items-center"
              >
                
                {/* Details column */}
                <div className="md:col-span-2 space-y-1">
                  <span className="text-[10px] text-gray-400 font-mono block">ORDER ID: {order._id}</span>
                  <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                    <Calendar size={13} className="text-brand-cream-text" />
                    <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                    <DollarSign size={13} className="text-brand-cream-text" />
                    <span className="font-semibold text-gray-800">Total: ₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Payment Status */}
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Payment</span>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 border rounded uppercase tracking-wider ${
                    order.paymentStatus === 'Paid' 
                      ? 'text-green-700 bg-green-50 border-green-200' 
                      : 'text-yellow-700 bg-yellow-50 border-yellow-200'
                  }`}>
                    {order.paymentStatus}
                  </span>
                </div>

                {/* Order Status */}
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Shipping Status</span>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 border rounded uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>

                {/* View CTA */}
                <div className="text-right">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="w-full md:w-auto bg-brand-cream hover:bg-brand-cream-text/15 text-brand-blue-deep text-xs font-bold py-2 px-4 rounded-lg border border-brand-cream-text/20 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye size={13} />
                    <span>View Details</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
