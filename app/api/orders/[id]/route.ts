import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Order } from '@/lib/models/Order';
import { Product } from '@/lib/models/Product';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const order: any = await Order.findById(id).populate('user', 'name email phone').populate('products.product', 'name images price');
  if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  if (order.user._id !== userId && role !== 'admin') return NextResponse.json({ message: 'Access denied' }, { status: 403 });
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { status, paymentStatus } = await req.json();
  const order: any = await Order.findById(id);
  if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });
  if (status) {
    if (status === 'Cancelled' && order.orderStatus !== 'Cancelled') {
      for (const item of order.products) await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    } else if (order.orderStatus === 'Cancelled' && status !== 'Cancelled') {
      for (const item of order.products) await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }
    order.orderStatus = status;
  }
  if (paymentStatus) order.paymentStatus = paymentStatus;
  const updated = await order.save();
  return NextResponse.json(updated);
}
