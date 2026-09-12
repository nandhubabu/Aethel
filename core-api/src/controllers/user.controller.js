const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

/**
 * GET /api/v1/users
 * Admin: list all users with pagination.
 */
async function getAllUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/users/:id/approve-vendor
 * Admin: approve a vendor's store.
 */
async function approveVendor(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new AppError('User not found.', 404);
    if (user.role !== 'vendor') throw new AppError('User is not a vendor.', 400);
    if (!user.vendorProfile) throw new AppError('No vendor profile found.', 400);

    user.vendorProfile.isApproved = true;
    await user.save();

    res.json({
      success: true,
      message: 'Vendor approved successfully.',
      data: { id: user._id, vendorProfile: user.vendorProfile },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/users/profile
 * Authenticated user: update own profile.
 */
async function updateProfile(req, res, next) {
  try {
    const allowedFields = ['name', 'avatar'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    // Vendor-specific fields
    if (req.user.role === 'vendor') {
      const vendorFields = ['storeName', 'storeDescription', 'businessAddress'];
      for (const field of vendorFields) {
        if (req.body[field] !== undefined) {
          updates[`vendorProfile.${field}`] = req.body[field];
        }
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true, runValidators: true });

    if (!user) throw new AppError('User not found.', 404);

    res.json({
      success: true,
      message: 'Profile updated.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        vendorProfile: user.vendorProfile,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllUsers, approveVendor, updateProfile };
