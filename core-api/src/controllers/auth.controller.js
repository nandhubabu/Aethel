const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * POST /api/v1/auth/register
 * Register a new user (customer or vendor).
 */
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.validatedBody;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const userData = { name, email, password, role: role || 'customer' };

    // If registering as vendor, set up vendor profile
    if (userData.role === 'vendor') {
      userData.vendorProfile = {
        storeName: req.validatedBody.storeName || name + "'s Store",
        storeDescription: req.validatedBody.storeDescription || '',
        isApproved: false, // Requires admin approval
      };
    }

    const user = await User.create(userData);
    const token = generateToken(user);

    logger.info({ userId: user._id, role: user.role }, 'User registered');

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          vendorProfile: user.vendorProfile,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/login
 * Authenticate user and return JWT.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.validatedBody;

    // Explicitly select password since it's hidden by default
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account has been deactivated. Contact support.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = generateToken(user);
    logger.info({ userId: user._id }, 'User logged in');

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          vendorProfile: user.vendorProfile,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/auth/me
 * Get current authenticated user profile.
 */
async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorProfile: user.vendorProfile,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe };
