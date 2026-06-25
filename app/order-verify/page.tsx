'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/components/providers/CartProvider';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShoppingBag, Clock } from 'lucide-react';
import Link from 'next/link';

function OrderVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const orderId = searchParams.get('order_id');

  const [status, setStatus] = useState<'loading' | 'success' | 'pending' | 'failed'>('loading');
  const [message, setMessage] = useState('Verifying your payment with Cashfree...');
  const [details, setDetails] = useState<any>(null);
  const verifyCalled = useRef(false);

  useEffect(() => {
    if (!orderId) {
      setStatus('failed');
      setMessage('No Order ID found. Please contact support.');
      return;
    }

    if (verifyCalled.current) return;
    verifyCalled.current = true;

    const verifyPayment = async () => {
      try {
        // Call our server-side Cashfree verify route
        // The server checks Cashfree's API and updates our DB
        const res = await fetch(`/api/payment/cashfree/verify?order_id=${orderId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Payment verification failed.');
        }

        setDetails(data);

        if (data.success || data.paymentStatus === 'Paid') {
          setStatus('success');
          setMessage('Your payment was successful!');
          clearCart();
        } else if (data.cfOrderStatus === 'ACTIVE') {
          // Payment still in progress (rare on return)
          setStatus('pending');
          setMessage('Your payment is still being processed. Please wait or check your orders.');
        } else {
          setStatus('failed');
          setMessage('Payment was not completed. Your cart items are safe — please try again.');
        }
      } catch (err: any) {
        console.error('[OrderVerify]', err.message);
        setStatus('failed');
        setMessage(err.message || 'An error occurred while verifying your payment.');
      }
    };

    verifyPayment();
  }, [orderId, clearCart]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="relative mb-8">
          <Loader2 className="h-16 w-16 text-brand-blue animate-spin" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-brand-blue-deep mb-3 tracking-wide">
          Confirming Your Payment
        </h2>
        <p className="text-sm text-gray-500 font-sans max-w-sm">
          Please do not refresh or close this page. We are verifying your payment with Cashfree.
        </p>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center max-w-md mx-auto">
        <div className="bg-emerald-50 text-emerald-600 p-5 rounded-full mb-6 border border-emerald-100 shadow-sm">
          <CheckCircle2 className="h-14 w-14" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-brand-blue-deep mb-2 tracking-wide">
          Payment Successful!
        </h2>
        <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full mb-6 inline-block">
          ✓ Order Confirmed &amp; Payment Received
        </p>

        <div className="w-full bg-white rounded-xl border border-brand-cream-text/15 p-5 text-left mb-8 shadow-lg space-y-3 font-sans text-xs">
          <div className="flex justify-between pb-2 border-b border-brand-cream-dark">
            <span className="text-gray-400">Order ID</span>
            <span className="font-mono font-bold text-brand-blue-deep text-[11px]">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Payment Status</span>
            <span className="font-bold text-emerald-600 uppercase">
              {details?.paymentStatus || 'Paid'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Order Status</span>
            <span className="font-bold text-brand-blue uppercase">
              {details?.orderStatus || 'Processing'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/orders"
            className="flex-1 bg-brand-blue hover:bg-brand-blue-deep text-white font-sans font-bold text-xs py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-md transition-all duration-200 border border-brand-cream-text/20 uppercase tracking-wider"
          >
            <span>View My Orders</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/"
            className="flex-1 bg-white hover:bg-brand-cream-dark text-brand-blue-deep font-sans font-bold text-xs py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-sm border border-brand-cream-text/30 transition-all duration-200 uppercase tracking-wider"
          >
            <ShoppingBag size={14} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  // ── Pending state ──────────────────────────────────────────────────────────
  if (status === 'pending') {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center max-w-md mx-auto">
        <div className="bg-amber-50 text-amber-500 p-5 rounded-full mb-6 border border-amber-100 shadow-sm">
          <Clock className="h-14 w-14" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-brand-blue-deep mb-2 tracking-wide">
          Payment Pending
        </h2>
        <p className="text-sm text-gray-500 font-sans mb-6 max-w-sm">
          {message}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/orders"
            className="flex-1 bg-brand-blue hover:bg-brand-blue-deep text-white font-sans font-bold text-xs py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-md transition-all duration-200 border border-brand-cream-text/20 uppercase tracking-wider"
          >
            <span>Check My Orders</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  // ── Failed state ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center max-w-md mx-auto">
      <div className="bg-red-50 text-red-500 p-5 rounded-full mb-6 border border-red-100 shadow-sm">
        <XCircle className="h-14 w-14" />
      </div>
      <h2 className="font-serif font-bold text-2xl text-brand-blue-deep mb-2 tracking-wide">
        Payment Failed
      </h2>
      <p className="text-sm text-gray-500 font-sans mb-6 max-w-sm">
        {message}
      </p>

      {orderId && (
        <div className="w-full bg-white rounded-xl border border-brand-cream-text/15 p-5 text-left mb-8 shadow-lg space-y-3 font-sans text-xs">
          <div className="flex justify-between pb-2 border-b border-brand-cream-dark">
            <span className="text-gray-400">Order Reference</span>
            <span className="font-mono font-bold text-brand-blue-deep text-[11px]">{orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status</span>
            <span className="font-bold text-red-500 uppercase">
              {details?.cfOrderStatus || 'Not Paid'}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link
          href="/checkout"
          className="flex-1 bg-brand-blue hover:bg-brand-blue-deep text-white font-sans font-bold text-xs py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-md transition-all duration-200 border border-brand-cream-text/20 uppercase tracking-wider"
        >
          <span>Try Again</span>
          <ArrowRight size={14} />
        </Link>
        <Link
          href="/cart"
          className="flex-1 bg-white hover:bg-brand-cream-dark text-brand-blue-deep font-sans font-bold text-xs py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-sm border border-brand-cream-text/30 transition-all duration-200 uppercase tracking-wider"
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
              <Loader2 className="h-16 w-16 text-brand-blue animate-spin mb-6" />
              <h2 className="font-serif font-bold text-2xl text-brand-blue-deep mb-2">
                Loading...
              </h2>
            </div>
          }
        >
          <OrderVerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
