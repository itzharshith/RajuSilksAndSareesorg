import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { User } from '@/lib/models/User';
import { Order } from '@/lib/models/Order';

// GET /api/users — Admin: list all users
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const users = await User.find({}).select('-password');
  const usersWithStats = await Promise.all(
    users.map(async (user: any) => {
      const orderCount = await Order.countDocuments({ user: user._id });
      return { ...user.toObject(), orderCount };
    })
  );
  return NextResponse.json(usersWithStats);
}

// POST /api/users — Register new user
export async function POST(req: NextRequest) {
  const { name, email, password, phone } = await req.json();
  if (!name || !email || !password || !phone) {
    return NextResponse.json({ message: 'Please provide all required fields' }, { status: 400 });
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    return NextResponse.json({ message: 'User already exists with this email' }, { status: 400 });
  }
  const user: any = await User.create({ name, email, password, phone, role: 'user', addresses: [] });
  return NextResponse.json({
    _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, addresses: user.addresses,
  }, { status: 201 });
}
