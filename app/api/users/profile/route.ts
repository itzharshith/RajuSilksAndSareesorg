import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { User } from '@/lib/models/User';

// GET /api/users/profile
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const user = await User.findById((session.user as any).id).select('-password');
  if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
  return NextResponse.json(user);
}

// PUT /api/users/profile
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { name, phone, password } = await req.json();
  const user: any = await User.findById((session.user as any).id);
  if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
  user.name = name || user.name;
  user.phone = phone || user.phone;
  if (password) user.password = password;
  const updated = await user.save();
  return NextResponse.json({ _id: updated._id, name: updated.name, email: updated.email, phone: updated.phone, role: updated.role, addresses: updated.addresses });
}
