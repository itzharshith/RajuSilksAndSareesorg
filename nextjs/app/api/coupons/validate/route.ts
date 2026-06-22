import { NextRequest, NextResponse } from 'next/server';
import { Coupon } from '@/lib/models/Coupon';

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ message: 'Coupon code is required' }, { status: 400 });
  const coupon: any = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return NextResponse.json({ message: 'Invalid coupon code' }, { status: 404 });
  if (!coupon.active) return NextResponse.json({ message: 'Coupon has been deactivated' }, { status: 400 });
  if (new Date(coupon.expiryDate) < new Date()) return NextResponse.json({ message: 'Coupon code has expired' }, { status: 400 });
  return NextResponse.json({ valid: true, code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue });
}
