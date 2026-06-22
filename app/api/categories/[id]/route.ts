import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Category } from '@/lib/models/Category';
import { Product } from '@/lib/models/Product';
import { cloudinary, isConfigured } from '@/lib/cloudinary';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await Category.findById(id);
  if (!category) return NextResponse.json({ message: 'Category not found' }, { status: 404 });
  return NextResponse.json(category);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const category: any = await Category.findById(id);
  if (!category) return NextResponse.json({ message: 'Category not found' }, { status: 404 });
  const formData = await req.formData();
  const name = formData.get('name') as string;
  const file = formData.get('image') as File | null;
  category.name = name || category.name;
  if (file && file.size > 0 && isConfigured) {
    const buf = Buffer.from(await file.arrayBuffer());
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'raju_silks/categories' }, (err, res) => err ? reject(err) : resolve(res)).end(buf);
    });
    category.image = result.secure_url;
  }
  await category.save();
  return NextResponse.json(category);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const category = await Category.findById(id);
  if (!category) return NextResponse.json({ message: 'Category not found' }, { status: 404 });
  const productCount = await Product.countDocuments({ category: id });
  if (productCount > 0) return NextResponse.json({ message: 'Cannot delete category with products. Reassign or delete the products first.' }, { status: 400 });
  await Category.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Category removed successfully' });
}
