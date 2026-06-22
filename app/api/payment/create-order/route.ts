import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { amount } = await req.json();
  if (!amount || amount <= 0) return NextResponse.json({ message: 'Amount is required and must be greater than zero' }, { status: 400 });
  const amountInPaise = Math.round(amount * 100);
  const mockOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
  return NextResponse.json({ id: mockOrderId, entity: 'order', amount: amountInPaise, amount_paid: 0, amount_due: amountInPaise, currency: 'INR', receipt: `rcpt_${Date.now()}`, status: 'created', attempts: 0, notes: [], created_at: Math.floor(Date.now() / 1000), razorpay_key: 'rzp_test_mock_key_rajusilks' }, { status: 201 });
}
