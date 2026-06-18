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
    const db = require('../config/db').getDB();

    // 1. Core counters
    const totalOrders = await Order.countDocuments({});
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const totalProducts = await Product.countDocuments({});

    // Calculate total revenue using native SQL SUM
    const revenueResult = await db.execute({
      sql: 'SELECT SUM("totalAmount") as total FROM "orders" WHERE "paymentStatus" = \'Paid\'',
      args: []
    });
    const totalRevenue = revenueResult.rows[0]?.total || 0;

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

    const monthlySalesResult = await db.execute({
      sql: `
        SELECT 
          CAST(strftime('%Y', "createdAt") AS INTEGER) as year,
          CAST(strftime('%m', "createdAt") AS INTEGER) as month,
          SUM("totalAmount") as revenue,
          COUNT(*) as orders
        FROM "orders"
        WHERE "paymentStatus" = 'Paid' AND "createdAt" >= ?
        GROUP BY year, month
        ORDER BY year ASC, month ASC
      `,
      args: [sixMonthsAgo.toISOString()]
    });

    const monthlySales = monthlySalesResult.rows.map(row => ({
      _id: {
        year: row.year,
        month: row.month
      },
      revenue: row.revenue || 0,
      orders: row.orders || 0
    }));

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
    const categoryDistributionResult = await db.execute({
      sql: `
        SELECT 
          p.category as _id,
          c.name as name,
          SUM(CAST(json_extract(item.value, '$.quantity') AS INTEGER)) as salesCount,
          SUM(CAST(json_extract(item.value, '$.price') AS REAL) * CAST(json_extract(item.value, '$.quantity') AS INTEGER)) as revenue
        FROM "orders" o, json_each(o.products) item
        JOIN "products" p ON p._id = json_extract(item.value, '$.product')
        JOIN "categories" c ON c._id = p.category
        WHERE o.paymentStatus = 'Paid'
        GROUP BY p.category
        ORDER BY revenue DESC
      `,
      args: []
    });
    const categoryDistribution = categoryDistributionResult.rows;

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
    const db = require('../config/db').getDB();
    let sql = '';
    let args = [];

    if (timeline === 'daily') {
      // Last 14 days
      sql = `
        SELECT 
          CAST(strftime('%Y', "createdAt") AS INTEGER) as year,
          CAST(strftime('%m', "createdAt") AS INTEGER) as month,
          CAST(strftime('%d', "createdAt") AS INTEGER) as day,
          SUM("totalAmount") as revenue,
          COUNT(*) as orders
        FROM "orders"
        WHERE "paymentStatus" = 'Paid' AND "createdAt" >= ?
        GROUP BY year, month, day
        ORDER BY year ASC, month ASC, day ASC
      `;
      args.push(getDateDaysAgo(14).toISOString());
    } else if (timeline === 'weekly') {
      // Last 8 weeks
      sql = `
        SELECT 
          CAST(strftime('%Y', "createdAt") AS INTEGER) as year,
          CAST(strftime('%W', "createdAt") AS INTEGER) as week,
          SUM("totalAmount") as revenue,
          COUNT(*) as orders
        FROM "orders"
        WHERE "paymentStatus" = 'Paid' AND "createdAt" >= ?
        GROUP BY year, week
        ORDER BY year ASC, week ASC
      `;
      args.push(getDateDaysAgo(56).toISOString());
    } else if (timeline === 'yearly') {
      // All years
      sql = `
        SELECT 
          CAST(strftime('%Y', "createdAt") AS INTEGER) as year,
          SUM("totalAmount") as revenue,
          COUNT(*) as orders
        FROM "orders"
        WHERE "paymentStatus" = 'Paid'
        GROUP BY year
        ORDER BY year ASC
      `;
    } else {
      // Monthly (Default - Last 12 months)
      sql = `
        SELECT 
          CAST(strftime('%Y', "createdAt") AS INTEGER) as year,
          CAST(strftime('%m', "createdAt") AS INTEGER) as month,
          SUM("totalAmount") as revenue,
          COUNT(*) as orders
        FROM "orders"
        WHERE "paymentStatus" = 'Paid' AND "createdAt" >= ?
        GROUP BY year, month
        ORDER BY year ASC, month ASC
      `;
      args.push(getDateDaysAgo(365).toISOString());
    }

    const result = await db.execute({ sql, args });

    // Format output label
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedData = result.rows.map(item => {
      let label = '';
      if (timeline === 'daily') {
        label = `${item.day}/${item.month}/${item.year}`;
      } else if (timeline === 'weekly') {
        label = `Wk ${item.week}, ${item.year}`;
      } else if (timeline === 'yearly') {
        label = `${item.year}`;
      } else {
        label = `${monthNames[item.month - 1]} ${item.year}`;
      }

      return {
        label,
        revenue: item.revenue || 0,
        orders: item.orders || 0
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
