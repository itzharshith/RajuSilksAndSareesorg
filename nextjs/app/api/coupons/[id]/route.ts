import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Coupon } from '@/lib/models/Coupon';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const coupon: any = await Coupon.findById(id);
  if (!coupon) return NextResponse.json({ message: 'Coupon not found' }, { status: 404 });
  coupon.active = !coupon.active;
  await coupon.save();
  return NextResponse.json(coupon);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const coupon = await Coupon.findById(id);
  if (!coupon) return NextResponse.json({ message: 'Coupon not found' }, { status: 404 });
  await Coupon.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Coupon deleted successfully' });
}
