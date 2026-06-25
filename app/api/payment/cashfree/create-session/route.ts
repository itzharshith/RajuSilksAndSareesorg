import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Order } from '@/lib/models/Order';

const getCashfreeBaseUrl = () =>
  process.env.CASHFREE_ENV === 'PROD'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

// POST /api/payment/cashfree/create-session
// Creates a Cashfree order and returns payment_session_id for the frontend SDK
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, amount, customerName, customerEmail, customerPhone } = await req.json();

    if (!orderId || !amount || amount <= 0) {
      return NextResponse.json(
        { message: 'Order ID and a valid amount are required' },
        { status: 400 }
      );
    }

    // Validate our DB order exists
    const dbOrder = await Order.findById(orderId);
    if (!dbOrder) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Dynamically resolve base URL from request headers to support HTTPS localtunnel/ngrok URL
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const baseUrl = (process.env.CASHFREE_ENV === 'PROD' && !host.includes('localhost') && !host.includes('127.0.0.1'))
      ? `https://${host}`
      : `${proto}://${host}`;

    const baseApiUrl = getCashfreeBaseUrl();

    // Cashfree production API strictly requires the return_url to be HTTPS.
    // If we are developing locally on HTTP, we use a placeholder HTTPS URL.
    // In production, the domain will be a real HTTPS domain, so it works automatically.
    let returnUrl = `${baseUrl}/order-verify?order_id=${orderId}`;
    if (returnUrl.startsWith('http://localhost') || returnUrl.startsWith('http://127.0.0.1')) {
      returnUrl = `https://example.com/order-verify?order_id=${orderId}`;
    }

    const payload = {
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id: (session.user as any).id || 'guest_user',
        customer_name: customerName || 'Guest Customer',
        customer_email: customerEmail || 'customer@example.com',
        customer_phone: String(customerPhone || '9999999999'),
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
      console.error('[Cashfree] Create order error:', cfData);
      return NextResponse.json(
        { message: cfData.message || 'Failed to create Cashfree payment session' },
        { status: 502 }
      );
    }

    console.log('[Cashfree] Order created:', cfData.cf_order_id, '| Session:', cfData.payment_session_id?.substring(0, 20) + '...');

    return NextResponse.json({
      payment_session_id: cfData.payment_session_id,
      cashfree_order_id: cfData.order_id,
    });
  } catch (err: any) {
    console.error('[Cashfree] create-session error:', err);
    return NextResponse.json(
      { message: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
