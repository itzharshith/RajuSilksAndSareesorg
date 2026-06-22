import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { Product } from '@/lib/models/Product';
import { Category } from '@/lib/models/Category';
import { Review } from '@/lib/models/Review';
import { cloudinary, isConfigured } from '@/lib/cloudinary';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const featured = searchParams.get('featured');
  const discount = searchParams.get('discount');
  const sort = searchParams.get('sort');
  const limit = Number(searchParams.get('limit') || 50);
  const page = Number(searchParams.get('page') || 1);

  const query: any = {};
  if (category) {
    const catObj = await Category.findOne({ $or: [{ _id: category }, { name: { $regex: category, $options: 'i' } }] });
    if (catObj) query.category = catObj._id;
    else return NextResponse.json({ products: [], page: 1, pages: 0, total: 0 });
  }
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
  if (minPrice || maxPrice) { query.price = {}; if (minPrice) query.price.$gte = Number(minPrice); if (maxPrice) query.price.$lte = Number(maxPrice); }
  if (featured === 'true') query.featured = true;
  if (discount === 'true') query.discount = { $gt: 0 };

  let sortOption: any = { createdAt: -1 };
  if (sort === 'priceAsc') sortOption = { price: 1 };
  else if (sort === 'priceDesc') sortOption = { price: -1 };
  else if (sort === 'discount') sortOption = { discount: -1 };

  const count = await Product.countDocuments(query);
  const products = await Product.find(query).populate('category', 'name').sort(sortOption).limit(limit).skip(limit * (page - 1));
  const productsWithReviews = await Promise.all(products.map(async (prod: any) => {
    const reviews: any[] = await Review.find({ product: prod._id });
    const rating = reviews.length > 0 ? Number((reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1)) : 0;
    return { ...prod.toObject(), rating, numReviews: reviews.length };
  }));
  return NextResponse.json({ products: productsWithReviews, page, pages: Math.ceil(count / limit), total: count });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user as any).role !== 'admin') return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const formData = await req.formData();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const price = formData.get('price') as string;
  const stock = formData.get('stock') as string;
  const discount = formData.get('discount') as string;
  const featured = formData.get('featured') as string;
  const files = formData.getAll('images') as File[];
  if (!name || !description || !category || !price || stock === undefined) {
    return NextResponse.json({ message: 'Please provide all required fields' }, { status: 400 });
  }
  const catObj = await Category.findById(category);
  if (!catObj) return NextResponse.json({ message: 'Invalid category selection' }, { status: 400 });
  let imageUrls: string[] = [];
  for (const file of files) {
    if (file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (isConfigured) {
        const result: any = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({ folder: 'raju_silks/products' }, (err, result) => err ? reject(err) : resolve(result)).end(buffer);
        });
        imageUrls.push(result.secure_url);
      }
    }
  }
  if (imageUrls.length === 0) imageUrls.push('/images/placeholder-product.svg');
  const product = await Product.create({ name, description, category, images: imageUrls, price: Number(price), stock: Number(stock), discount: discount ? Number(discount) : 0, featured: featured === 'true' });
  const populated = await Product.findById(product._id).populate('category', 'name');
  return NextResponse.json(populated, { status: 201 });
}
