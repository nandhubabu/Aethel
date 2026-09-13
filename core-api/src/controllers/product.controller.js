const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * GET /api/v1/products
 * Public: list active products with filtering, search, sort, and pagination.
 */
async function getProducts(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 12, 50);
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.vendor) filter.vendor = req.query.vendor;
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Sorting
    let sort = { createdAt: -1 };
    if (req.query.sort === 'price_asc') sort = { price: 1 };
    else if (req.query.sort === 'price_desc') sort = { price: -1 };
    else if (req.query.sort === 'rating') sort = { averageRating: -1 };
    else if (req.query.sort === 'newest') sort = { createdAt: -1 };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('vendor', 'name vendorProfile.storeName')
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/products/:id
 * Public: get single product by ID.
 */
async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'name vendorProfile.storeName vendorProfile.rating')
      .populate('reviews.user', 'name avatar');

    if (!product || !product.isActive) {
      throw new AppError('Product not found.', 404);
    }

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/products
 * Vendor: create a new product.
 */
async function createProduct(req, res, next) {
  try {
    const { title, description, price, compareAtPrice, category, images, stock, tags } = req.validatedBody;

    const product = await Product.create({
      title,
      description,
      price,
      compareAtPrice: compareAtPrice || 0,
      category,
      images: images || [],
      stock: stock || 0,
      tags: tags || [],
      vendor: req.user.id,
    });

    logger.info({ productId: product._id, vendor: req.user.id }, 'Product created');

    res.status(201).json({ success: true, message: 'Product created.', data: product });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/v1/products/:id
 * Vendor: update own product.
 */
async function updateProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Product not found.', 404);

    // Vendors can only update their own products; admins can update any
    if (req.user.role === 'vendor' && product.vendor.toString() !== req.user.id) {
      throw new AppError('You can only update your own products.', 403);
    }

    const allowedFields = ['title', 'description', 'price', 'compareAtPrice', 'category', 'images', 'stock', 'tags', 'isActive'];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    }

    await product.save();
    logger.info({ productId: product._id }, 'Product updated');

    res.json({ success: true, message: 'Product updated.', data: product });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/products/:id
 * Vendor: soft-delete own product.
 */
async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) throw new AppError('Product not found.', 404);

    if (req.user.role === 'vendor' && product.vendor.toString() !== req.user.id) {
      throw new AppError('You can only delete your own products.', 403);
    }

    product.isActive = false;
    await product.save();
    logger.info({ productId: product._id }, 'Product soft-deleted');

    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/products/:id/reviews
 * Customer: add a review to a product.
 */
async function addReview(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) throw new AppError('Product not found.', 404);

    const alreadyReviewed = product.reviews.some(
      (r) => r.user.toString() === req.user.id
    );
    if (alreadyReviewed) throw new AppError('You have already reviewed this product.', 400);

    product.reviews.push({
      user: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment || '',
    });
    product.recalculateRating();
    await product.save();

    res.status(201).json({ success: true, message: 'Review added.', data: product });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/products/vendor/my-products
 * Vendor: list own products.
 */
async function getVendorProducts(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ vendor: req.user.id }).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Product.countDocuments({ vendor: req.user.id }),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

async function seedData(req, res, next) {
  try {
    const count = await Product.countDocuments();
    if (count > 20) {
      return res.json({ success: false, message: 'Database already has data. Skipping seed.' });
    }

    const User = require('../models/User');
    let vendor = await User.findOne({ role: 'vendor' });
    if (!vendor) {
      vendor = await User.create({
        name: 'Aethel Official Vendor',
        email: 'vendor@aethel.com',
        password: 'password123',
        role: 'vendor',
        vendorProfile: { storeName: 'Aethel Mega Store', description: 'Official Aethel seed data' }
      });
    }

    const sampleProducts = [
      { title: "QuantumX Pro 15-inch Laptop", description: "Ultra-fast processor, 16GB RAM, 512GB SSD.", price: 89999, category: "electronics", images: ["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80"], stock: 45 },
      { title: "Aura 4K OLED Smart TV", description: "Immersive viewing experience with deep blacks.", price: 54999, category: "electronics", images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80"], stock: 20 },
      { title: "Noise-Cancelling Headphones", description: "Over-ear bluetooth headphones with ANC.", price: 12999, category: "electronics", images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"], stock: 120 },
      { title: "Smartwatch Series 8", description: "Track your heart rate, sleep, and workouts.", price: 18500, category: "electronics", images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80"], stock: 75 },
      { title: "Ergonomic Wireless Mouse", description: "Adjustable DPI settings.", price: 1999, category: "electronics", images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80"], stock: 200 },
      { title: "Mechanical Gaming Keyboard", description: "Customizable RGB lighting.", price: 4500, category: "electronics", images: ["https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80"], stock: 80 },
      { title: "Classic White T-Shirt", description: "100% pure premium cotton.", price: 799, category: "clothing", images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"], stock: 300 },
      { title: "Men's Slim Fit Denim Jeans", description: "Stretchable blue denim.", price: 1899, category: "clothing", images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80"], stock: 150 },
      { title: "Women's Floral Summer Dress", description: "Lightweight floral print.", price: 2199, category: "clothing", images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80"], stock: 85 },
      { title: "Athletic Running Shoes", description: "Lightweight mesh upper.", price: 3499, category: "clothing", images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"], stock: 110 },
      { title: "Ceramic Coffee Mug Set", description: "Set of 4 matte finish mugs.", price: 899, category: "home", images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80"], stock: 200 },
      { title: "Ergonomic Office Chair", description: "Breathable mesh back.", price: 8500, category: "home", images: ["https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=800&q=80"], stock: 45 },
      { title: "Minimalist Table Lamp", description: "Warm LED light, touch control.", price: 1599, category: "home", images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80"], stock: 90 },
      { title: "Remote Control Racing Car", description: "High-speed off-road RC car.", price: 2499, category: "toys", images: ["https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=800&q=80"], stock: 60 },
      { title: "Non-Slip Yoga Mat", description: "Eco-friendly TPE material.", price: 1199, category: "sports", images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80"], stock: 180 }
    ];

    const productsToInsert = sampleProducts.map(p => ({ ...p, vendor: vendor._id }));
    await Product.insertMany(productsToInsert);

    res.json({ success: true, message: `Seeded ${productsToInsert.length} products successfully!` });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getVendorProducts,
  seedData,
};
