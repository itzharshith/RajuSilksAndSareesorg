const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');

// Helper to get date offsets
const getDateDaysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// @desc    Get dashboard metrics & recent activities
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // 1. Core counters
    const totalOrders = await Order.countDocuments({});
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments({});

    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // 2. Recent Orders (last 6)
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(6);

    // 3. Monthly Sales Breakdown (last 6 months) for chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'Paid',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly data for easy graph mapping
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlySales = [];
    
    // Seed default last 6 months to make sure the graph is never blank
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      
      const record = monthlySales.find(s => s._id.month === m && s._id.year === y);
      formattedMonthlySales.push({
        name: `${monthNames[m - 1]} ${y}`,
        revenue: record ? record.revenue : 0,
        orders: record ? record.orders : 0
      });
    }

    // 4. Top Selling Categories distribution
    const categoryDistribution = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$productDetails.category',
          salesCount: { $sum: '$products.quantity' },
          revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDetails'
        }
      },
      { $unwind: '$categoryDetails' },
      {
        $project: {
          _id: 1,
          name: '$categoryDetails.name',
          salesCount: 1,
          revenue: 1
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    res.json({
      summary: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts
      },
      recentOrders,
      monthlySales: formattedMonthlySales,
      categoryDistribution
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed revenue analytics by timeline (daily, weekly, monthly, yearly)
// @route   GET /api/analytics/revenue
// @access  Private/Admin
const getRevenueAnalytics = async (req, res) => {
  try {
    const { timeline = 'monthly' } = req.query;
    let groupStage = {};
    let sortStage = {};
    let matchStage = { paymentStatus: 'Paid' };

    const now = new Date();

    if (timeline === 'daily') {
      // Last 14 days
      matchStage.createdAt = { $gte: getDateDaysAgo(14) };
      groupStage = {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      };
      sortStage = { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } };
    } else if (timeline === 'weekly') {
      // Last 8 weeks
      matchStage.createdAt = { $gte: getDateDaysAgo(56) };
      groupStage = {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      };
      sortStage = { $sort: { '_id.year': 1, '_id.week': 1 } };
    } else if (timeline === 'yearly') {
      // All years
      groupStage = {
        $group: {
          _id: {
            year: { $year: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      };
      sortStage = { $sort: { '_id.year': 1 } };
    } else {
      // Monthly (Default - Last 12 months)
      matchStage.createdAt = { $gte: getDateDaysAgo(365) };
      groupStage = {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      };
      sortStage = { $sort: { '_id.year': 1, '_id.month': 1 } };
    }

    const data = await Order.aggregate([
      { $match: matchStage },
      groupStage,
      sortStage
    ]);

    // Format output label
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedData = data.map(item => {
      let label = '';
      if (timeline === 'daily') {
        label = `${item._id.day}/${item._id.month}/${item._id.year}`;
      } else if (timeline === 'weekly') {
        label = `Wk ${item._id.week}, ${item._id.year}`;
      } else if (timeline === 'yearly') {
        label = `${item._id.year}`;
      } else {
        label = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      }

      return {
        label,
        revenue: item.revenue,
        orders: item.orders
      };
    });

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getRevenueAnalytics
};
