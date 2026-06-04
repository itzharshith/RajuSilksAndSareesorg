const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
require('dotenv').config();

const categoriesData = [
  { name: 'Pure Silks', image: '/images/categories/pure-silks.jpg' },
  { name: 'Kanjeevaram Silks', image: '/images/categories/kanjeevaram.jpg' },
  { name: 'Bridal Collection', image: '/images/categories/bridal.jpg' },
  { name: 'Soft Silks', image: '/images/categories/soft-silks.jpg' },
  { name: 'Printed Silks', image: '/images/categories/printed-silks.jpg' },
  { name: 'Mysore Silks', image: '/images/categories/mysore-silks.jpg' },
  { name: 'Gadwal Pattu', image: '/images/categories/gadwal-pattu.jpg' },
  { name: 'Fancy', image: '/images/categories/fancy.jpg' },
  { name: 'Banaras Sarees', image: '/images/categories/banaras.jpg' },
  { name: 'Russian Silks', image: '/images/categories/russian-silks.jpg' },
  { name: 'Dola Silks', image: '/images/categories/dola-silks.jpg' },
  { name: 'Meenakari Sarees', image: '/images/categories/meenakari.jpg' },
  { name: 'Cocktail Sarees', image: '/images/categories/cocktail.jpg' }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rajusilks');
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing collections.');

    // Seed Users
    const adminUser = await User.create({
      name: 'Raju Admin',
      email: 'raj.hanumanslk@gmail.com',
      password: 'admin123', // Will be hashed by pre-save hook
      phone: '9876543210',
      role: 'admin',
      addresses: [
        {
          street: '12 Weaver Street, Silk Nagar',
          city: 'Kanchipuram',
          state: 'Tamil Nadu',
          postalCode: '631501',
          country: 'India',
          isDefault: true
        }
      ]
    });

    const demoUser = await User.create({
      name: 'Karthik Kumar',
      email: 'user@rajusilks.com',
      password: 'user123', // Will be hashed by pre-save hook
      phone: '9876543211',
      role: 'user',
      addresses: [
        {
          street: '45 Lotus Lane, T-Nagar',
          city: 'Chennai',
          state: 'Tamil Nadu',
          postalCode: '600017',
          country: 'India',
          isDefault: true
        }
      ]
    });
    console.log('Users Seeded (Admin: raj.hanumanslk@gmail.com / admin123 | User: user@rajusilks.com / user123)');

    // Seed Categories
    const seededCategories = await Category.insertMany(categoriesData);
    console.log('Categories Seeded.');

    // Map categories by name for easy lookup
    const catMap = {};
    seededCategories.forEach(cat => {
      catMap[cat.name] = cat._id;
    });

    // Seed Products
    const productsData = [
      // 1. Pure Silks
      {
        name: 'Royal Crimson Pure Silk Saree',
        description: 'Exquisite pure silk saree in deep crimson red, woven with authentic 2g gold zari borders. Featuring standard floral bootas and an elegant heavy pallu, perfect for traditional festivals.',
        category: catMap['Pure Silks'],
        images: ['/images/products/pure-crimson-1.jpg', '/images/products/pure-crimson-2.jpg'],
        price: 18500,
        stock: 12,
        discount: 10,
        featured: true
      },
      {
        name: 'Emerald Floral Pure Silk Saree',
        description: 'Lustrous emerald green pure silk saree handloomed with intricate silver and gold floral patterns. Lightweight, elegant, and soft to wear.',
        category: catMap['Pure Silks'],
        images: ['/images/products/pure-emerald-1.jpg'],
        price: 15999,
        stock: 8,
        discount: 5,
        featured: false
      },
      // 2. Kanjeevaram Silks
      {
        name: 'Golden Heritage Kanjeevaram Silk Saree',
        description: 'A masterpiece from Kanchipuram master weavers. Features full gold brocade work, thick traditional borders depicting temple motifs, and a rich, heavy pallu. Handloomed with pure mulberry silk.',
        category: catMap['Kanjeevaram Silks'],
        images: ['/images/products/kanjee-gold-1.jpg', '/images/products/kanjee-gold-2.jpg'],
        price: 34500,
        stock: 5,
        discount: 15,
        featured: true
      },
      {
        name: 'Magenta-Peacock Kanjeevaram Silk Saree',
        description: 'Bold magenta body featuring a contrasting dark green border adorned with classic peacock motifs. Handloomed using premium double-warp silk yarn.',
        category: catMap['Kanjeevaram Silks'],
        images: ['/images/products/kanjee-magenta-1.jpg'],
        price: 28999,
        stock: 6,
        discount: 10,
        featured: true
      },
      // 3. Bridal Collection
      {
        name: 'Shubh Vivah Red Kanjeevaram Saree',
        description: 'The ultimate bridal drape. An opulent red and gold Kanjeevaram featuring hand-woven wedding procession scenes along the border. Embellished with pure zari work.',
        category: catMap['Bridal Collection'],
        images: ['/images/products/bridal-red-1.jpg', '/images/products/bridal-red-2.jpg'],
        price: 49500,
        stock: 3,
        discount: 12,
        featured: true
      },
      {
        name: 'Royal Vermillion Brocade Saree',
        description: 'Dazzling vermillion orange bridal saree adorned with heavy gold brocade across the entire length. Captivating look for grand receptions.',
        category: catMap['Bridal Collection'],
        images: ['/images/products/bridal-vermillion-1.jpg'],
        price: 42000,
        stock: 4,
        discount: 8,
        featured: true
      },
      // 4. Soft Silks
      {
        name: 'Pastel Mint Soft Silk Saree',
        description: 'Ultra-lightweight soft silk saree in a pleasant mint green shade. Woven with minimalistic pastel thread work and narrow gold borders. High comfort for long ceremonies.',
        category: catMap['Soft Silks'],
        images: ['/images/products/soft-mint-1.jpg'],
        price: 6800,
        stock: 25,
        discount: 15,
        featured: false
      },
      {
        name: 'Peach Blossom Soft Silk Saree',
        description: 'Soft and flowing silk saree in double-shaded peach and pink. Features abstract modern geometric borders, perfect for corporate parties and daytime events.',
        category: catMap['Soft Silks'],
        images: ['/images/products/soft-peach-1.jpg'],
        price: 7200,
        stock: 18,
        discount: 10,
        featured: true
      },
      // 5. Printed Silks
      {
        name: 'Kalamkari Printed Crepe Silk Saree',
        description: 'Luxurious crepe silk saree featuring elaborate hand-painted Kalamkari mythological designs and standard checks. Styled with a solid contrast border.',
        category: catMap['Printed Silks'],
        images: ['/images/products/printed-kalamkari-1.jpg'],
        price: 4800,
        stock: 30,
        discount: 20,
        featured: false
      },
      // 6. Mysore Silks
      {
        name: 'Classic Navy Mysore Silk Saree',
        description: 'Authentic 100% pure crepe Mysore silk saree in royal navy blue, highlighted by a clean, thin gold zari border. Exudes understated elegance.',
        category: catMap['Mysore Silks'],
        images: ['/images/products/mysore-navy-1.jpg'],
        price: 13500,
        stock: 10,
        discount: 8,
        featured: true
      },
      // 7. Gadwal Pattu
      {
        name: 'Traditional Mustard Gadwal Pattu Saree',
        description: 'Classic Gadwal saree with a pure cotton body in deep mustard yellow and a contrasting silk border and pallu in royal purple. Woven with gorgeous traditional paisleys.',
        category: catMap['Gadwal Pattu'],
        images: ['/images/products/gadwal-mustard-1.jpg'],
        price: 12500,
        stock: 7,
        discount: 10,
        featured: false
      },
      // 8. Fancy
      {
        name: 'Metallic Champagne Georgette Saree',
        description: 'Modern fancy saree in metallic champagne shade, featuring delicate sequin borders and designer net detailing. Designed for modern cocktail receptions.',
        category: catMap['Fancy'],
        images: ['/images/products/fancy-champagne-1.jpg'],
        price: 5999,
        stock: 15,
        discount: 15,
        featured: false
      },
      // 9. Banaras Sarees
      {
        name: 'Royal Blue Banarasi Katan Silk Saree',
        description: 'Heavy Banarasi Katan silk featuring royal blue background woven with rich gold floral jaal work. A heritage masterwork from Banaras.',
        category: catMap['Banaras Sarees'],
        images: ['/images/products/banaras-blue-1.jpg', '/images/products/banaras-blue-2.jpg'],
        price: 24500,
        stock: 5,
        discount: 10,
        featured: true
      },
      // 10. Russian Silks
      {
        name: 'Rose Gold Russian Silk Saree',
        description: 'Rich Russian silk saree featuring a textured rose-gold body with digital floral prints and detailed embroidery work along the borders.',
        category: catMap['Russian Silks'],
        images: ['/images/products/russian-rose-1.jpg'],
        price: 9800,
        stock: 11,
        discount: 12,
        featured: false
      },
      // 11. Dola Silks
      {
        name: 'Teal Peacock Dola Silk Saree',
        description: 'Soft Dola silk saree in brilliant teal green, featuring delicate foil print bootas and heavy designer tassels at the pallu end.',
        category: catMap['Dola Silks'],
        images: ['/images/products/dola-teal-1.jpg'],
        price: 4500,
        stock: 22,
        discount: 20,
        featured: false
      },
      // 12. Meenakari Sarees
      {
        name: 'Multi-Color Meenakari Silk Saree',
        description: 'Elegant cream base saree featuring multi-colored threads woven into the gold zari base to create a beautiful stained-glass Meenakari design.',
        category: catMap['Meenakari Sarees'],
        images: ['/images/products/meenakari-cream-1.jpg'],
        price: 19500,
        stock: 6,
        discount: 10,
        featured: true
      },
      // 13. Cocktail Sarees
      {
        name: 'Midnight Black Sequinned Cocktail Saree',
        description: 'Stunning black georgette saree pre-embellished with shimmering black and gold micro-sequins. Sleek, glamorous, and ready for high-end parties.',
        category: catMap['Cocktail Sarees'],
        images: ['/images/products/cocktail-black-1.jpg'],
        price: 8999,
        stock: 14,
        discount: 15,
        featured: true
      }
    ];

    const seededProducts = await Product.insertMany(productsData);
    console.log('Products Seeded.');

    // Seed Reviews
    await Review.create({
      user: demoUser._id,
      product: seededProducts[0]._id, // Royal Crimson Pure Silk
      rating: 5,
      comment: 'Absolutely stunning! The gold zari border is authentic and heavy. Perfect fit for my family function. Highly recommended!'
    });

    await Review.create({
      user: demoUser._id,
      product: seededProducts[2]._id, // Golden Heritage Kanjeevaram
      rating: 5,
      comment: 'Exquisite design and excellent craftsmanship. Worth every rupee! Raju Silks never disappoints.'
    });
    console.log('Sample Reviews Seeded.');

    // Seed Coupons
    await Coupon.create({
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      active: true
    });

    await Coupon.create({
      code: 'SILK20',
      discountType: 'percentage',
      discountValue: 20,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      active: true
    });

    await Coupon.create({
      code: 'FESTIVE15',
      discountType: 'percentage',
      discountValue: 15,
      expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      active: true
    });

    await Coupon.create({
      code: 'FLAT500',
      discountType: 'flat',
      discountValue: 500,
      expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
      active: true
    });
    console.log('Coupons Seeded.');

    console.log('Database Seeding Completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
