const { Router } = require('express');
const { handleRazorpayWebhook } = require('../controllers/webhook.controller');
const { captureRawBody } = require('../middleware/webhookRaw');

const router = Router();

// Razorpay webhook — uses raw body middleware for signature verification
router.post('/razorpay', captureRawBody, handleRazorpayWebhook);

module.exports = router;
