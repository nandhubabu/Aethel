const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');
const { paymentRequest } = require('../utils/paymentClient');
const { generateIdempotencyKey } = require('../utils/idempotency');
const logger = require('../utils/logger');

/**
 * POST /api/v1/orders/checkout
 * Initiate checkout: validate cart, calculate total, call Payment API, create order.
 */
async function checkout(req, res, next) {
  try {
    const { shippingAddress } = req.validatedBody;

    // 1. Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty.', 400);
    }

    // 2. Validate stock and build order items with live prices
    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.product;
      if (!product || !product.isActive) {
        throw new AppError(`Product "${item.product?.title || 'Unknown'}" is no longer available.`, 400);
      }
      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for "${product.title}". Available: ${product.stock}.`, 400);
      }

      const lineTotal = product.price * item.quantity;
      totalAmount += lineTotal;

      orderItems.push({
        product: product._id,
        title: product.title,
        quantity: item.quantity,
        price: product.price,
        vendor: product.vendor,
      });
    }

    // Round to 2 decimals
    totalAmount = Math.round(totalAmount * 100) / 100;

    // 3. Generate idempotency key
    const idempotencyKey = generateIdempotencyKey(req.user.id, orderItems);

    // 4. Check for existing order with same idempotency key
    const existingOrder = await Order.findOne({ idempotencyKey });
    if (existingOrder) {
      if (existingOrder.paymentStatus === 'paid') {
        throw new AppError('This order has already been paid.', 409);
      }
      // Return existing unpaid order's Razorpay order ID
      if (existingOrder.paymentIntentId) {
        return res.json({
          success: true,
          message: 'Order already exists. Complete payment.',
          data: {
            orderId: existingOrder._id,
            razorpayOrderId: existingOrder.paymentIntentId,
            totalAmount: existingOrder.totalAmount,
          },
        });
      }
    }

    // 5. Call Payment API to create Razorpay order
    const paymentResponse = await paymentRequest('POST', '/api/v1/payments/create-order', {
      amount: totalAmount,
      currency: 'INR',
      userId: req.user.id,
      userEmail: req.user.email,
      idempotencyKey,
    });

    const { razorpayOrderId, transactionId } = paymentResponse.data.data;

    // 6. Create order (paymentIntentId field stores razorpayOrderId)
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentIntentId: razorpayOrderId,
      paymentStatus: 'processing',
      idempotencyKey,
    });

    logger.info({ orderId: order._id, totalAmount, razorpayOrderId }, 'Checkout initiated');

    res.status(201).json({
      success: true,
      message: 'Checkout initiated. Complete payment on the client.',
      data: {
        orderId: order._id,
        razorpayOrderId,
        transactionId,
        totalAmount,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/orders/verify-payment
 * Frontend calls this after Razorpay checkout completes to verify and finalize.
 */
async function verifyPayment(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new AppError('Missing payment verification parameters.', 400);
    }

    // Forward verification to Payment API
    const verifyResponse = await paymentRequest('POST', '/api/v1/payments/verify', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (verifyResponse.data.success) {
      // Update order status
      const order = await Order.findOne({ paymentIntentId: razorpay_order_id });
      if (order) {
        order.paymentStatus = 'paid';
        order.orderStatus = 'confirmed';
        await order.save();

        // Decrement stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity },
          });
        }

        // Clear cart
        await Cart.findOneAndUpdate({ user: req.user.id }, { $set: { items: [] } });

        logger.info({ orderId: order._id }, 'Payment verified, order confirmed, inventory decremented');
      }

      return res.json({
        success: true,
        message: 'Payment verified and order confirmed.',
        data: { orderId: order?._id || orderId },
      });
    }

    throw new AppError('Payment verification failed.', 400);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/orders
 * Get authenticated user's orders.
 */
async function getMyOrders(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };
    if (req.query.status) filter.paymentStatus = req.query.status;

    const [orders, total] = await Promise.all([
      Order.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/orders/:id
 * Get single order (user can only see own orders, admin can see all).
 */
async function getOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError('Order not found.', 404);

    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      throw new AppError('Access denied.', 403);
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/orders/vendor/sales
 * Vendor: get orders containing their products.
 */
async function getVendorSales(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = { 'items.vendor': req.user.id, paymentStatus: 'paid' };

    const [orders, total] = await Promise.all([
      Order.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
      Order.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /internal/orders/:id/update-status
 * Internal endpoint: Payment API notifies Core API of payment status change.
 * Called with X-Service-Secret header.
 */
async function updateOrderStatus(req, res, next) {
  try {
    const { paymentStatus, paymentIntentId } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError('Order not found.', 404);

    // Prevent backward state transitions
    const statusPriority = { pending: 0, processing: 1, paid: 2, failed: 3, refunded: 4 };
    if (statusPriority[paymentStatus] <= statusPriority[order.paymentStatus] && paymentStatus !== 'refunded') {
      logger.warn({ orderId: order._id, from: order.paymentStatus, to: paymentStatus }, 'Ignoring backward status transition');
      return res.json({ success: true, message: 'Status already up to date.' });
    }

    order.paymentStatus = paymentStatus;
    if (paymentIntentId) order.paymentIntentId = paymentIntentId;

    // If paid, update order status and decrement inventory
    if (paymentStatus === 'paid') {
      order.orderStatus = 'confirmed';

      // Decrement stock for each item
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      // Clear user's cart
      await Cart.findOneAndUpdate({ user: order.user }, { $set: { items: [] } });

      logger.info({ orderId: order._id }, 'Order confirmed, inventory decremented, cart cleared');
    }

    if (paymentStatus === 'failed') {
      order.orderStatus = 'cancelled';
    }

    await order.save();

    res.json({ success: true, message: 'Order status updated.', data: { orderId: order._id, paymentStatus: order.paymentStatus } });
  } catch (err) {
    next(err);
  }
}

module.exports = { checkout, verifyPayment, getMyOrders, getOrder, getVendorSales, updateOrderStatus };
