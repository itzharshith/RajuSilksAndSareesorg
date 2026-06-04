const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getUsers,
  toggleBlockUser,
  forgotPassword,
  resetPassword
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/addresses')
  .post(protect, addAddress);

router.route('/addresses/:id')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

// Admin-only user management
router.route('/')
  .get(protect, adminOnly, getUsers);

router.route('/:id/block')
  .put(protect, adminOnly, toggleBlockUser);

module.exports = router;
