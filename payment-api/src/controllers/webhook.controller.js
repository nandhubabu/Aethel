const stripe = require('../config/stripe');
const { env } = require('../config/env');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const { coreApiRequest } = require('../utils/coreApiClient');
const logger = require('../utils/logger');

/**
 * POST /api/v1/payments/webhooks/stripe
 * Stripe webhook endpoint.
 * Verifies signature, processes payment events, and syncs state with Core API.
 */
async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    logger.warn('Webhook received without stripe-signature header');
    return res.status(400).json({ success: false, message: 'Missing stripe-signature header.' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, env.stripeWebhookSecret);
  } catch (err) {
    logger.error({ error: err.message }, 'Webhook signature verification failed');
    return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
  }

  logger.info({ eventType: event.type, eventId: event.id }, 'Webhook event received');

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;

      case 'charge.refunded':
        await handleRefund(event.data.object);
        break;

      default:
        logger.info({ eventType: event.type }, 'Unhandled webhook event type');
    }
  } catch (err) {
    // Log but still return 200 to prevent Stripe from retrying indefinitely
    logger.error({ err, eventType: event.type, eventId: event.id }, 'Error processing webhook event');
  }

  // Always acknowledge receipt to Stripe
  res.json({ received: true });
}

/**
 * Handle successful payment.
 * Updates transaction, finds the order, and notifies Core API to update inventory.
 */
async function handlePaymentSuccess(paymentIntent) {
  const { id: paymentIntentId, metadata } = paymentIntent;

  logger.info({ paymentIntentId }, 'Processing payment_intent.succeeded');

  // Find and update transaction
  const transaction = await Transaction.findOne({ paymentIntentId });
  if (!transaction) {
    logger.error({ paymentIntentId }, 'Transaction not found for succeeded payment');
    return;
  }

  // Idempotency check: skip if already processed
  if (transaction.webhookProcessed && transaction.status === 'succeeded') {
    logger.info({ paymentIntentId }, 'Webhook already processed (idempotent skip)');
    return;
  }

  transaction.status = 'succeeded';
  transaction.webhookProcessed = true;
  transaction.stripeResponse = {
    ...transaction.stripeResponse,
    status: 'succeeded',
    amount_received: paymentIntent.amount_received,
  };
  await transaction.save();

  // Find the order by paymentIntentId
  const order = await Order.findOne({ paymentIntentId });
  if (!order) {
    logger.error({ paymentIntentId }, 'Order not found for succeeded payment');
    return;
  }

  // Notify Core API to update order status and decrement inventory
  try {
    await coreApiRequest('POST', `/internal/orders/${order._id}/update-status`, {
      paymentStatus: 'paid',
      paymentIntentId,
    });
    logger.info({ orderId: order._id, paymentIntentId }, 'Core API notified of payment success');
  } catch (err) {
    logger.error(
      { err: err.message, orderId: order._id, paymentIntentId },
      'Failed to notify Core API of payment success — will need manual reconciliation'
    );
  }
}

/**
 * Handle failed payment.
 */
async function handlePaymentFailure(paymentIntent) {
  const { id: paymentIntentId } = paymentIntent;

  logger.info({ paymentIntentId }, 'Processing payment_intent.payment_failed');

  const transaction = await Transaction.findOne({ paymentIntentId });
  if (!transaction) {
    logger.error({ paymentIntentId }, 'Transaction not found for failed payment');
    return;
  }

  if (transaction.webhookProcessed && transaction.status === 'failed') {
    logger.info({ paymentIntentId }, 'Failure webhook already processed (idempotent skip)');
    return;
  }

  transaction.status = 'failed';
  transaction.webhookProcessed = true;
  transaction.stripeResponse = {
    ...transaction.stripeResponse,
    status: 'failed',
    last_payment_error: paymentIntent.last_payment_error?.message || 'Unknown error',
  };
  await transaction.save();

  // Find order and notify Core API
  const order = await Order.findOne({ paymentIntentId });
  if (order) {
    try {
      await coreApiRequest('POST', `/internal/orders/${order._id}/update-status`, {
        paymentStatus: 'failed',
        paymentIntentId,
      });
      logger.info({ orderId: order._id }, 'Core API notified of payment failure');
    } catch (err) {
      logger.error({ err: err.message, orderId: order._id }, 'Failed to notify Core API of payment failure');
    }
  }
}

/**
 * Handle refund.
 */
async function handleRefund(charge) {
  const paymentIntentId = charge.payment_intent;
  if (!paymentIntentId) return;

  logger.info({ paymentIntentId }, 'Processing charge.refunded');

  const transaction = await Transaction.findOne({ paymentIntentId });
  if (transaction) {
    transaction.status = 'refunded';
    transaction.webhookProcessed = true;
    await transaction.save();
  }

  const order = await Order.findOne({ paymentIntentId });
  if (order) {
    try {
      await coreApiRequest('POST', `/internal/orders/${order._id}/update-status`, {
        paymentStatus: 'refunded',
        paymentIntentId,
      });
      logger.info({ orderId: order._id }, 'Core API notified of refund');
    } catch (err) {
      logger.error({ err: err.message, orderId: order._id }, 'Failed to notify Core API of refund');
    }
  }
}

module.exports = { handleStripeWebhook };
