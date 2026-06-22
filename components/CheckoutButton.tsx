'use client';

import React, { useState } from 'react';

interface CheckoutButtonProps {
  amount: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  disabled?: boolean;
  onBeforeCheckout: () => Promise<string | null>;
}

export default function CheckoutButton({
  amount,
  customerId,
  customerName,
  customerEmail,
  customerPhone,
  disabled,
  onBeforeCheckout
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const loadScript = (src: string) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      
      // 1. Create order in our database first using the parent callback
      const orderId = await onBeforeCheckout();
      if (!orderId) {
        setLoading(false);
        return; // Parent callback handles showing the validation/creation error
      }

      // 2. Load Cashfree Web SDK v3
      const initialized = await loadScript('https://sdk.cashfree.com/js/v3/cashfree.js');
      if (!initialized) {
        alert('Failed to load Cashfree Payment SDK. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // 3. Initialize Cashfree
      // @ts-ignore
      const cashfree = window.Cashfree({
        mode: 'sandbox', // Use 'sandbox' for testing, 'production' for live payments
      });

      // 4. Call backend API to create Cashfree order reference
      const res = await fetch('/api/payment/cashfree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount,
          customerId,
          customerName,
          customerEmail,
          customerPhone
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Payment initiation failed');
      }

      // Launch Cashfree checkout
      if (data.payment_session_id) {
        cashfree.checkout({
          paymentSessionId: data.payment_session_id,
          redirectTarget: '_self' // Recommends '_self' for dynamic return redirects
        });
      } else {
        throw new Error('No payment session ID returned from Cashfree');
      }

    } catch (err: any) {
      alert(err.message || 'Payment processing failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled || loading}
      className="w-full bg-brand-blue hover:bg-brand-blue-deep text-white font-sans font-semibold tracking-wider text-xs py-3.5 rounded-full flex items-center justify-center space-x-2 shadow-md transition-all duration-200 border border-brand-cream-text/20 disabled:opacity-50"
    >
      <span>{loading ? 'REDIRECTING TO CASHFREE SECURE PAY...' : 'PAY WITH CASHFREE'}</span>
    </button>
  );
}
