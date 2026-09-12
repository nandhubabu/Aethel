const { env } = require('../config/env');
const { AppError } = require('./errorHandler');

/**
 * Service-to-service authentication.
 * Validates X-Service-Secret header for internal calls from Core API.
 */
function serviceAuth(req, res, next) {
  const secret = req.headers['x-service-secret'];
  if (!secret || secret !== env.serviceSecret) {
    return next(new AppError('Unauthorized service request.', 403));
  }
  next();
}

module.exports = { serviceAuth };
