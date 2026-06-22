import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Product } from '@/lib/models/Product';
import { Review } from '@/lib/models/Review';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const { rating, comment } = await req.json();
  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  if (!rating || !comment) return NextResponse.json({ message: 'Please provide rating and comment' }, { status: 400 });
  const userId = (session.user as any).id;
  const existing: any = await Review.findOne({ user: userId, product: id });
  if (existing) {
    existing.rating = Number(rating); existing.comment = comment;
    await existing.save();
    return NextResponse.json({ message: 'Review updated successfully' });
  }
  const review = await Review.create({ user: userId, product: id, rating: Number(rating), comment });
  return NextResponse.json(review, { status: 201 });
}
