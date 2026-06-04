const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getCoupons,
  createCoupon,
  toggleCoupon,
  deleteCoupon
} = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/validate')
  .post(protect, validateCoupon);

router.route('/')
  .get(protect, adminOnly, getCoupons)
  .post(protect, adminOnly, createCoupon);

router.route('/:id/toggle')
  .put(protect, adminOnly, toggleCoupon);

router.route('/:id')
  .delete(protect, adminOnly, deleteCoupon);

module.exports = router;
