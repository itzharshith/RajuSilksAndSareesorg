const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const fs = require('fs');
const path = require('path');
const { isConfigured, cloudinary } = require('../config/cloudinary');

// @desc    Get filtered products listing
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, featured, discount, sort, limit = 50, page = 1 } = req.query;

    const query = {};

    // Filter by Category
    if (category) {
      // Could be ID or name
      const categoryObj = await Category.findOne({
        $or: [
          { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null },
          { name: { $regex: category, $options: 'i' } }
        ].filter(Boolean)
      });
      if (categoryObj) {
        query.category = categoryObj._id;
      } else {
        return res.json({ products: [], page: 1, pages: 0, total: 0 });
      }
    }

    // Search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Featured items
    if (featured === 'true') {
      query.featured = true;
    }

    // Discounted items
    if (discount === 'true') {
      query.discount = { $gt: 0 };
    }

    // Sorting options
    let sortOption = { createdAt: -1 }; // Default: New Arrivals
    if (sort) {
      if (sort === 'priceAsc') sortOption = { price: 1 };
      else if (sort === 'priceDesc') sortOption = { price: -1 };
      else if (sort === 'rating') sortOption = { rating: -1 }; // Will require manual calculation or average rating field
      else if (sort === 'discount') sortOption = { discount: -1 };
    }

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sortOption)
      .limit(Number(limit))
      .skip(Number(limit) * (Number(page) - 1));

    // Get reviews to calculate ratings dynamically
    const productsWithReviews = await Promise.all(
      products.map(async (prod) => {
        const reviews = await Review.find({ product: prod._id });
        const rating = reviews.length > 0
          ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
          : 0;
        return {
          ...prod.toObject(),
          rating,
          numReviews: reviews.length
        };
      })
    );

    res.json({
      products: productsWithReviews,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await Review.find({ product: product._id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0
      ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
      : 0;

    res.json({
      ...product.toObject(),
      reviews,
      rating: avgRating,
      numReviews: reviews.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, discount, featured } = req.body;

    if (!name || !description || !category || !price || stock === undefined) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const categoryObj = await Category.findById(category);
    if (!categoryObj) {
      return res.status(400).json({ message: 'Invalid category selection' });
    }

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (isConfigured) {
          try {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: 'raju_silks/products',
            });
            imageUrls.push(result.secure_url);
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error('Cloudinary upload error, fallback to local path:', err);
            imageUrls.push(`/uploads/${file.filename}`);
          }
        } else {
          imageUrls.push(`/uploads/${file.filename}`);
        }
      }
    }

    if (imageUrls.length === 0) {
      imageUrls.push('/images/placeholder-product.jpg');
    }

    const product = await Product.create({
      name,
      description,
      category,
      images: imageUrls,
      price: Number(price),
      stock: Number(stock),
      discount: discount ? Number(discount) : 0,
      featured: featured === 'true' || featured === true
    });

    const populatedProduct = await Product.findById(product._id).populate('category', 'name');
    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { name, description, category, price, stock, discount, featured, existingImages } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (category) {
      const categoryObj = await Category.findById(category);
      if (!categoryObj) {
        return res.status(400).json({ message: 'Invalid category selection' });
      }
      product.category = category;
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? Number(price) : product.price;
    product.stock = stock !== undefined ? Number(stock) : product.stock;
    product.discount = discount !== undefined ? Number(discount) : product.discount;
    product.featured = featured !== undefined ? (featured === 'true' || featured === true) : product.featured;

    // Handle existing images retained
    let finalImages = [];
    if (existingImages) {
      // If single string, make array
      finalImages = Array.isArray(existingImages) ? existingImages : [existingImages];
    }

    // Handle new uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        if (isConfigured) {
          try {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: 'raju_silks/products',
            });
            finalImages.push(result.secure_url);
            fs.unlinkSync(file.path);
          } catch (err) {
            console.error('Cloudinary upload error, fallback to local path:', err);
            finalImages.push(`/uploads/${file.filename}`);
          }
        } else {
          finalImages.push(`/uploads/${file.filename}`);
        }
      }
    }

    // If images are fully cleared, ensure at least one placeholder exists
    if (finalImages.length === 0) {
      finalImages = product.images.length > 0 ? product.images : ['/images/placeholder-product.jpg'];
    }

    // Delete unused local files
    const deletedImages = product.images.filter(img => !finalImages.includes(img));
    deletedImages.forEach(img => {
      if (img.startsWith('/uploads/')) {
        const imgPath = path.join(__dirname, '..', img);
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
        }
      }
    });

    product.images = finalImages;
    const updatedProduct = await product.save();
    const populatedProduct = await Product.findById(updatedProduct._id).populate('category', 'name');

    res.json(populatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete associated files
    product.images.forEach(img => {
      if (img.startsWith('/uploads/')) {
        const imgPath = path.join(__dirname, '..', img);
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
        }
      }
    });

    // Delete reviews
    await Review.deleteMany({ product: product._id });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add review to a product
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Please provide rating and comment' });
    }

    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: req.params.id
    });

    if (alreadyReviewed) {
      alreadyReviewed.rating = Number(rating);
      alreadyReviewed.comment = comment;
      await alreadyReviewed.save();
      return res.status(200).json({ message: 'Review updated successfully' });
    }

    const review = await Review.create({
      user: req.user._id,
      product: req.params.id,
      rating: Number(rating),
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview
};
