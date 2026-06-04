# Raju Silks & Sarees - Full-Stack E-Commerce Application

**Tagline**: *"An Ethnic Master Weavers Store"*
**Business Type**: Traditional Silk Saree & Ethnic Wear Luxury Brand

This repository contains the complete full-stack codebase for **Raju Silks & Sarees**, engineered for deployment-ready, production-grade quality. It implements a premium luxury theme matching the brand colors of Maroon, Gold, Cream, and White, with separate client-facing storefronts and standalone administrator management portals.

---

## 📂 Project Architecture

```text
├── backend/
│   ├── config/              # MongoDB & Cloudinary integrations
│   ├── controllers/         # REST API business logic handlers
│   ├── middleware/          # Authorization checks & Multer uploads
│   ├── models/              # Mongoose database models (Schemas)
│   ├── routes/              # Express API endpoints
│   ├── scripts/             # Data seeding files (13 categories, 26 products)
│   ├── uploads/             # Local backup file uploads folder
│   ├── .env                 # Environment configurations
│   ├── package.json         # Backend server dependencies
│   └── server.js            # Main Express entrypoint
│
└── frontend/
    ├── public/              # Global static assets
    ├── src/
    │   ├── components/      # Reusable UI parts (Navbar, Footers, Cards)
    │   ├── context/         # Auth & Shopping Cart global providers
    │   ├── pages/           # Store front pages (Home, Shop, Details, Cart)
    │   │   └── admin/       # Standalone admin panels (Dashboard, CRUDs)
    │   ├── services/        # Axios API clients with JWT interceptors
    │   ├── App.jsx          # Route mappings and context wrappers
    │   ├── index.css        # Tailwind styling & luxury keyframes
    │   └── main.jsx         # React bootstrap wrapper
    ├── index.html           # Main HTML index with SEO tags
    ├── package.json         # React dev dependencies
    ├── tailwind.config.js   # Custom Maroon & Gold brand configuration
    ├── postcss.config.js    # PostCSS build config
    └── vite.config.js       # Vite development proxy maps
```

---

## ⚡ Tech Stack

### Frontend
- **Framework**: React.js (bootstrapped with Vite)
- **Routing**: React Router DOM (v6)
- **Styling**: Tailwind CSS (extending brand palettes, luxury serif/sans fonts, and micro-animations)
- **HTTP Client**: Axios (with credentials interceptors)
- **Icons**: Lucide React
- **State Management**: Context API (Auth and Shopping Cart)

### Backend
- **Platform**: Node.js & Express.js
- **Database**: MongoDB & Mongoose
- **Security**: JSON Web Tokens (JWT) & BcryptJS (Password hashing)
- **Files/Uploads**: Multer (Multipart parsing) & Cloudinary integration (with local disk fallback)
- **Payment Mock**: Custom sandbox Razorpay order creation and verification APIs

---

## 🔑 Default Credentials

The database has been pre-seeded with the following credentials for testing:

### Administrator Access
- **Email**: `admin@rajusilks.com`
- **Password**: `admin123`
- **Privilege**: Access to Admin Panel, product inventory CRUD, coupons, user blocking, and sales metrics.

### Customer Access
- **Email**: `user@rajusilks.com`
- **Password**: `user123`
- **Privilege**: Storefront orders checkout, address management, reviews.

---

## ⚙️ Setup & Installation Instructions

Follow these steps to run the application locally:

### Prerequisites
- Node.js installed (v16+)
- MongoDB daemon running locally on default port `27017`

### Step 1: Clone and Configure Environment
Copy the backend `.env` variables:
```bash
# Locate file: backend/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rajusilks
JWT_SECRET=rajusilks_jwt_secret_key_luxury_gold_maroon

# Optional Cloudinary (Local uploads serve as fallback if left empty)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Step 2: Seed Database
Populate the database with the 13 traditional categories and 26 starter silk products:
```bash
cd backend
npm run seed
```

### Step 3: Run the Server
Launch the backend server:
```bash
cd backend
npm run start
```
The server will boot on `http://localhost:5000`.

### Step 4: Run the Client Storefront
Install client modules and start the Vite React development server:
```bash
cd ../frontend
npm run dev
```
Open your browser and navigate to the address: `http://localhost:3000`.

---

## 🌟 Key Application Features

### Customer Storefront
1. **Interactive Homepage**: Banner,Shop By Category, Featured Items, testimonials, and brand guarantees.
2. **Advanced Catalog Search**: Filter by categories, price range boundaries, discount availability, and sorting (Newest, Price High/Low, Highest Discount).
3. **Product Profiles**: Images preview select drawers, descriptions, real-time stock alert messages, reviews listings, and dynamic review submission drawer.
4. **Shopping Cart & Wishlist**: Real-time counters, coupon drawer validation check, subtotal summing, and 5% GST tax calculation.
5. **Interactive checkout**: Delivery address book, address additions form, order summary, and sandbox simulated Razorpay payment popup.
6. **Customer Panel**: Manage shipping addresses, update passwords, view purchase histories, and track shipment status bar.

### Admin Portal (`/admin`)
1. **Analytics Dashboard**: Total Revenue, customer volume counters, recent orders table, and monthly sales bar charts drawn with custom SVGs.
2. **Product Inventory CRUD**: Add, edit, delete products, set stock quantity limits, set discounts percentage, upload multiple product images with preview, and select categories.
3. **Category Manager**: Add, edit, remove categories with banner upload hooks.
4. **Order Manager**: View all placed order items, shipping details, and modify status (Pending -> Processing -> Shipped -> Delivered -> Cancelled).
5. **Coupons Editor**: Create promotional codes, set expiration dates, and toggle active/disabled states.
6. **Customers Panel**: Inspect user details, view total purchases, and block/unblock access.
