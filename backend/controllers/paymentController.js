const crypto = require('crypto');

// @desc    Create Razorpay mock order
// @route   POST /api/payment/create-order
// @access  Private
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount is required and must be greater than zero' });
    }

    // Razorpay amounts are in paise (cents equivalent)
    const amountInPaise = Math.round(amount * 100);
    const mockOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;

    res.status(201).json({
      id: mockOrderId,
      entity: 'order',
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      status: 'created',
      attempts: 0,
      notes: [],
      created_at: Math.floor(Date.now() / 1000),
      // Dummy merchant key to configure mock frontend client
      razorpay_key: 'rzp_test_mock_key_rajusilks'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay payment signature (mocked)
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        message: 'Payment verification parameters are missing' 
      });
    }

    // Mock verification: check if signature ends with correct validation character
    // Or just accept since it's a mock environment
    res.json({
      success: true,
      message: 'Payment verified successfully',
      transaction: {
        id: razorpay_payment_id,
        orderId: razorpay_order_id,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment
};
