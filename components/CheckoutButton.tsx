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

  const handleCheckout = async () => {
    try {
      setLoading(true);
      
      // 1. Create order in our database first using the parent callback
      const orderId = await onBeforeCheckout();
      if (!orderId) {
        setLoading(false);
        return; // Parent callback handles showing the validation/creation error
      }

      // 2. Redirect to local order verification page
      window.location.href = `/order-verify?order_id=${orderId}`;

    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(err.message || 'Order processing failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleCheckout}
        disabled={disabled || loading}
        className="w-full bg-brand-blue hover:bg-brand-blue-deep text-white font-sans font-semibold tracking-wider text-xs py-3.5 rounded-full flex items-center justify-center space-x-2 shadow-md transition-all duration-200 border border-brand-cream-text/20 disabled:opacity-50"
      >
        <span>{loading ? 'PROCESSING ORDER...' : 'PLACE ORDER'}</span>
      </button>
    </>
  );
}
