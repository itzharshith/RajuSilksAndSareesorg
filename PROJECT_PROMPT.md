# System Prompt: Raju Silks & Sarees E-Commerce Project Context

Use the following detailed specification to understand, maintain, and extend the **Raju Silks & Sarees** codebase.

---

## 1. Project Overview & Core Mission
**Raju Silks & Sarees** is a premium, high-aesthetic e-commerce platform specializing in authentic, handloom Indian silk sarees (such as Kanjeevarams, Soft Silks, and Banarasis). 
- **Target Audience:** Customers seeking high-quality heritage ethnic wear, bridal silks, and designer sarees.
- **Design Philosophy:** Luxury visual styling featuring deep blues, cream accents, metallic gold details, and extensive glassmorphism (frosted elements) for an immersive, premium user experience.

---

## 2. Core Technology Stack
- **Framework:** Next.js 16 (App Router) & React 19 (using modern server/client components and hooks).
- **Language:** TypeScript (Strictly typed schemas, parameters, and payloads).
- **Styling:** Tailwind CSS v4 with custom configuration (defined in `globals.css` using the `@theme` directive).
- **Database:** LibSQL Client connecting to a SQLite / Turso database.
- **Authentication:** NextAuth.js (v5 Beta) with custom Credentials provider and JWT session strategy.
- **Payment Gateway:** Cashfree PG integration (supporting both production and sandbox testing).
- **Image Hosting:** Cloudinary SDK for uploading and delivering media.
- **Email Delivery:** Nodemailer for OTP reset codes and order confirmations.

---

## 3. Architecture & File Structure

```
├── app/                      # Next.js App Router Pages & API Routes
│   ├── layout.tsx            # Global layout, custom background, and auth session providers
│   ├── page.tsx              # Luxury Homepage (Hero, category navigation, testimonials, featured products)
│   ├── shop/                 # Product listing page with active search, category filters, and grid/list views
│   ├── product/              # Detailed product view (ratings, reviews, descriptions, add-to-cart)
│   ├── cart/                 # Shopping cart listing item quantities, pricing breakdown, and checkout triggers
│   ├── checkout/             # Checkout form (shipping details, coupon application, order submission)
│   ├── order-verify/         # Handles payment redirection callback and status verification
│   ├── orders/               # Customer order history dashboard
│   ├── profile/              # User account page (personal info and address management)
│   ├── admin/                # Admin panels (Dashboard, Categories, Coupons, Customers, Orders, Products)
│   ├── api/                  # Backend REST API Routes
│   │   ├── auth/             # Auth.js handler routing
│   │   ├── categories/       # Category CRUD endpoints
│   │   ├── products/         # Product CRUD, filters, and uploads
│   │   ├── orders/           # Order creation, historical lookups, and statuses
│   │   ├── payment/          # Cashfree order/session creation and verification APIs
│   │   ├── coupons/          # Coupon CRUD and code validations
│   │   └── analytics/        # Sales/metrics dashboard endpoints
│   └── globals.css           # Tailwind v4 configuration, theme variables, glassmorphism utilities, and animations
├── components/               # Shareable UI components
│   ├── Navbar.tsx            # Main header navigation with shopping cart indicator and user session dropdown
│   ├── MobileTabBar.tsx      # Bottom-anchored tab bar tailored for mobile devices
│   ├── Background.tsx        # Custom radial-gradient background styling
│   ├── ProductCard.tsx       # Interactive card component displaying product image, discount, and ratings
│   └── AdminLayout.tsx       # Shared layout navigation for admin pages
├── lib/                      # Business Logic & Core Configurations
│   ├── auth.ts               # Auth.js Credential-based authentication config
│   ├── db.ts                 # LibSQL / Turso database connection initialization
│   ├── sendEmail.ts          # SMTP transporter wrapper for Nodemailer
│   ├── cloudinary.ts         # Cloudinary configuration exports
│   └── models/               # Custom BaseModel-backed entities (Custom ORM)
│       ├── BaseModel.ts      # Core abstract model implementing Mongoose-like APIs on SQLite
│       ├── User.ts           # User entity model (stores profile data, roles, addresses, hashed passwords)
│       ├── Product.ts        # Product catalog entity model
│       ├── Category.ts       # Product category entity model
│       ├── Order.ts          # Customer order model (items, pricing, status, payment result)
│       ├── Coupon.ts         # Promotion codes model
│       └── Review.ts         # Product reviews and rating feedback model
```

---

## 4. Custom Database Layer (BaseModel ORM)
The project **does not use Mongoose or Prisma**. Instead, a custom Mongoose-like ORM is built on top of SQLite (`@libsql/client`) in `lib/models/BaseModel.ts`. 

### Key Behaviors of `BaseModel`:
- **Methods:** It implements `find`, `findById`, `findOne`, `create`, `updateOne`, `deleteOne`, `countDocuments`, `save`, and `populate`.
- **Query Structure:** Mimics MongoDB selectors. E.g., `Product.find({ price: { $gte: 1000 } })` or `Product.find({ name: { $regex: /silk/i } })`.
- **Relationship Population:** `populate({ path: 'category', select: 'name' })` fetches related tables based on their IDs and resolves them inline.
- **JSON Serialization:** SQLite columns representing arrays or objects (like `images` in `Product` or `addresses` in `User`) are configured via `jsonColumns` and automatically parsed/stringified upon reads and writes.

#### BaseModel Usage Example:
```typescript
import { Product } from '@/lib/models/Product';

// Fetch products with populated Category data
const products = await Product.find({ featured: 1 })
  .populate([{ path: 'category', select: 'name' }]);
```

---

## 5. Styling System & Visual Identity
The styling is powered by **Tailwind CSS v4** with a highly customized theme configuration in `app/globals.css`.

### Custom Color Palette Variables:
- `--color-brand-blue`: `#0B3C5D` (Primary layout brand color)
- `--color-brand-blue-light`: `#328CC1` (Highlights and active states)
- `--color-brand-blue-dark`: `#1D2731` (Secondary dark layouts)
- `--color-brand-blue-deep`: `#07111E` (Core luxury dark background)
- `--color-brand-cream`: `#FDFBF7` (Light background elements)
- `--color-brand-cream-text`: `#E5DDC8` (Primary text color on dark screens)
- `--color-brand-gold`: `#D4AF37` (Zari/metallic highlight color)

### Custom Glassmorphism Classes:
- `.glass-panel`: Frosted white glass background for cards and overlays.
- `.glass-card`: Slightly lighter glass for product cards.
- `.glass-dark`: Dark glass container for sections overlaying dark backgrounds (e.g. Hero banner).
- `.glass-nav`: Frosted glass for navbar blur.

---

## 6. Critical Integrations
### 1. Cashfree Payment Gateway
- Payments are processed through the Cashfree Checkout SDK.
- The route `/api/payment/cashfree/create-session` handles generating an order session via Cashfree API headers (`x-client-id`, `x-client-secret`) and returns a `payment_session_id`.
- The route `/api/payment/cashfree/verify` verifies signature hashes and updates the DB order status to `paid: true`.

### 2. NextAuth Authentication
- Uses standard Credentials authentication config in `lib/auth.ts`.
- Manages user roles (`customer`, `admin`) to protect `/admin` dashboard routes and API endpoints.

---

## 7. Guidelines for AI Agents Working on This Project
When writing code, proposing modifications, or debugging issues, adhere to the following rules:

1. **Do Not Introduce External ORMs:** Always rely on `lib/models/BaseModel.ts` and the established subclass schemas for database CRUD operations.
2. **Follow Tailwind CSS v4 Standard:** Do not use legacy Tailwind v3 syntax or configuration. Configure theme extensions in `app/globals.css` under the `@theme` block.
3. **Adopt Glassmorphism Aesthetics:** Keep all newly created UI elements visually cohesive by using the predefined class systems (`.glass-panel`, `.glass-dark`, etc.).
4. **Preserve Type Safety:** Always declare types and interface properties for any new route, response payload, or component properties.
5. **Handle Server/Client Separation:** Mark frontend files with `'use client'` appropriately if they use hooks (`useState`, `useEffect`) or interact with DOM APIs.
6. **Support Mobile & Desktop Layouts:** Ensure all new navigation elements align with both the sticky header (`Navbar.tsx`) and the mobile utility bar (`MobileTabBar.tsx`).
