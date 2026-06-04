const express = require('express');
const router = express.Router();
const { getDashboardStats, getRevenueAnalytics } = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.get('/revenue', protect, adminOnly, getRevenueAnalytics);

module.exports = router;
