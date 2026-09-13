const http = require('http');
const https = require('https');
const { env } = require('../config/env');
const logger = require('./logger');

const PAYMENT_BASE = env.paymentServiceUrl;
const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 2000;

/**
 * Lightweight HTTP client for internal service-to-service communication.
 * Uses native Node.js http module — no external dependencies needed.
 * Includes retry with exponential backoff and circuit breaker pattern.
 */

let circuitOpen = false;
let circuitOpenedAt = 0;
const CIRCUIT_RESET_MS = 30000; // 30 seconds
let consecutiveFailures = 0;
const FAILURE_THRESHOLD = 10;

function checkCircuit() {
  if (!circuitOpen) return true;
  if (Date.now() - circuitOpenedAt > CIRCUIT_RESET_MS) {
    circuitOpen = false;
    consecutiveFailures = 0;
    logger.info('Payment service circuit breaker: CLOSED (reset)');
    return true;
  }
  return false;
}

function recordSuccess() {
  consecutiveFailures = 0;
  if (circuitOpen) {
    circuitOpen = false;
    logger.info('Payment service circuit breaker: CLOSED (success)');
  }
}

function recordFailure() {
  consecutiveFailures++;
  if (consecutiveFailures >= FAILURE_THRESHOLD && !circuitOpen) {
    circuitOpen = true;
    circuitOpenedAt = Date.now();
    logger.error('Payment service circuit breaker: OPEN');
  }
}

function makeRequest(method, path, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, PAYMENT_BASE);
    const isHttps = url.protocol === 'https:';
    const transport = isHttps ? https : http;

    const body = data ? JSON.stringify(data) : null;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Secret': env.serviceSecret,
        ...headers,
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
      },
      timeout: 10000,
    };

    const req = transport.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: parsed });
          } else {
            const error = new Error(parsed.message || `Payment service returned ${res.statusCode}`);
            error.status = res.statusCode;
            error.data = parsed;
            reject(error);
          }
        } catch (parseErr) {
          reject(new Error(`Failed to parse payment service response: ${rawData.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Payment service request timed out'));
    });

    if (body) req.write(body);
    req.end();
  });
}

/**
 * Make a request to the Payment API with retries and circuit breaker.
 * @param {string} method - HTTP method
 * @param {string} path - URL path (e.g. '/api/v1/payments/create-intent')
 * @param {object} data - Request body
 * @param {object} headers - Additional headers
 * @returns {Promise<{status: number, data: object}>}
 */
async function paymentRequest(method, path, data = null, headers = {}) {
  if (!checkCircuit()) {
    throw new Error('Payment service circuit breaker is OPEN. Try again later.');
  }

  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const result = await makeRequest(method, path, data, headers);
      recordSuccess();
      return result;
    } catch (err) {
      lastError = err;
      // Don't retry client errors (4xx)
      if (err.status && err.status >= 400 && err.status < 500) {
        throw err;
      }
      if (attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        logger.warn({ attempt: attempt + 1, delay, error: err.message }, 'Payment request retry');
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  recordFailure();
  logger.error({ error: lastError.message }, 'Payment request failed after all retries');
  throw lastError;
}

module.exports = { paymentRequest };
