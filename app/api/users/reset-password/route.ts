import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/models/User';

export async function POST(req: NextRequest) {
  const { email, otp, newPassword } = await req.json();
  if (!email || !otp || !newPassword) {
    return NextResponse.json({ message: 'Please provide email, OTP, and new password' }, { status: 400 });
  }
  const user: any = await User.findOne({ email, resetPasswordOTP: otp });
  if (!user) return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });
  if (new Date(user.resetPasswordOTPExpires) < new Date()) {
    return NextResponse.json({ message: 'OTP has expired' }, { status: 400 });
  }
  user.password = newPassword;
  user.resetPasswordOTP = null;
  user.resetPasswordOTPExpires = null;
  await user.save();
  return NextResponse.json({ message: 'Password has been reset successfully. Please log in with your new password.' });
}
