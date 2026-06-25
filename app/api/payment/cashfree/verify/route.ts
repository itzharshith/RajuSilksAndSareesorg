import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/lib/models/Order';

const getCashfreeBaseUrl = () =>
  process.env.CASHFREE_ENV === 'PROD'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

// GET /api/payment/cashfree/verify?order_id=<our-db-order-id>
// Queries Cashfree for payment status, updates DB, returns result
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ message: 'order_id is required' }, { status: 400 });
    }

    // Find DB order
    const dbOrder: any = await Order.findById(orderId);
    if (!dbOrder) {
      return NextResponse.json({ message: 'Order not found in database' }, { status: 404 });
    }

    // If already paid, return cached result
    if (dbOrder.paymentStatus === 'Paid') {
      return NextResponse.json({
        success: true,
        paymentStatus: 'Paid',
        orderStatus: dbOrder.orderStatus,
        message: 'Payment already verified',
      });
    }

    const baseApiUrl = getCashfreeBaseUrl();

    // Query Cashfree for the order status
    const cfResponse = await fetch(`${baseApiUrl}/orders/${orderId}`, {
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
      console.error('[Cashfree] Verify order error:', cfData);
      return NextResponse.json(
        { message: cfData.message || 'Failed to fetch payment status from Cashfree' },
        { status: 502 }
      );
    }

    const cfOrderStatus = cfData.order_status; // 'PAID' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
    console.log('[Cashfree] Order status for', orderId, ':', cfOrderStatus);

    // Map Cashfree status → our DB status
    let paymentStatus: string;
    let orderStatus: string | undefined;

    if (cfOrderStatus === 'PAID') {
      paymentStatus = 'Paid';
      orderStatus = 'Processing';
    } else if (cfOrderStatus === 'EXPIRED' || cfOrderStatus === 'CANCELLED') {
      paymentStatus = 'Failed';
    } else {
      // ACTIVE = payment not yet completed
      paymentStatus = 'Pending';
    }

    // Update DB order with latest status and Cashfree payment details
    dbOrder.paymentStatus = paymentStatus;
    if (orderStatus) dbOrder.orderStatus = orderStatus;
    dbOrder.paymentDetails = {
      cf_order_id: cfData.order_id,
      cf_order_status: cfOrderStatus,
      cf_order_amount: cfData.order_amount,
      verified_at: new Date().toISOString(),
    };
    await dbOrder.save();

    return NextResponse.json({
      success: cfOrderStatus === 'PAID',
      paymentStatus,
      orderStatus: dbOrder.orderStatus,
      cfOrderStatus,
    });
  } catch (err: any) {
    console.error('[Cashfree] verify error:', err);
    return NextResponse.json(
      { message: err.message || 'Internal server error during payment verification' },
      { status: 500 }
    );
  }
}
