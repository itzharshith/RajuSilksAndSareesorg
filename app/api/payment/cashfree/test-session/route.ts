import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const getCashfreeBaseUrl = () =>
  process.env.CASHFREE_ENV === 'PROD'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

// POST /api/payment/cashfree/test-session
// Creates a ₹1 Cashfree order for gateway testing — no DB order required
export async function POST(req: NextRequest) {
  try {
    const testOrderId = `test_${crypto.randomBytes(10).toString('hex')}`;
    
    // Dynamically resolve base URL from request headers to support HTTPS localtunnel/ngrok URL
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const baseUrl = (process.env.CASHFREE_ENV === 'PROD' && !host.includes('localhost') && !host.includes('127.0.0.1'))
      ? `https://${host}`
      : `${proto}://${host}`;

    const baseApiUrl = getCashfreeBaseUrl();

    // Cashfree production API strictly requires the return_url to be HTTPS.
    // If we are developing locally on HTTP, we use a placeholder HTTPS URL.
    // The user can verify the payment status manually via the UI.
    let returnUrl = `${baseUrl}/test-payment?test_order_id=${testOrderId}`;
    if (returnUrl.startsWith('http://localhost') || returnUrl.startsWith('http://127.0.0.1')) {
      returnUrl = `https://example.com/payment-success?test_order_id=${testOrderId}`;
    }

    const payload = {
      order_id: testOrderId,
      order_amount: 1.00,
      order_currency: 'INR',
      customer_details: {
        customer_id: 'test_customer_001',
        customer_name: 'Raju Silks Test',
        customer_email: 'test@rajusilks.com',
        customer_phone: '9999999999',
      },
      order_meta: {
        return_url: returnUrl,
      },
    };

    const cfResponse = await fetch(`${baseApiUrl}/orders`, {
      method: 'POST',
      headers: {
        'x-client-id': process.env.CASHFREE_APP_ID!,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY!,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const cfData = await cfResponse.json();

    if (!cfResponse.ok) {
      console.error('[Cashfree Test] Create order error:', cfData);
      return NextResponse.json(
        { message: cfData.message || 'Failed to create test payment session' },
        { status: 502 }
      );
    }

    console.log('[Cashfree Test] Session created:', testOrderId);

    return NextResponse.json({
      payment_session_id: cfData.payment_session_id,
      test_order_id: testOrderId,
    });
  } catch (err: any) {
    console.error('[Cashfree Test] Error:', err);
    return NextResponse.json({ message: err.message || 'Internal error' }, { status: 500 });
  }
}
