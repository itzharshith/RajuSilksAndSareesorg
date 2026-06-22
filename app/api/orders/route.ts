import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Order } from '@/lib/models/Order';
import { Product } from '@/lib/models/Product';
import { Coupon } from '@/lib/models/Coupon';
import { Cashfree, CFEnvironment } from "cashfree-pg";

// Initialize Cashfree SDK
Cashfree.XClientId = process.env.CASHFREE_APP_ID!;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
Cashfree.XEnvironment = process.env.NEXT_PUBLIC_CASHFREE_MODE === "production" 
  ? CFEnvironment.PRODUCTION 
  : CFEnvironment.SANDBOX;
Cashfree.XApiVersion = "2023-08-01";

// ==========================================
// GET: Fetch User Orders or Admin Dashboard
// ==========================================
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  
  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  const { searchParams } = new URL(req.url);
  const myOrders = searchParams.get('myorders');

  if (role === 'admin' && !myOrders) {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('products.product', 'name price')
      .sort({ createdAt: -1 });
    return NextResponse.json(orders);
  }
  
  const orders = await Order.find({ user: userId })
    .populate('products.product', 'name images')
    .sort({ createdAt: -1 });
  return NextResponse.json(orders);
}

// ====================================================
// POST: Process Internal Order & Create Cashfree Token
// ====================================================
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const customerEmail = session.user?.email || "customer@example.com";
    const customerName = session.user?.name || "Guest Customer";

    const body = await req.json();
    const { products, shippingAddress, couponCode, customerPhone } = body;

    // 1. Validations
    if (!products || products.length === 0) return NextResponse.json({ message: 'No items in order' }, { status: 400 });
    if (!shippingAddress) return NextResponse.json({ message: 'Shipping address is required' }, { status: 400 });

    let subtotal = 0;
    const orderProducts = [];

    // 2. Stock Check & Pricing Loops
    for (const item of products) {
      const product: any = await Product.findById(item.product);
      if (!product) return NextResponse.json({ message: `Product not found: ${item.product}` }, { status: 404 });
      if (product.stock < item.quantity) return NextResponse.json({ message: `Insufficient stock for: ${product.name}` }, { status: 400 });

      const discountedPrice = product.price * (1 - (product.discount || 0) / 100);
      subtotal += discountedPrice * item.quantity;
      orderProducts.push({ product: product._id, quantity: item.quantity, price: discountedPrice });
    }

    // 3. Coupon Parsing Logic
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

    // 4. Final Calculations
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = Math.round(taxableAmount * 0.05);
    const shippingCharges = taxableAmount > 5000 ? 0 : 100;
    const totalAmount = Math.round(taxableAmount + taxAmount + shippingCharges);

    // 5. Update Stock Inventory Numbers
    for (const item of products) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    // 6. Generate Database Order Entry First
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

    // 7. Initialize Cashfree PG Order Request
    // We map cashfree's order_id to your database order._id string format
    const orderRequest = {
      order_amount: totalAmount.toString(),
      order_currency: "INR",
      order_id: order._id.toString(), 
      customer_details: {
        customer_id: userId.toString(),
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || "9999999999", // Fallback placeholder if missing
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order-verify?order_id={order_id}`,
      },
    };

    const cfResponse = await Cashfree.PGCreateOrder(orderRequest);
    
    // 8. Return database order details along with Cashfree session keys
    return NextResponse.json({
      success: true,
      orderId: order._id,
      cfData: cfResponse.data
    }, { status: 201 });

  } catch (error: any) {
    console.error("Order processing or Cashfree creation error:", error?.response?.data || error);
    return NextResponse.json(
      { error: error?.response?.data?.message || error.message || "Failed to process payment gateway initialization" },
      { status: 500 }
    );
  }
}