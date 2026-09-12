const crypto = require('crypto');

/**
 * Generate a deterministic idempotency key from user ID and cart contents.
 * This ensures the same cart checkout produces the same key, preventing
 * duplicate orders if the user double-clicks or the request is retried.
 */
function generateIdempotencyKey(userId, items) {
  const payload = JSON.stringify({
    user: userId.toString(),
    items: items.map((i) => ({
      product: i.product.toString(),
      quantity: i.quantity,
      price: i.price || i.priceAtAdd,
    })).sort((a, b) => a.product.localeCompare(b.product)),
  });
  return crypto.createHash('sha256').update(payload).digest('hex');
}

module.exports = { generateIdempotencyKey };
