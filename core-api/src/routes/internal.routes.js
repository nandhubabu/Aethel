const { Router } = require('express');
const { updateOrderStatus } = require('../controllers/order.controller');
const { env } = require('../config/env');
const { AppError } = require('../middleware/errorHandler');

const router = Router();

/**
 * Service-to-service authentication middleware.
 * Validates X-Service-Secret header for internal API calls.
 */
function serviceAuth(req, res, next) {
  const secret = req.headers['x-service-secret'];
  if (!secret || secret !== env.serviceSecret) {
    return next(new AppError('Unauthorized service request.', 403));
  }
  next();
}

// All internal routes require service secret
router.use(serviceAuth);

router.post('/orders/:id/update-status', updateOrderStatus);

module.exports = router;
