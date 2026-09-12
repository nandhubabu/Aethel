const { Router } = require('express');
const { getAllUsers, approveVendor, updateProfile } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/', authorize('admin'), getAllUsers);
router.patch('/profile', updateProfile);
router.patch('/:id/approve-vendor', authorize('admin'), approveVendor);

module.exports = router;
