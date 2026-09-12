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

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, getVendorProducts };
