/**
 * Middleware that captures the raw body for Stripe webhook signature verification.
 * Stripe requires the raw (unparsed) body to verify the webhook signature.
 * This must be applied BEFORE express.json() for the webhook route.
 */
function captureRawBody(req, res, next) {
  let rawBody = '';

  req.setEncoding('utf8');

  req.on('data', (chunk) => {
    rawBody += chunk;
  });

  req.on('end', () => {
    req.rawBody = rawBody;
    try {
      req.body = JSON.parse(rawBody);
    } catch {
      req.body = {};
    }
    next();
  });
}

module.exports = { captureRawBody };
