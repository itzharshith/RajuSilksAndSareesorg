'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  IndianRupee,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

// Load Cashfree JS SDK dynamically
function loadCashfreeSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Cashfree) { resolve(); return; }
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
    document.head.appendChild(script);
  });
}

// ─── Result Panel (shown after Cashfree redirects back) ───────────────────────
function ResultPanel({ testOrderId }: { testOrderId: string }) {
  const [status, setStatus] = useState<'checking' | 'paid' | 'failed' | 'pending'>('checking');
  const [details, setDetails] = useState<any>(null);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    fetch(`/api/payment/cashfree/test-verify?test_order_id=${testOrderId}`)
      .then((r) => r.json())
      .then((data) => {
        setDetails(data);
        if (data.order_status === 'PAID') setStatus('paid');
        else if (data.order_status === 'ACTIVE') setStatus('pending');
        else setStatus('failed');
      })
      .catch(() => setStatus('failed'));
  }, [testOrderId]);

  if (status === 'checking') {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Loader2 className="h-12 w-12 text-brand-blue animate-spin" />
        <p className="text-sm text-gray-500 font-sans">Verifying payment with Cashfree...</p>
      </div>
    );
  }

  if (status === 'paid') {
    return (
      <div className="flex flex-col items-center gap-5 py-8 text-center">
        <div className="bg-emerald-50 p-5 rounded-full border border-emerald-100">
          <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        </div>
        <div>
          <h2 className="font-serif font-bold text-2xl text-brand-blue-deep mb-1">
            Payment Successful! 🎉
          </h2>
          <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 px-4 py-1 rounded-full inline-block">
            ₹1.00 received via Cashfree Production
          </p>
        </div>
        <div className="w-full bg-gray-50 rounded-xl border border-gray-100 p-4 text-left space-y-2 text-xs font-sans">
          <div className="flex justify-between">
            <span className="text-gray-400">Cashfree Order ID</span>
            <span className="font-mono font-bold text-gray-700 text-[11px]">{details?.order_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Amount</span>
            <span className="font-bold text-gray-700">₹{details?.order_amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status</span>
            <span className="font-bold text-emerald-600 uppercase">{details?.order_status}</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 font-sans">
          ✅ The Cashfree <strong>production</strong> gateway is fully working!
        </p>
        <Link
          href="/test-payment"
          className="text-xs font-bold text-brand-blue underline underline-offset-2"
        >
          Run another test
        </Link>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="bg-amber-50 p-4 rounded-full border border-amber-100">
          <Loader2 className="h-10 w-10 text-amber-400" />
        </div>
        <h2 className="font-serif font-bold text-xl text-brand-blue-deep">Payment Pending</h2>
        <p className="text-xs text-gray-500">The payment is still being processed by the bank.</p>
        <Link href="/test-payment" className="text-xs font-bold text-brand-blue underline">
          Try again
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <div className="bg-red-50 p-4 rounded-full border border-red-100">
        <XCircle className="h-12 w-12 text-red-400" />
      </div>
      <h2 className="font-serif font-bold text-xl text-brand-blue-deep">Payment Not Completed</h2>
      <p className="text-xs text-gray-500 max-w-xs">
        The payment was cancelled or failed. Status from Cashfree:{' '}
        <strong>{details?.order_status || 'UNKNOWN'}</strong>
      </p>
      <Link href="/test-payment" className="text-xs font-bold text-brand-blue underline">
        Try again
      </Link>
    </div>
  );
}

// ─── Pay Button Panel ─────────────────────────────────────────────────────────
// ─── Manual Verification Component ───────────────────────────────────────────
interface ManualVerificationProps {
  onVerify: (orderId: string) => void;
}

function ManualVerificationSection({ onVerify }: ManualVerificationProps) {
  const [lastOrderId, setLastOrderId] = useState<string>('');
  const [customOrderId, setCustomOrderId] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('last_test_order_id');
      if (saved) setLastOrderId(saved);
    }
  }, []);

  return (
    <div className="w-full border-t border-gray-100 pt-6 mt-4 space-y-4">
      <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-gray-400">
        Verify Past Payment
      </h3>
      
      {lastOrderId && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col gap-2">
          <p className="text-[11px] text-gray-500 font-sans">
            Last initiated order: <strong className="font-mono text-gray-700">{lastOrderId}</strong>
          </p>
          <button
            onClick={() => onVerify(lastOrderId)}
            className="w-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-sans font-semibold text-xs py-2 rounded-xl transition-all duration-200 cursor-pointer"
          >
            Check Status of Last Payment
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Or enter any Order ID"
          value={customOrderId}
          onChange={(e) => setCustomOrderId(e.target.value)}
          className="flex-1 bg-gray-50 border border-gray-200 text-xs font-sans px-3 py-2 rounded-xl focus:outline-none focus:border-brand-blue"
        />
        <button
          onClick={() => customOrderId && onVerify(customOrderId)}
          disabled={!customOrderId}
          className="bg-brand-blue hover:bg-brand-blue-deep disabled:opacity-50 text-white font-sans font-semibold text-xs px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer"
        >
          Verify
        </button>
      </div>
    </div>
  );
}

// ─── Pay Button Panel ─────────────────────────────────────────────────────────
function PayPanel({ onVerify }: { onVerify: (orderId: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    setError('');
    setLoading(true);
    try {
      // 1. Create test session on server
      const res = await fetch('/api/payment/cashfree/test-session', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create payment session');

      const { payment_session_id, test_order_id } = data;
      if (!payment_session_id) throw new Error('No payment_session_id returned');

      // Save order ID to localStorage for manual status check since return_url is example.com
      if (typeof window !== 'undefined') {
        localStorage.setItem('last_test_order_id', test_order_id);
      }

      // 2. Load SDK
      await loadCashfreeSDK();

      // 3. Launch Cashfree hosted checkout
      const mode = (process.env.NEXT_PUBLIC_CASHFREE_MODE as 'production' | 'sandbox') || 'production';
      const cashfree = (window as any).Cashfree({ mode });
      await cashfree.checkout({ paymentSessionId: payment_session_id, redirectTarget: '_self' });
    } catch (err: any) {
      console.error('[TestPayment]', err.message);
      setError(err.message || 'Something went wrong. Check console.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Amount card */}
      <div className="relative w-full bg-gradient-to-br from-brand-blue to-brand-blue-deep rounded-2xl p-6 text-white text-center overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8" />
        <p className="text-xs font-sans font-semibold uppercase tracking-widest text-white/60 mb-2">
          Test Payment
        </p>
        <div className="flex items-center justify-center gap-1 mb-1">
          <IndianRupee className="h-8 w-8" />
          <span className="font-serif font-bold text-6xl">1</span>
        </div>
        <p className="text-xs text-white/60 font-sans">Indian Rupee · Production Gateway</p>
      </div>

      {/* Info */}
      <div className="w-full space-y-2 text-xs font-sans text-gray-500">
        {[
          ['Gateway', 'Cashfree Payments (Production)'],
          ['Environment', process.env.NEXT_PUBLIC_CASHFREE_MODE === 'production' ? '🟢 Production' : '🟡 Sandbox'],
          ['Refund', 'You can refund ₹1 from Cashfree dashboard if needed'],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-400">{label}</span>
            <span className="font-semibold text-gray-600">{value}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="w-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3 rounded-xl">
          ⚠️ {error}
        </div>
      )}

      <button
        id="test-pay-btn"
        onClick={handlePay}
        disabled={loading}
        className="w-full bg-brand-blue hover:bg-brand-blue-deep disabled:opacity-50 text-white font-sans font-bold tracking-wider text-sm py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-lg transition-all duration-200 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Connecting to Cashfree...</span>
          </>
        ) : (
          <>
            <Zap size={16} />
            <span>PAY ₹1 NOW</span>
            <ArrowRight size={16} />
          </>
        )}
      </button>

      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-sans">
        <ShieldCheck size={12} className="text-gray-400" />
        <span>Secured by Cashfree · SSL Encrypted · PCI DSS Compliant</span>
      </div>

      {/* Manual verification section */}
      <ManualVerificationSection onVerify={onVerify} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function TestPaymentContent() {
  const searchParams = useSearchParams();
  const testOrderIdFromUrl = searchParams.get('test_order_id');
  const [verifyOrderId, setVerifyOrderId] = useState<string | null>(null);

  const activeOrderId = testOrderIdFromUrl || verifyOrderId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cream via-white to-brand-cream flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-blue/60 bg-brand-blue/5 border border-brand-blue/10 px-3 py-1 rounded-full mb-4">
            <Zap size={10} />
            Gateway Test
          </span>
          <h1 className="font-serif font-bold text-2xl text-brand-blue-deep tracking-wide">
            Payment Gateway Test
          </h1>
          <p className="text-xs text-gray-400 font-sans mt-1">
            Raju Silks &amp; Sarees · Cashfree Integration
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6">
          {activeOrderId ? (
            <ResultPanel testOrderId={activeOrderId} />
          ) : (
            <PayPanel onVerify={setVerifyOrderId} />
          )}
        </div>

        <p className="text-center text-[10px] text-gray-300 font-sans mt-6">
          This page is for gateway testing only · Not visible to customers
        </p>
      </div>
    </div>
  );
}

export default function TestPaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-brand-blue animate-spin" />
        </div>
      }
    >
      <TestPaymentContent />
    </Suspense>
  );
}
