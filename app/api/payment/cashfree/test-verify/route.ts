import { NextRequest, NextResponse } from 'next/server';

const getCashfreeBaseUrl = () =>
  process.env.CASHFREE_ENV === 'PROD'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

// GET /api/payment/cashfree/test-verify?test_order_id=xxx
// Checks the status of a test Cashfree order directly
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const testOrderId = searchParams.get('test_order_id');

    if (!testOrderId) {
      return NextResponse.json({ message: 'test_order_id is required' }, { status: 400 });
    }

    const baseApiUrl = getCashfreeBaseUrl();

    const cfResponse = await fetch(`${baseApiUrl}/orders/${testOrderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': process.env.CASHFREE_APP_ID!,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY!,
        'x-api-version': '2023-08-01',
        Accept: 'application/json',
      },
    });

    const cfData = await cfResponse.json();

    if (!cfResponse.ok) {
      return NextResponse.json(
        { message: cfData.message || 'Could not fetch order status' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      order_status: cfData.order_status,        // PAID | ACTIVE | EXPIRED
      order_amount: cfData.order_amount,
      order_id: cfData.order_id,
      cf_order_id: cfData.cf_order_id,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Internal error' }, { status: 500 });
  }
}
