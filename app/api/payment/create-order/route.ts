import { NextResponse } from 'next/server';

// This stub is no longer used.
// Cashfree payment sessions are created via /api/payment/cashfree/create-session
export async function POST() {
  return NextResponse.json(
    { message: 'Deprecated. Use /api/payment/cashfree/create-session instead.' },
    { status: 410 }
  );
}
