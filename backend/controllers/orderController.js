const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { products, shippingAddress, couponCode, paymentDetails } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    let subtotal = 0;
    const orderProducts = [];

    // Verify stock and calculate subtotal
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}` });
      }

      // Calculate discounted price per unit
      const discountedPrice = product.price * (1 - (product.discount || 0) / 100);
      subtotal += discountedPrice * item.quantity;

      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        price: discountedPrice
      });
    }

    // Process coupon
    let discountAmount = 0;
    let couponApplied = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon && coupon.expiryDate > new Date()) {
        if (coupon.discountType === 'flat') {
          discountAmount = Math.min(subtotal, coupon.discountValue);
        } else {
          const pct = coupon.discountValue !== undefined ? coupon.discountValue : coupon.discountPercentage;
          discountAmount = subtotal * (pct / 100);
        }
        couponApplied = coupon.code;
      }
    }

    const taxableAmount = subtotal - discountAmount;
    
    // Tax calculation: 5% GST for textiles/sarees
    const taxAmount = Math.round(taxableAmount * 0.05);

    // Shipping charges: Rs. 100 flat, free above Rs. 5000
    const shippingCharges = taxableAmount > 5000 ? 0 : 100;

    const totalAmount = Math.round(taxableAmount + taxAmount + shippingCharges);

    // Deduct stock
    for (const item of products) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    const order = await Order.create({
      user: req.user._id,
      products: orderProducts,
      totalAmount,
      discountAmount,
      taxAmount,
      shippingCharges,
      shippingAddress,
      paymentStatus: paymentDetails ? 'Paid' : 'Pending',
      paymentDetails,
      couponApplied
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('products.product', 'name images price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Users can only view their own orders; Admins can view any order
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('products.product', 'name images')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('products.product', 'name price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (status) {
      // If cancelling order, restore stock
      if (status === 'Cancelled' && order.orderStatus !== 'Cancelled') {
        for (const item of order.products) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          });
        }
      } 
      // If moving away from Cancelled, deduct stock again
      else if (order.orderStatus === 'Cancelled' && status !== 'Cancelled') {
        for (const item of order.products) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity }
          });
        }
      }
      order.orderStatus = status;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus
};
