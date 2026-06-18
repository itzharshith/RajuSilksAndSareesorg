const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
require('dotenv').config();

// Initialize DB Connection
connectDB();

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allows serving static uploads folder
}));

// CORS Configuration: Same-domain in production, allow localhost in dev
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite standard dev port
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Rate limiting: general protection
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, 
  message: { message: 'Too many requests, please try again after 15 minutes.' }
});
app.use('/api', generalLimiter);

// Stricter rate limits for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, 
  message: { message: 'Too many authentication attempts. Please try again after 15 minutes.' }
});
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/users/forgot-password', authLimiter);
app.use('/api/users/reset-password', authLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 FIXED: Changed from '/uploads' to '/api/uploads' so Vercel routes it to the backend service
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes mapping
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root route
app.get('/api', (req, res) => {
  res.json({ message: 'Raju Silks & Sarees REST APIs are fully functional!' });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: `API route not found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
