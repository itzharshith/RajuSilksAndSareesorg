import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Product } from '@/lib/models/Product';
import { Category } from '@/lib/models/Category';
import { Review } from '@/lib/models/Review';
import { cloudinary, isConfigured } from '@/lib/cloudinary';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product: any = await Product.findById(id).populate('category', 'name');
  if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  const reviews: any[] = await Review.find({ product: id }).populate('user', 'name').sort({ createdAt: -1 });
  const avgRating = reviews.length > 0 ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)) : 0;
  return NextResponse.json({ ...product.toObject(), reviews, rating: avgRating, numReviews: reviews.length });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const product: any = await Product.findById(id);
  if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  const formData = await req.formData();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const price = formData.get('price') as string;
  const stock = formData.get('stock') as string;
  const discount = formData.get('discount') as string;
  const featured = formData.get('featured') as string;
  const existingImages = formData.getAll('existingImages') as string[];
  const files = formData.getAll('images') as File[];
  if (category) { const catObj = await Category.findById(category); if (!catObj) return NextResponse.json({ message: 'Invalid category selection' }, { status: 400 }); product.category = category; }
  product.name = name || product.name;
  product.description = description || product.description;
  if (price !== null) product.price = Number(price);
  if (stock !== null) product.stock = Number(stock);
  if (discount !== null) product.discount = Number(discount);
  if (featured !== null) product.featured = featured === 'true';
  let finalImages = [...existingImages];
  for (const file of files) {
    if (file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (isConfigured) {
        const result: any = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({ folder: 'raju_silks/products' }, (err, result) => err ? reject(err) : resolve(result)).end(buffer);
        });
        finalImages.push(result.secure_url);
      }
    }
  }
  if (finalImages.length === 0) finalImages = product.images.length > 0 ? product.images : ['/images/placeholder-product.jpg'];
  product.images = finalImages;
  await product.save();
  const populated = await Product.findById(id).populate('category', 'name');
  return NextResponse.json(populated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const product = await Product.findById(id);
  if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
  await Review.deleteMany({ product: id });
  await Product.findByIdAndDelete(id);
  return NextResponse.json({ message: 'Product removed successfully' });
}
