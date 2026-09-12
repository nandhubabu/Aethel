const { Router } = require('express');
const { handleStripeWebhook } = require('../controllers/webhook.controller');
const { captureRawBody } = require('../middleware/webhookRaw');

const router = Router();

// Stripe webhook — uses raw body middleware (NOT express.json)
// This route must NOT go through express.json() or the signature will fail.
router.post('/stripe', captureRawBody, handleStripeWebhook);

module.exports = router;
