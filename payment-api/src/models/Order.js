const mongoose = require('mongoose');

/**
 * Minimal Order schema for the Payment API.
 * This is a restricted mirror — only fields the Payment API needs
 * to read/update order payment status. No access to User, Product, or Cart.
 */
const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true },
    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentIntentId: { type: String, default: '', index: true },
    orderStatus: { type: String, default: 'created' },
    idempotencyKey: { type: String, index: true },
  },
  {
    timestamps: true,
    strict: false, // Allow reading fields written by Core API even if not in this schema
  }
);

module.exports = mongoose.model('Order', orderSchema);
