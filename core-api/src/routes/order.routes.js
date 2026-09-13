const { Router } = require('express');
const { z } = require('zod');
const { checkout, verifyPayment, getMyOrders, getOrder, getVendorSales } = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');

const router = Router();

router.use(authenticate);

const checkoutSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(1).max(100),
    addressLine1: z.string().min(1).max(200),
    addressLine2: z.string().max(200).optional().default(''),
    city: z.string().min(1).max(100),
    state: z.string().min(1).max(100),
    postalCode: z.string().min(1).max(20),
    country: z.string().min(1).max(100),
    phone: z.string().min(1).max(20),
  }),
});

router.post('/checkout', validateRequest(checkoutSchema), checkout);
router.post('/verify-payment', verifyPayment);
router.get('/', getMyOrders);
router.get('/vendor/sales', authorize('vendor', 'admin'), getVendorSales);
router.get('/:id', getOrder);

module.exports = router;
