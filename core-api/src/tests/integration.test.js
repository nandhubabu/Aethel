/**
 * Integration test runner.
 * Runs against live Core API and Payment API containers.
 * Used by docker-compose.test.yml test-runner service.
 */
const http = require('http');

const CORE_API = process.env.CORE_API_URL || 'http://core-api:5000';
const PAYMENT_API = process.env.PAYMENT_API_URL || 'http://payment-api:5001';

let passed = 0;
let failed = 0;

function request(baseUrl, method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const data = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
      timeout: 10000,
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch {
          resolve({ status: res.statusCode, data: raw });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    if (data) req.write(data);
    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForService(url, name, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await request(url, 'GET', '/health');
      if (res.status === 200) {
        console.log(`  ✓ ${name} is ready`);
        return;
      }
    } catch {
      // Service not ready yet
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`${name} did not become ready in time`);
}

async function run() {
  console.log('\n🧪 Aethel Integration Tests\n');
  console.log('── Waiting for services ──');

  await waitForService(CORE_API, 'Core API');
  await waitForService(PAYMENT_API, 'Payment API');

  console.log('\n── Core API Tests ──');

  await test('Health check returns 200', async () => {
    const res = await request(CORE_API, 'GET', '/health');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.service === 'core-api', 'Wrong service name');
  });

  await test('404 for unknown route', async () => {
    const res = await request(CORE_API, 'GET', '/api/v1/nonexistent');
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  });

  let authToken;

  await test('Register a new user', async () => {
    const res = await request(CORE_API, 'POST', '/api/v1/auth/register', {
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123',
    });
    assert(res.status === 201, `Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    assert(res.data.data.token, 'No token returned');
    authToken = res.data.data.token;
  });

  await test('Get profile with token', async () => {
    const res = await request(CORE_API, 'GET', '/api/v1/auth/me', null, {
      Authorization: `Bearer ${authToken}`,
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.data.email, 'No email in profile');
  });

  await test('Reject request without token', async () => {
    const res = await request(CORE_API, 'GET', '/api/v1/auth/me');
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await test('Get products (empty list ok)', async () => {
    const res = await request(CORE_API, 'GET', '/api/v1/products');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data.data), 'Expected array');
  });

  await test('Get cart (creates empty)', async () => {
    const res = await request(CORE_API, 'GET', '/api/v1/cart', null, {
      Authorization: `Bearer ${authToken}`,
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  console.log('\n── Payment API Tests ──');

  await test('Payment API health check', async () => {
    const res = await request(PAYMENT_API, 'GET', '/health');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.service === 'payment-api', 'Wrong service name');
  });

  await test('Payment endpoint rejects unauthenticated', async () => {
    const res = await request(PAYMENT_API, 'POST', '/api/v1/payments/create-intent', {
      amount: 1000,
    });
    assert(res.status === 403, `Expected 403, got ${res.status}`);
  });

  // ── Summary ────────────────────────────────────────────
  console.log(`\n── Results: ${passed} passed, ${failed} failed ──\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});
