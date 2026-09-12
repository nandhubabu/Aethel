const stripe = require('../config/stripe');
const Transaction = require('../models/Transaction');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * POST /api/v1/payments/create-intent
 * Called internally by Core API (service-to-service).
 * Creates a Stripe PaymentIntent and stores a Transaction record.
 */
async function createPaymentIntent(req, res, next) {
  try {
    const { amount, currency = 'usd', userId, userEmail, idempotencyKey } = req.body;

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
          message: 'Payment intent already exists (idempotent).',
          data: {
            clientSecret: existing.stripeResponse.client_secret || '',
            paymentIntentId: existing.paymentIntentId,
            transactionId: existing._id,
          },
        });
      }
    }

    // Convert dollars to cents for Stripe
    const amountInCents = Math.round(amount * 100);

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: amountInCents,
        currency: currency.toLowerCase(),
        metadata: {
          userId,
          userEmail: userEmail || '',
          idempotencyKey: idempotencyKey || '',
        },
        automatic_payment_methods: {
          enabled: true,
        },
      },
      {
        idempotencyKey: idempotencyKey ? `pi_${idempotencyKey}` : undefined,
      }
    );

    // Store transaction in ledger
    const transaction = await Transaction.create({
      userId,
      userEmail: userEmail || '',
      paymentIntentId: paymentIntent.id,
      amount,
      currency,
      status: 'pending',
      idempotencyKey: idempotencyKey || undefined,
      stripeResponse: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        status: paymentIntent.status,
      },
    });

    logger.info(
      { transactionId: transaction._id, paymentIntentId: paymentIntent.id, amount },
      'Payment intent created'
    );

    res.status(201).json({
      success: true,
      message: 'Payment intent created.',
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        transactionId: transaction._id,
      },
    });
  } catch (err) {
    // Handle Stripe-specific errors
    if (err.type && err.type.startsWith('Stripe')) {
      logger.error({ stripeError: err.message, code: err.code }, 'Stripe error');
      return next(new AppError(`Payment error: ${err.message}`, 402));
    }
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
        paymentIntentId: transaction.paymentIntentId,
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
    const { paymentIntentId, reason = 'requested_by_customer' } = req.body;

    if (!paymentIntentId) {
      throw new AppError('paymentIntentId is required.', 400);
    }

    const transaction = await Transaction.findOne({ paymentIntentId });
    if (!transaction) {
      throw new AppError('Transaction not found.', 404);
    }
    if (transaction.status !== 'succeeded') {
      throw new AppError('Can only refund succeeded payments.', 400);
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason,
    });

    transaction.status = 'refunded';
    transaction.stripeResponse.refundId = refund.id;
    transaction.stripeResponse.refundStatus = refund.status;
    await transaction.save();

    logger.info({ paymentIntentId, refundId: refund.id }, 'Refund processed');

    res.json({
      success: true,
      message: 'Refund initiated.',
      data: {
        refundId: refund.id,
        status: refund.status,
      },
    });
  } catch (err) {
    if (err.type && err.type.startsWith('Stripe')) {
      return next(new AppError(`Refund error: ${err.message}`, 402));
    }
    next(err);
  }
}

module.exports = { createPaymentIntent, getTransaction, refundPayment };
