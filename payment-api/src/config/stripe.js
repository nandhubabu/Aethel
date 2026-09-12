const Stripe = require('stripe');
const { env } = require('./env');
const logger = require('../utils/logger');

const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: '2024-06-20',
  maxNetworkRetries: 2,
  timeout: 10000,
});

logger.info('Stripe SDK initialized');

module.exports = stripe;
