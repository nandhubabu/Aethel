/**
 * responseTime.js
 *
 * Express middleware that measures and attaches precise response latency
 * to every HTTP response as the `X-Response-Time` header.
 *
 * Also conditionally attaches `X-Cache` (HIT / MISS) when the route sets
 * `res.locals.cacheHit` before sending the response.
 *
 * Technical notes:
 *  - Uses process.hrtime.bigint() for nanosecond-precision timing.
 *  - Monkey-patches res.writeHead() to inject headers just before they
 *    are flushed to the socket. This is the only reliable way to attach
 *    custom headers to an Express response — `res.on('finish')` is too
 *    late (headers already sent), and there is no public `'header'` event
 *    on Express's response object.
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
  const originalWriteHead = res.writeHead;

  res.writeHead = function patchedWriteHead(...args) {
    if (!res.headersSent) {
      const durationNs = process.hrtime.bigint() - startNs;
      const durationMs = (Number(durationNs) / 1_000_000).toFixed(3);
      try {
        res.setHeader('X-Response-Time', `${durationMs}ms`);

        const requestPath = req.originalUrl || req.path || '';
        if (requestPath.includes('/api/v1/products')) {
          res.setHeader('X-Cache', res.locals && res.locals.cacheHit ? 'HIT' : 'MISS');
        }
      } catch (_) {}
    }

    return originalWriteHead.apply(this, args);
  };

  next();
}

module.exports = { responseTime };
