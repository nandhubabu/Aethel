const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET /api/v1/cart
 * Get current user's cart.
 */
async function getCart(req, res, next) {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      'items.product',
      'title price images stock isActive'
    );

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/cart/items
 * Add item to cart or increment quantity.
 */
async function addItem(req, res, next) {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new AppError('Product not found or unavailable.', 404);
    }
    if (product.stock < quantity) {
      throw new AppError(`Only ${product.stock} items in stock.`, 400);
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingIdx = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIdx >= 0) {
      const newQty = cart.items[existingIdx].quantity + quantity;
      if (newQty > product.stock) {
        throw new AppError(`Cannot add more than ${product.stock} of this item.`, 400);
      }
      cart.items[existingIdx].quantity = newQty;
      cart.items[existingIdx].priceAtAdd = product.price;
    } else {
      cart.items.push({
        product: productId,
        quantity,
        priceAtAdd: product.price,
      });
    }

    await cart.save();
    await cart.populate('items.product', 'title price images stock isActive');

    res.json({ success: true, message: 'Item added to cart.', data: cart });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/cart/items/:itemId
 * Update item quantity in cart.
 */
async function updateItem(req, res, next) {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
      throw new AppError('Quantity must be at least 1.', 400);
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) throw new AppError('Cart not found.', 404);

    const item = cart.items.id(req.params.itemId);
    if (!item) throw new AppError('Item not found in cart.', 404);

    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      throw new AppError('Product no longer available.', 400);
    }
    if (quantity > product.stock) {
      throw new AppError(`Only ${product.stock} items in stock.`, 400);
    }

    item.quantity = quantity;
    item.priceAtAdd = product.price; // refresh price
    await cart.save();
    await cart.populate('items.product', 'title price images stock isActive');

    res.json({ success: true, message: 'Cart updated.', data: cart });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/cart/items/:itemId
 * Remove item from cart.
 */
async function removeItem(req, res, next) {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) throw new AppError('Cart not found.', 404);

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === req.params.itemId
    );
    if (itemIndex === -1) throw new AppError('Item not found in cart.', 404);

    cart.items.splice(itemIndex, 1);
    await cart.save();
    await cart.populate('items.product', 'title price images stock isActive');

    res.json({ success: true, message: 'Item removed.', data: cart });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/cart
 * Clear entire cart.
 */
async function clearCart(req, res, next) {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared.', data: { items: [] } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
