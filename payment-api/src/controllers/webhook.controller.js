const crypto = require('crypto');
const { env } = require('../config/env');
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const { coreApiRequest } = require('../utils/coreApiClient');
const logger = require('../utils/logger');

/**
 * POST /api/v1/payments/webhooks/razorpay
 * Razorpay webhook endpoint.
 * Verifies signature and processes payment events.
 */
async function handleRazorpayWebhook(req, res) {
  const signature = req.headers['x-razorpay-signature'];

  if (!signature) {
    logger.warn('Webhook received without x-razorpay-signature header');
    return res.status(400).json({ success: false, message: 'Missing x-razorpay-signature header.' });
  }

  // Verify webhook signature
  const webhookSecret = env.razorpayWebhookSecret;
  if (webhookSecret) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      logger.error('Webhook signature verification failed');
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }
  }

  const event = req.body;
  logger.info({ eventType: event.event, eventId: event.payload?.payment?.entity?.id }, 'Webhook event received');

  try {
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      case 'refund.processed':
        await handleRefundProcessed(event.payload.refund.entity);
        break;

      default:
        logger.info({ eventType: event.event }, 'Unhandled webhook event type');
    }
  } catch (err) {
    logger.error({ err, eventType: event.event }, 'Error processing webhook event');
  }

  // Always return 200 to Razorpay
  res.json({ status: 'ok' });
}

/**
 * Handle successful payment capture.
 */
async function handlePaymentCaptured(payment) {
  const razorpayOrderId = payment.order_id;
  const razorpayPaymentId = payment.id;

  logger.info({ razorpayOrderId, razorpayPaymentId }, 'Processing payment.captured');

  const transaction = await Transaction.findOne({ razorpayOrderId });
  if (!transaction) {
    logger.error({ razorpayOrderId }, 'Transaction not found for captured payment');
    return;
  }

  // Idempotency check
  if (transaction.webhookProcessed && transaction.status === 'succeeded') {
    logger.info({ razorpayOrderId }, 'Webhook already processed (idempotent skip)');
    return;
  }

  transaction.status = 'succeeded';
  transaction.razorpayPaymentId = razorpayPaymentId;
  transaction.webhookProcessed = true;
  transaction.razorpayResponse = {
    ...transaction.razorpayResponse,
    status: 'captured',
    payment_id: razorpayPaymentId,
    amount: payment.amount,
    method: payment.method,
  };
  await transaction.save();

  // Find the order and notify Core API
  const order = await Order.findOne({ paymentIntentId: razorpayOrderId });
  if (order) {
    try {
      await coreApiRequest('POST', `/internal/orders/${order._id}/update-status`, {
        paymentStatus: 'paid',
        paymentIntentId: razorpayOrderId,
      });
      logger.info({ orderId: order._id, razorpayOrderId }, 'Core API notified of payment success');
    } catch (err) {
      logger.error({ err: err.message, orderId: order._id }, 'Failed to notify Core API of payment success');
    }
  }
}

/**
 * Handle failed payment.
 */
async function handlePaymentFailed(payment) {
  const razorpayOrderId = payment.order_id;

  logger.info({ razorpayOrderId }, 'Processing payment.failed');

  const transaction = await Transaction.findOne({ razorpayOrderId });
  if (!transaction) {
    logger.error({ razorpayOrderId }, 'Transaction not found for failed payment');
    return;
  }

  if (transaction.webhookProcessed && transaction.status === 'failed') {
    return;
  }

  transaction.status = 'failed';
  transaction.webhookProcessed = true;
  transaction.razorpayResponse = {
    ...transaction.razorpayResponse,
    status: 'failed',
    error_code: payment.error_code,
    error_description: payment.error_description,
  };
  await transaction.save();

  const order = await Order.findOne({ paymentIntentId: razorpayOrderId });
  if (order) {
    try {
      await coreApiRequest('POST', `/internal/orders/${order._id}/update-status`, {
        paymentStatus: 'failed',
        paymentIntentId: razorpayOrderId,
      });
    } catch (err) {
      logger.error({ err: err.message, orderId: order._id }, 'Failed to notify Core API of payment failure');
    }
  }
}

/**
 * Handle refund.
 */
async function handleRefundProcessed(refund) {
  const razorpayPaymentId = refund.payment_id;
  if (!razorpayPaymentId) return;

  logger.info({ razorpayPaymentId }, 'Processing refund.processed');

  const transaction = await Transaction.findOne({ razorpayPaymentId });
  if (transaction) {
    transaction.status = 'refunded';
    transaction.webhookProcessed = true;
    await transaction.save();
  }
}

module.exports = { handleRazorpayWebhook };
