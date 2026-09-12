const http = require('http');
const https = require('https');
const { env } = require('../config/env');
const logger = require('./logger');

const CORE_BASE = env.coreServiceUrl;
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 500;

function makeRequest(method, path, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, CORE_BASE);
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
            const error = new Error(parsed.message || `Core API returned ${res.statusCode}`);
            error.status = res.statusCode;
            error.data = parsed;
            reject(error);
          }
        } catch (parseErr) {
          reject(new Error(`Failed to parse Core API response: ${rawData.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Core API request timed out'));
    });

    if (body) req.write(body);
    req.end();
  });
}

/**
 * Make a request to the Core API with retries.
 */
async function coreApiRequest(method, path, data = null, headers = {}) {
  let lastError;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await makeRequest(method, path, data, headers);
    } catch (err) {
      lastError = err;
      if (err.status && err.status >= 400 && err.status < 500) throw err;
      if (attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        logger.warn({ attempt: attempt + 1, delay, error: err.message }, 'Core API request retry');
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }
  logger.error({ error: lastError.message }, 'Core API request failed after all retries');
  throw lastError;
}

module.exports = { coreApiRequest };
