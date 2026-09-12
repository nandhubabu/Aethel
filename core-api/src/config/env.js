const requiredVars = ['MONGO_URI', 'JWT_SECRET', 'SERVICE_SECRET', 'PAYMENT_SERVICE_URL'];

function validateEnv() {
  const missing = requiredVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

const env = {
  get nodeEnv() { return process.env.NODE_ENV || 'development'; },
  get port() { return parseInt(process.env.PORT, 10) || 5000; },
  get mongoUri() { return process.env.MONGO_URI; },
  get jwtSecret() { return process.env.JWT_SECRET; },
  get jwtExpiresIn() { return process.env.JWT_EXPIRES_IN || '7d'; },
  get serviceSecret() { return process.env.SERVICE_SECRET; },
  get paymentServiceUrl() { return process.env.PAYMENT_SERVICE_URL; },
  get isProduction() { return this.nodeEnv === 'production'; },
  get isTest() { return this.nodeEnv === 'test'; },
};

module.exports = { validateEnv, env };
