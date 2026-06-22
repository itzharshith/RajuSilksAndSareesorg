import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { User } from '@/lib/models/User';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { street, city, state, postalCode, country, isDefault } = await req.json();
  const user: any = await User.findById((session.user as any).id);
  if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
  const address = user.addresses.find((a: any) => a._id === id);
  if (!address) return NextResponse.json({ message: 'Address not found' }, { status: 404 });
  if (isDefault) user.addresses.forEach((addr: any) => addr.isDefault = false);
  address.street = street || address.street;
  address.city = city || address.city;
  address.state = state || address.state;
  address.postalCode = postalCode || address.postalCode;
  address.country = country || address.country;
  address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;
  const updated = await user.save();
  return NextResponse.json(updated.addresses);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const user: any = await User.findById((session.user as any).id);
  if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
  const idx = user.addresses.findIndex((a: any) => a._id === id);
  if (idx === -1) return NextResponse.json({ message: 'Address not found' }, { status: 404 });
  const wasDefault = user.addresses[idx].isDefault;
  user.addresses.splice(idx, 1);
  if (wasDefault && user.addresses.length > 0) user.addresses[0].isDefault = true;
  const updated = await user.save();
  return NextResponse.json(updated.addresses);
}
