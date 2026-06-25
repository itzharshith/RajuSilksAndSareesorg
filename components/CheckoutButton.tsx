'use client';
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  amount: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  disabled?: boolean;
  onBeforeCheckout: () => Promise<string | null>;
}

// Dynamically load the Cashfree JS SDK once
function loadCashfreeSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Cashfree) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
    document.head.appendChild(script);
  });
}

export default function CheckoutButton({
  amount,
  customerId,
  customerName,
  customerEmail,
  customerPhone,
  disabled,
  onBeforeCheckout,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [error, setError] = useState('');

  // Pre-load the Cashfree SDK as soon as this component mounts
  useEffect(() => {
    loadCashfreeSDK()
      .then(() => setSdkLoaded(true))
      .catch((err) => console.error('[Cashfree SDK]', err.message));
  }, []);

  const handleCheckout = async () => {
    setError('');
    setLoading(true);

    try {
      // Step 1: Create the order in our database
      const orderId = await onBeforeCheckout();
      if (!orderId) {
        setLoading(false);
        return; // Parent already shows the error
      }

      // Step 2: Create Cashfree payment session on the server
      const sessionRes = await fetch('/api/payment/cashfree/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount,
          customerName,
          customerEmail,
          customerPhone,
        }),
      });

      const sessionData = await sessionRes.json();
      if (!sessionRes.ok) {
        throw new Error(sessionData.message || 'Could not initiate payment session.');
      }

      const { payment_session_id } = sessionData;
      if (!payment_session_id) {
        throw new Error('No payment session ID received from server.');
      }

      // Step 3: Ensure SDK is loaded, then launch Cashfree hosted checkout
      if (!(window as any).Cashfree) {
        await loadCashfreeSDK();
      }

      const mode = (process.env.NEXT_PUBLIC_CASHFREE_MODE as 'sandbox' | 'production') || 'sandbox';
      const cashfree = (window as any).Cashfree({ mode });

      // Redirect the customer to Cashfree's payment page
      // After payment, Cashfree returns them to our return_url set in create-session
      await cashfree.checkout({
        paymentSessionId: payment_session_id,
        redirectTarget: '_self',
      });

      // Note: code below won't run because the page redirects
    } catch (err: any) {
      console.error('[Checkout]', err.message);
      setError(err.message || 'Payment initiation failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-lg text-center">
          {error}
        </p>
      )}

      <button
        id="cashfree-checkout-btn"
        onClick={handleCheckout}
        disabled={disabled || loading}
        className="w-full bg-brand-blue hover:bg-brand-blue-deep text-white font-sans font-semibold tracking-wider text-xs py-3.5 rounded-full flex items-center justify-center gap-2 shadow-md transition-all duration-200 border border-brand-cream-text/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>PROCESSING ORDER...</span>
          </>
        ) : (
          <>
            <ShieldCheck size={14} />
            <span>PROCEED TO PAY</span>
          </>
        )}
      </button>

      <p className="text-center text-[10px] text-gray-400 font-sans">
        🔒 Secured by{' '}
        <span className="font-semibold text-gray-500">Cashfree Payments</span>
      </p>
    </div>
  );
}
