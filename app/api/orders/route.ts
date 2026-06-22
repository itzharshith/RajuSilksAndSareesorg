import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Order } from '@/lib/models/Order';
import { Product } from '@/lib/models/Product';
import { Coupon } from '@/lib/models/Coupon';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const { searchParams } = new URL(req.url);
  const myOrders = searchParams.get('myorders');

  if (role === 'admin' && !myOrders) {
    const orders = await Order.find({}).populate('user', 'name email').populate('products.product', 'name price').sort({ createdAt: -1 });
    return NextResponse.json(orders);
  }
  const orders = await Order.find({ user: userId }).populate('products.product', 'name images').sort({ createdAt: -1 });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const userId = (session.user as any).id;
  const customerEmail = session.user?.email || "customer@example.com";
  const customerName = session.user?.name || "Guest Customer";

  const { products, shippingAddress, couponCode, customerPhone } = await req.json();

  if (!products || products.length === 0) return NextResponse.json({ message: 'No items in order' }, { status: 400 });
  if (!shippingAddress) return NextResponse.json({ message: 'Shipping address is required' }, { status: 400 });

  let subtotal = 0;
  const orderProducts = [];

  // 1. Stock Check & Pricing Loops
  for (const item of products) {
    const product: any = await Product.findById(item.product);
    if (!product) return NextResponse.json({ message: `Product not found: ${item.product}` }, { status: 404 });
    if (product.stock < item.quantity) return NextResponse.json({ message: `Insufficient stock for: ${product.name}` }, { status: 400 });

    const discountedPrice = product.price * (1 - (product.discount || 0) / 100);
    subtotal += discountedPrice * item.quantity;
    orderProducts.push({ product: product._id, quantity: item.quantity, price: discountedPrice });
  }

  // 2. Coupon Parsing logic
  let discountAmount = 0;
  let couponApplied = null;
  if (couponCode) {
    const coupon: any = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
    if (coupon && new Date(coupon.expiryDate) > new Date()) {
      if (coupon.discountType === 'flat') discountAmount = Math.min(subtotal, coupon.discountValue);
      else discountAmount = subtotal * (coupon.discountValue / 100);
      couponApplied = coupon.code;
    }
  }

  // 3. Final Calculations
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = Math.round(taxableAmount * 0.05);
  const shippingCharges = taxableAmount > 5000 ? 0 : 100;
  const totalAmount = Math.round(taxableAmount + taxAmount + shippingCharges);

  // 4. Update Stock Inventory Numbers
  for (const item of products) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }

  // 5. Generate Database Order Entry First
  // We leave paymentStatus as 'Pending' because checkout hasn't completed yet
  const order = await Order.create({
    user: userId,
    products: orderProducts,
    totalAmount,
    discountAmount,
    taxAmount,
    shippingCharges,
    shippingAddress,
    paymentStatus: 'Pending',
    couponApplied
  });

  return NextResponse.json(order, { status: 201 });
}