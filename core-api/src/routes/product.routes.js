const { Router } = require('express');
const { z } = require('zod');
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, addReview, getVendorProducts,
} = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');

const router = Router();

const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  price: z.number().positive(),
  compareAtPrice: z.number().min(0).optional(),
  category: z.enum(['electronics', 'clothing', 'home', 'books', 'sports', 'beauty', 'toys', 'food', 'other']),
  images: z.array(z.string().url()).max(10).optional(),
  stock: z.number().int().min(0).optional(),
  tags: z.array(z.string()).optional(),
});

// Public routes
// Public and specific routes
router.get('/', getProducts);
router.get('/vendor/my-products', authenticate, authorize('vendor', 'admin'), getVendorProducts);
router.get('/:id', getProduct);

// Authenticated routes
router.use(authenticate);

// Vendor routes
router.post('/', authorize('vendor', 'admin'), validateRequest(createProductSchema), createProduct);
router.put('/:id', authorize('vendor', 'admin'), updateProduct);
router.delete('/:id', authorize('vendor', 'admin'), deleteProduct);

// Customer reviews
router.post('/:id/reviews', authorize('customer'), addReview);

module.exports = router;
