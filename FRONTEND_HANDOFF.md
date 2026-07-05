# INGRI WORLD: Frontend Engineering Handoff

Welcome to the Ingri World project! The backend architecture is 100% complete, fully tested, and ready for integration. This document contains everything you need to build the React Storefront and Admin Dashboard.

---

## 1. Technology Stack
You are required to build the frontend using the following approved stack:
- **Core:** React, React Router 6
- **Animations:** Framer Motion (use for smooth page transitions and micro-interactions)
- **Icons:** Lucide Icons
- **Typography:** Google Font API (Open Sans)
- **Payments:** Razorpay (Web integration)
- **Assets:** Amazon S3 & CloudFront (Ensure images are optimized as WebP)

---

## 2. Design System Tokens (Ingri)
Please adhere strictly to the Ingri Design System for all UI components to ensure a premium, accessible aesthetic.

### Typography
- **Primary Font:** Open Sans (`system-ui, sans-serif` fallback)
- **Base Size:** `16px`, Base Weight: `400`, Line Height: `24px`
- **Scale:** 
  - XS: `11px` | SM: `12px` | MD: `14px` | LG: `18px` | XL: `20px`
  - 2XL: `24px` | 3XL: `30px` | 4XL: `36px` | 5XL: `48px`

### Aesthetics & Vibe
- **Visual Style:** Structured, accessible, implementation-first.
- **Interactivity:** Dynamic. Use hover states and Framer Motion micro-animations to make the interface feel alive and premium.

---

## 3. Backend Integration (API)
The backend is running locally on Port 5000. It uses an enterprise-grade Neon Serverless Postgres database.

### Environment Setup
Create a `.env` file in your React `src/` or `admin/` directory:
```env
VITE_API_URL="http://localhost:5000/api"
VITE_RAZORPAY_KEY_ID="your_razorpay_test_key"
```

### Critical API Endpoints

#### 1. Fetching the Menu (Storefront)
```http
GET /api/products
```
*Note: This route is cached in RAM. It will return results in ~5ms. If you update a price in the Admin Panel, the cache automatically clears.*

#### 2. Guest Checkout (Storefront)
```http
POST /api/orders/checkout
Body: {
  customerName: "John",
  customerPhone: "9999999999",
  customerPincode: "110001", // CRITICAL: Must be sent for delivery validation!
  total: 500,
  orderType: "delivery", // or "dine_in", "takeaway"
  items: [ ... ]
}
```
*Note: If the user provides a pincode that is outside our delivery zone, the server will return a `400 Bad Request`. You must catch this error and display a toast notification to the user before launching the Razorpay popup.*

#### 3. Managing Products (Admin Dashboard)
```http
POST /api/products/admin   (Create new item)
PATCH /api/products/admin/:id (Change prices, etc.)
```

---

## 4. Development Workflow
- **Git Strategy:** Please branch off `main` to a feature branch (e.g., `feature/react-storefront`) before writing code.
- **Testing:** The backend is protected by a GitHub Actions CI/CD pipeline and Jest automated tests. If you push broken code, the pipeline will warn you!

**Good luck, and build something beautiful!**
