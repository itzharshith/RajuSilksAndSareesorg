import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/models/User';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ message: 'Email address is required' }, { status: 400 });
  const user: any = await User.findOne({ email });
  if (!user) return NextResponse.json({ message: 'No account found with this email' }, { status: 404 });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordOTP = otp;
  user.resetPasswordOTPExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  await user.save();
  const subject = 'Password Reset OTP - Raju Silks & Sarees';
  const text = `Your OTP to reset your password is: ${otp}. This code is valid for 10 minutes.`;
  const html = `<div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;background:#f8f9fa;border-radius:12px;">
    <div style="background:#0B3C5D;padding:30px;text-align:center;border-radius:8px 8px 0 0;">
      <h1 style="color:#E5DDC8;margin:0;font-size:22px;">RAJU SILKS & SAREES</h1>
    </div>
    <div style="background:#fff;padding:30px;">
      <h2 style="color:#333;">Reset Your Password</h2>
      <p>Dear Patron, use the following OTP to reset your password:</p>
      <div style="background:#f4f6f8;border:1px dashed #0B3C5D;border-radius:8px;padding:20px;text-align:center;margin:20px 0;">
        <span style="font-family:monospace;font-size:32px;font-weight:bold;color:#0B3C5D;letter-spacing:8px;">${otp}</span>
      </div>
      <p style="color:#777;font-size:13px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
    </div>
  </div>`;
  try { await sendEmail({ email, subject, text, html }); } catch (e) { console.error('Email send error', e); }
  const response: any = { message: 'OTP sent to your email.' };
  if (process.env.NODE_ENV !== 'production') response.otp = otp;
  return NextResponse.json(response);
}
