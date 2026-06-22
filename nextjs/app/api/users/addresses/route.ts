import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { User } from '@/lib/models/User';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { street, city, state, postalCode, country, isDefault } = await req.json();
  if (!street || !city || !state || !postalCode || !country) {
    return NextResponse.json({ message: 'Please provide all address fields' }, { status: 400 });
  }
  const user: any = await User.findById((session.user as any).id);
  if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
  if (isDefault) user.addresses.forEach((addr: any) => addr.isDefault = false);
  user.addresses.push({ street, city, state, postalCode, country, isDefault: isDefault || user.addresses.length === 0, _id: crypto.randomUUID() });
  const updated = await user.save();
  return NextResponse.json(updated.addresses, { status: 201 });
}
