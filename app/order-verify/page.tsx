'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/components/providers/CartProvider';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

function OrderVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const orderId = searchParams.get('order_id');

  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('Verifying your payment...');
  const [details, setDetails] = useState<any>(null);
  const verifyCalled = useRef(false);

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      setMessage('No Order ID found in the redirect URL.');
      return;
    }

    if (verifyCalled.current) return;
    verifyCalled.current = true;

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();

        if (res.ok && data) {
          setStatus('success');
          setMessage('Order placed successfully.');
          setDetails(data);
          // Clear cart immediately upon successful order placement
          clearCart();
        } else {
          setStatus('failed');
          setMessage(data?.message || 'We could not find your order details.');
          setDetails(data);
        }
      } catch (err: any) {
        console.error('Error verifying order:', err);
        setStatus('failed');
        setMessage('An error occurred while verifying your order.');
      }
    };

    verifyPayment();
  }, [orderId, clearCart]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Loader2 className="h-16 w-16 text-brand-gold animate-spin mb-6" />
        <h2 className="font-serif font-bold text-2xl text-brand-blue-deep mb-2 tracking-wide">
          Confirming Your Order
        </h2>
        <p className="text-sm text-gray-500 font-sans max-w-sm">
          Please do not refresh the page or click back. We are confirming your order details.
        </p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-md mx-auto">
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full mb-6 border border-emerald-100 shadow-sm animate-bounce-short">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-brand-blue-deep mb-2 tracking-wide">
          Order Placed Successfully!
        </h2>
        <p className="text-xs font-sans text-emerald-700 bg-emerald-50/50 border border-emerald-100 px-3.5 py-1.5 rounded-full mb-6 inline-block font-semibold">
          Order Registered
        </p>
        <div className="w-full bg-white rounded-xl border border-brand-cream-text/15 p-5 text-left mb-8 shadow-lg space-y-3 font-sans text-xs">
          <div className="flex justify-between pb-2 border-b border-brand-cream-dark">
            <span className="text-gray-400">Order ID:</span>
            <span className="font-mono font-bold text-brand-blue-deep">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Payment Status:</span>
            <span className="font-bold text-amber-600 uppercase">{details?.paymentStatus || 'Pending'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Order Status:</span>
            <span className="font-bold text-emerald-600 uppercase">{details?.orderStatus || 'Placed'}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link
            href="/orders"
            className="flex-1 bg-brand-blue hover:bg-brand-blue-deep text-white font-sans font-bold text-xs py-3.5 px-6 rounded-full flex items-center justify-center space-x-2 shadow-md transition-all duration-200 border border-brand-cream-text/20 uppercase tracking-wider"
          >
            <span>View My Orders</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/"
            className="flex-1 bg-white hover:bg-brand-cream-dark text-brand-blue-deep font-sans font-bold text-xs py-3.5 px-6 rounded-full flex items-center justify-center space-x-2 shadow-sm border border-brand-cream-text/30 transition-all duration-200 uppercase tracking-wider"
          >
            <ShoppingBag size={14} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center max-w-md mx-auto">
      <div className="bg-red-50 text-red-600 p-4 rounded-full mb-6 border border-red-100 shadow-sm">
        <XCircle className="h-16 w-16" />
      </div>
      <h2 className="font-serif font-bold text-2xl text-brand-blue-deep mb-2 tracking-wide">
        Payment Failed or Cancelled
      </h2>
      <p className="text-sm text-gray-500 font-sans mb-6 max-w-sm">
        {message || 'The payment transaction could not be processed. Please try again.'}
      </p>
      
      {orderId && (
        <div className="w-full bg-white rounded-xl border border-brand-cream-text/15 p-5 text-left mb-8 shadow-lg space-y-3 font-sans text-xs">
          <div className="flex justify-between pb-2 border-b border-brand-cream-dark">
            <span className="text-gray-400">Order ID:</span>
            <span className="font-mono font-bold text-brand-blue-deep">{orderId}</span>
          </div>
          {details?.status && (
            <div className="flex justify-between">
              <span className="text-gray-400">Gateway Status:</span>
              <span className="font-bold text-red-600 uppercase">{details.status}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Link
          href="/checkout"
          className="flex-1 bg-brand-blue hover:bg-brand-blue-deep text-white font-sans font-bold text-xs py-3.5 px-6 rounded-full flex items-center justify-center space-x-2 shadow-md transition-all duration-200 border border-brand-cream-text/20 uppercase tracking-wider"
        >
          <span>Retry Checkout</span>
          <ArrowRight size={14} />
        </Link>
        <Link
          href="/cart"
          className="flex-1 bg-white hover:bg-brand-cream-dark text-brand-blue-deep font-sans font-bold text-xs py-3.5 px-6 rounded-full flex items-center justify-center space-x-2 shadow-sm border border-brand-cream-text/30 transition-all duration-200 uppercase tracking-wider"
        >
          <ShoppingBag size={14} />
          <span>Back to Cart</span>
        </Link>
      </div>
    </div>
  );
}

export default function OrderVerifyPage() {
  return (
    <div className="bg-brand-cream min-h-screen py-16 flex items-center justify-center font-sans">
      <div className="max-w-xl w-full mx-auto px-4">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="h-16 w-16 text-brand-gold animate-spin mb-6" />
              <h2 className="font-serif font-bold text-2xl text-brand-blue-deep mb-2">Loading</h2>
            </div>
          }
        >
          <OrderVerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
