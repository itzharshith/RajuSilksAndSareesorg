import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Coupon } from '@/lib/models/Coupon';

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { code, discountType = 'percentage', discountValue, expiryDate } = await req.json();
  const finalValue = Number(discountValue);
  if (!code || isNaN(finalValue) || !expiryDate) return NextResponse.json({ message: 'Please provide code, discount value, and expiry date' }, { status: 400 });
  const exists = await Coupon.findOne({ code: code.toUpperCase() });
  if (exists) return NextResponse.json({ message: 'Coupon code already exists' }, { status: 400 });
  const coupon = await Coupon.create({ code: code.toUpperCase(), discountType, discountValue: finalValue, expiryDate, active: true });
  return NextResponse.json(coupon, { status: 201 });
}
