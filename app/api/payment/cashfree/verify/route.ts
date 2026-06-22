import { NextRequest, NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";
import { Order } from "@/lib/models/Order";

Cashfree.XEnvironment = CFEnvironment.SANDBOX;
Cashfree.XClientId = process.env.CASHFREE_APP_ID as string;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY as string;
Cashfree.XApiVersion = "2023-08-01";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required" }, { status: 400 });
    }

    // 1. Fetch order details from Cashfree
    const response = await Cashfree.PGFetchOrder(orderId);
    const cfOrder = response.data;

    // 2. Check payment status
    const isPaid = cfOrder.order_status === "PAID";

    if (isPaid) {
      // Update our database order status to 'Paid'
      const existingOrder = await Order.findById(orderId);
      if (existingOrder && existingOrder.paymentStatus !== "Paid") {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: "Paid",
          paymentDetails: cfOrder,
        });
      }

      return NextResponse.json({
        success: true,
        status: cfOrder.order_status,
        message: "Payment verified successfully",
      }, { status: 200 });
    } else {
      return NextResponse.json({
        success: false,
        status: cfOrder.order_status,
        message: `Payment status is ${cfOrder.order_status}`,
      }, { status: 200 });
    }

  } catch (error: any) {
    console.error("Cashfree Verification Error:", error.response ? error.response.data : error.message);
    return NextResponse.json({
      success: false,
      message: error.response?.data?.message || "Internal verification connectivity issue",
    }, { status: 500 });
  }
}
