import { NextResponse } from 'next/server';

// This stub is no longer used.
// Payment verification is handled via /api/payment/cashfree/verify
export async function POST() {
  return NextResponse.json(
    { message: 'Deprecated. Use /api/payment/cashfree/verify instead.' },
    { status: 410 }
  );
}
