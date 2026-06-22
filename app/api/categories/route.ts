import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Category } from '@/lib/models/Category';
import { Product } from '@/lib/models/Product';
import { cloudinary, isConfigured } from '@/lib/cloudinary';

export async function GET() {
  const categories = await Category.find({});
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const formData = await req.formData();
  const name = formData.get('name') as string;
  const file = formData.get('image') as File | null;
  if (!name) return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
  const exists = await Category.findOne({ name });
  if (exists) return NextResponse.json({ message: 'Category already exists' }, { status: 400 });
  let imageUrl = '/images/placeholder-category.jpg';
  if (file && file.size > 0 && isConfigured) {
    const buf = Buffer.from(await file.arrayBuffer());
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'raju_silks/categories' }, (err, res) => err ? reject(err) : resolve(res)).end(buf);
    });
    imageUrl = result.secure_url;
  }
  const category = await Category.create({ name, image: imageUrl });
  return NextResponse.json(category, { status: 201 });
}
