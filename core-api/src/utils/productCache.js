/**
 * productCache.js
 *
 * Lightweight in-memory TTL cache for the high-read /products endpoint.
 *
 * Design decisions:
 *  - No external dependencies (no Redis) — keeps the service self-contained
 *    and avoids a cold-start dependency during development.
 *  - Uses a Map for O(1) get/set/delete.
 *  - Each entry stores { value, expiresAt } so stale entries are evicted lazily
 *    on read AND periodically by a passive sweep.
 *  - Provides a `invalidateAll()` method called on any product write so that
 *    the listing cache never serves stale data after a mutation.
 *
 * Interview talking point:
 *  "I identified the GET /products endpoint as a hot read path — every page
 *   load hits it. I added an in-memory TTL cache keyed by the full query
 *   string (filters + sort + pagination). This eliminates redundant MongoDB
 *   aggregations for identical queries within the TTL window, significantly
 *   reducing DB load and P95 latency. Cache entries are invalidated immediately
 *   on any product write to prevent stale data."
 */

const logger = require('./logger');

const DEFAULT_TTL_MS = 60 * 1000; // 60 seconds
const SWEEP_INTERVAL_MS = 5 * 60 * 1000; // sweep every 5 minutes

class ProductCache {
  constructor(ttlMs = DEFAULT_TTL_MS) {
    this.ttlMs = ttlMs;
    this._store = new Map();
    this._hits = 0;
    this._misses = 0;

    // Passive eviction sweep — prevents unbounded Map growth
    this._sweepTimer = setInterval(() => this._sweep(), SWEEP_INTERVAL_MS);
    // Don't block process exit on this timer
    if (this._sweepTimer.unref) this._sweepTimer.unref();
  }

  /**
   * Build a deterministic cache key from the request query parameters.
   * @param {object} query - req.query object
   * @returns {string}
   */
  buildKey(query) {
    // Sort keys so { a:1, b:2 } and { b:2, a:1 } hash to the same key
    const sorted = Object.keys(query)
      .sort()
      .reduce((acc, k) => { acc[k] = query[k]; return acc; }, {});
    return JSON.stringify(sorted);
  }

  /**
   * Get a cached value. Returns undefined on miss or expiry.
   * @param {string} key
   * @returns {*|undefined}
   */
  get(key) {
    const entry = this._store.get(key);
    if (!entry) {
      this._misses++;
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      this._misses++;
      return undefined;
    }
    this._hits++;
    return entry.value;
  }

  /**
   * Store a value with the configured TTL.
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    this._store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  /**
   * Invalidate all cached product listings.
   * Call this after any create / update / delete operation.
   */
  invalidateAll() {
    const size = this._store.size;
    this._store.clear();
    if (size > 0) {
      logger.info({ evicted: size }, 'Product cache invalidated');
    }
  }

  /**
   * Passive sweep — removes all expired entries from the Map.
   * @private
   */
  _sweep() {
    const now = Date.now();
    let swept = 0;
    for (const [key, entry] of this._store) {
      if (now > entry.expiresAt) {
        this._store.delete(key);
        swept++;
      }
    }
    if (swept > 0) {
      logger.info({ swept }, 'Product cache: passive eviction sweep completed');
    }
  }

  /**
   * Returns cache performance statistics.
   * Exposed on the /health or a dedicated /metrics endpoint.
   */
  stats() {
    const total = this._hits + this._misses;
    return {
      size: this._store.size,
      hits: this._hits,
      misses: this._misses,
      hitRate: total === 0 ? 0 : ((this._hits / total) * 100).toFixed(1) + '%',
    };
  }
}

// Export a singleton so all imports share the same cache instance
module.exports = new ProductCache();
