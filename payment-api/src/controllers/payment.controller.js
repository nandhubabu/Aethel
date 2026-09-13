const razorpay = require('../config/stripe'); // file still named stripe.js for now
const Transaction = require('../models/Transaction');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { env } = require('../config/env');

/**
 * POST /api/v1/payments/create-order
 * Called internally by Core API (service-to-service).
 * Creates a Razorpay Order and stores a Transaction record.
 */
async function createPaymentOrder(req, res, next) {
  try {
    const { amount, currency = 'INR', userId, userEmail, idempotencyKey } = req.body;

    if (!amount || amount <= 0) {
      throw new AppError('Invalid payment amount.', 400);
    }
    if (!userId) {
      throw new AppError('userId is required.', 400);
    }

    // Check if a transaction with this idempotency key already exists
    if (idempotencyKey) {
      const existing = await Transaction.findOne({ idempotencyKey });
      if (existing) {
        logger.info({ idempotencyKey, transactionId: existing._id }, 'Returning existing transaction (idempotent)');
        return res.json({
          success: true,
          message: 'Payment order already exists (idempotent).',
          data: {
            razorpayOrderId: existing.razorpayOrderId,
            razorpayKeyId: env.razorpayKeyId,
            amount: existing.amount,
            currency: existing.currency,
            transactionId: existing._id,
          },
        });
      }
    }

    // Convert to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: idempotencyKey ? `rcpt_${idempotencyKey.substring(0, 30)}` : `rcpt_${Date.now()}`,
      notes: {
        userId,
        userEmail: userEmail || '',
        idempotencyKey: idempotencyKey || '',
      },
    });

    // Store transaction in ledger
    const transaction = await Transaction.create({
      userId,
      userEmail: userEmail || '',
      razorpayOrderId: razorpayOrder.id,
      amount,
      currency: currency.toUpperCase(),
      status: 'pending',
      idempotencyKey: idempotencyKey || undefined,
      razorpayResponse: {
        id: razorpayOrder.id,
        status: razorpayOrder.status,
        amount: razorpayOrder.amount,
      },
    });

    logger.info(
      { transactionId: transaction._id, razorpayOrderId: razorpayOrder.id, amount },
      'Razorpay order created'
    );

    res.status(201).json({
      success: true,
      message: 'Razorpay order created.',
      data: {
        razorpayOrderId: razorpayOrder.id,
        razorpayKeyId: env.razorpayKeyId,
        amount: amountInPaise,
        currency: currency.toUpperCase(),
        transactionId: transaction._id,
      },
    });
  } catch (err) {
    if (err.statusCode && err.error) {
      logger.error({ razorpayError: err.error }, 'Razorpay error');
      return next(new AppError(`Payment error: ${err.error.description || err.error}`, 402));
    }
    next(err);
  }
}

/**
 * POST /api/v1/payments/verify
 * Called by Core API after frontend completes payment.
 * Verifies the Razorpay payment signature.
 */
async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new AppError('Missing payment verification parameters.', 400);
    }

    const crypto = require('crypto');
    const { env } = require('../config/env');

    // Verify signature: HMAC SHA256 of order_id + "|" + payment_id
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', env.razorpayKeySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      logger.warn({ razorpay_order_id, razorpay_payment_id }, 'Invalid Razorpay signature');
      throw new AppError('Payment verification failed — invalid signature.', 400);
    }

    // Update transaction
    const transaction = await Transaction.findOne({ razorpayOrderId: razorpay_order_id });
    if (!transaction) {
      throw new AppError('Transaction not found.', 404);
    }

    transaction.status = 'succeeded';
    transaction.razorpayPaymentId = razorpay_payment_id;
    transaction.razorpaySignature = razorpay_signature;
    transaction.webhookProcessed = true;
    transaction.razorpayResponse = {
      ...transaction.razorpayResponse,
      payment_id: razorpay_payment_id,
      status: 'captured',
    };
    await transaction.save();

    logger.info({ razorpay_order_id, razorpay_payment_id }, 'Payment verified successfully');

    res.json({
      success: true,
      message: 'Payment verified successfully.',
      data: {
        transactionId: transaction._id,
        status: 'succeeded',
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/payments/transaction/:id
 * Get transaction status (authenticated user or service).
 */
async function getTransaction(req, res, next) {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      throw new AppError('Transaction not found.', 404);
    }

    res.json({
      success: true,
      data: {
        id: transaction._id,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        razorpayOrderId: transaction.razorpayOrderId,
        createdAt: transaction.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/payments/refund
 * Initiate a refund for a payment (service-to-service or admin).
 */
async function refundPayment(req, res, next) {
  try {
    const { razorpayPaymentId, reason = 'requested_by_customer' } = req.body;

    if (!razorpayPaymentId) {
      throw new AppError('razorpayPaymentId is required.', 400);
    }

    const transaction = await Transaction.findOne({ razorpayPaymentId });
    if (!transaction) {
      throw new AppError('Transaction not found.', 404);
    }
    if (transaction.status !== 'succeeded') {
      throw new AppError('Can only refund succeeded payments.', 400);
    }

    const amountInPaise = Math.round(transaction.amount * 100);

    const refund = await razorpay.payments.refund(razorpayPaymentId, {
      amount: amountInPaise,
      notes: { reason },
    });

    transaction.status = 'refunded';
    transaction.razorpayResponse.refundId = refund.id;
    transaction.razorpayResponse.refundStatus = refund.status;
    await transaction.save();

    logger.info({ razorpayPaymentId, refundId: refund.id }, 'Refund processed');

    res.json({
      success: true,
      message: 'Refund initiated.',
      data: {
        refundId: refund.id,
        status: refund.status,
      },
    });
  } catch (err) {
    if (err.statusCode && err.error) {
      return next(new AppError(`Refund error: ${err.error.description || err.error}`, 402));
    }
    next(err);
  }
}

module.exports = { createPaymentOrder, verifyPayment, getTransaction, refundPayment };
