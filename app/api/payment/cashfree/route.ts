import { NextRequest, NextResponse } from "next/server";
import { Cashfree, CFEnvironment } from "cashfree-pg";

// Initialize the Cashfree SDK using your environment variables securely.
// Note: While testing in development, keep this on SANDBOX. Change to PRODUCTION only when live.
Cashfree.XEnvironment = CFEnvironment.SANDBOX;
Cashfree.XClientId = process.env.CASHFREE_APP_ID as string;
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY as string;
Cashfree.XApiVersion = "2023-08-01";

export async function POST(req: NextRequest) {
  try {
    // 1. Extract dynamic order payload from the frontend request body
    const body = await req.json();
    const { orderId, amount, customerId, customerName, customerEmail, customerPhone } = body;

    // Validate incoming data briefly
    if (!amount) {
      return NextResponse.json({ message: "Amount is required" }, { status: 400 });
    }

    // 2. Use the provided orderId or generate a unique Order ID string
    const dynamicOrderId = orderId || `order_${Date.now()}`;

    // 3. Build the Cashfree integration payload structure
    const requestPayload = {
      order_id: dynamicOrderId,
      order_amount: parseFloat(amount).toFixed(2), // Cashfree strictly requires string conversion with decimal formatting
      order_currency: "INR",
      customer_details: {
        customer_id: customerId || `cust_${Date.now()}`,
        customer_name: customerName || "Guest Customer",
        customer_email: customerEmail || "guest@example.com",
        customer_phone: customerPhone || "9999999999", // Sandbox accepts filler numbers for fallback
      },
      order_meta: {
        // Point the redirect confirmation back to your application domain configuration
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/order-verify?order_id=${dynamicOrderId}`,
      },
    };

    // 4. Send request to Cashfree API Core Engine
    const response = await Cashfree.PGCreateOrder(requestPayload);

    // 5. Return both the new tracking parameters and the critical payment_session_id back to the React client layout
    return NextResponse.json({
      success: true,
      order_id: response.data.order_id,
      payment_session_id: response.data.payment_session_id,
      cf_order_id: response.data.cf_order_id,
    }, { status: 200 });

  } catch (error: any) {
    console.error("Cashfree Order Setup Error:", error.response ? error.response.data : error.message);
    
    return NextResponse.json({
      success: false,
      message: error.response?.data?.message || "Internal gateway connectivity issue",
    }, { status: 500 });
  }
}
