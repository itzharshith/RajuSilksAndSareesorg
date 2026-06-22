import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { User } from '@/lib/models/User';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const user: any = await User.findById(id);
  if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
  if (user.role === 'admin') return NextResponse.json({ message: 'Administrator accounts cannot be blocked.' }, { status: 400 });
  user.isBlocked = !user.isBlocked;
  await user.save();
  return NextResponse.json({ message: `User account has been ${user.isBlocked ? 'blocked' : 'unblocked'}.`, isBlocked: user.isBlocked });
}
