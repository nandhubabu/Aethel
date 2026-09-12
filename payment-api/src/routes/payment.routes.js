const { Router } = require('express');
const { createPaymentIntent, getTransaction, refundPayment } = require('../controllers/payment.controller');
const { serviceAuth } = require('../middleware/serviceAuth');

const router = Router();

// All payment routes require service-to-service authentication
// (called by Core API, not directly by the browser)
router.post('/create-intent', serviceAuth, createPaymentIntent);
router.get('/transaction/:id', serviceAuth, getTransaction);
router.post('/refund', serviceAuth, refundPayment);

module.exports = router;
