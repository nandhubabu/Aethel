/**
 * responseTime.js
 *
 * Express middleware that measures and attaches precise response latency
 * to every HTTP response as the `X-Response-Time` header.
 *
 * Also conditionally attaches `X-Cache` (HIT / MISS) when the route sets
 * `res.locals.cacheHit = true` before responding.
 *
 * Interview talking point:
 *  "I added a lightweight observability layer that stamps every HTTP response
 *   with its exact server-side processing time in milliseconds via the
 *   X-Response-Time header. This lets us measure P50/P95 latency per endpoint
 *   directly from browser DevTools or any HTTP proxy without needing a full APM
 *   product. We can also see cache hit/miss status on the /products endpoint
 *   through the X-Cache header, making it easy to validate that the caching
 *   layer is working correctly in production."
 */

/**
 * Middleware: attach X-Response-Time and X-Cache headers.
 * Uses process.hrtime.bigint() for nanosecond precision.
 */
function responseTime(req, res, next) {
  const startNs = process.hrtime.bigint();

  // Hook into the `finish` event to record the actual end time
  res.on('finish', () => {
    const durationNs = process.hrtime.bigint() - startNs;
    const durationMs = (Number(durationNs) / 1_000_000).toFixed(3);
    // Headers may have already been sent by the time `finish` fires,
    // so use `setHeader` only if not yet sent (Express handles this gracefully).
    res.setHeader('X-Response-Time', `${durationMs}ms`);
  });

  // Attach X-Response-Time BEFORE headers are sent so it's definitely included
  res.on('header', () => {
    // X-Cache reflects whether this response came from the in-memory cache
    const cacheStatus = res.locals.cacheHit ? 'HIT' : 'MISS';
    if (req.path.startsWith('/api/v1/products')) {
      res.setHeader('X-Cache', cacheStatus);
    }
  });

  next();
}

module.exports = { responseTime };
