import prisma from '../utils/prisma.mjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_legacy';

// Helper to hash passwords 
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

function generateAdminToken(admin) {
  const payload = {
    id: admin.id,
    email: admin.email,
    role: admin.role || "superadmin",
    isAdmin: true,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

// POST /admin/login
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase() } });
    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const hash = hashPassword(password, admin.salt);
    if (hash !== admin.passwordHash) return res.status(401).json({ error: "Invalid credentials" });

    const token = generateAdminToken(admin);
    res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (error) {
    next(error);
  }
};

// GET /admin/me
export const getAdminProfile = async (req, res, next) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id }, // req.admin is set by auth middleware
      select: { id: true, name: true, email: true, role: true }
    });

    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.json({ admin });
  } catch (error) {
    next(error);
  }
};

// GET /admin/dashboard
export const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Execute all count queries in parallel for maximum speed
    const [
      totalUsers, totalProducts, totalReservations, todayReservations,
      totalOrders, pendingOrders, totalPayments, totalBlogs, totalReviews
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.reservation.count(),
      prisma.reservation.count({
        where: {
          reservationAt: {
            gte: new Date(`${today}T00:00:00.000Z`),
            lte: new Date(`${today}T23:59:59.999Z`)
          }
        }
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "paid" } }),
      prisma.order.count({ where: { status: "paid" } }),
      prisma.blog.count(),
      prisma.review.count()
    ]);

    // Aggregate revenue using Prisma's aggregate function on Orders
    const revenueAgg = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "paid" }
    });

    res.json({
      stats: {
        totalUsers, totalProducts, totalReservations, todayReservations,
        totalOrders, pendingOrders, totalPayments,
        totalRevenue: revenueAgg._sum.total || 0,
        totalBlogs, totalReviews,
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /admin/users (Now acts as a CRM pulling from Orders)
export const getAdminUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Fetch distinct customers from orders based on email
    // Prisma distinct requires selecting the field we distinct on
    const uniqueOrders = await prisma.order.findMany({
      distinct: ['customerEmail'],
      select: {
        customerEmail: true,
        customerName: true,
        customerPhone: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * limitNum,
      take: limitNum
    });

    // Map to a user-like structure for the frontend
    const users = uniqueOrders.map(order => ({
      _id: order.customerEmail, // use email as ID since there is no user account
      name: order.customerName,
      email: order.customerEmail,
      phone: order.customerPhone,
      role: 'customer',
      createdAt: order.createdAt
    }));
    
    // For pagination total, we'd need a raw query or group by count,
    // but for simplicity we'll just return the length if it's less than limit
    const total = users.length === limitNum ? pageNum * limitNum + 1 : (pageNum - 1) * limitNum + users.length;

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /admin/users/:id/profile
export const getUserProfile = async (req, res, next) => {
  try {
    const { id: email } = req.params;
    const order = await prisma.order.findFirst({
      where: { customerEmail: email },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!order) return res.status(404).json({ error: "No profile found" });
    
    res.json({
      profile: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /admin/users/:id/addresses
export const getUserAddresses = async (req, res, next) => {
  try {
    const { id: email } = req.params;
    const order = await prisma.order.findFirst({
      where: { customerEmail: email, shippingAddress: { not: null } },
      orderBy: { createdAt: 'desc' }
    });

    if (!order || !order.shippingAddress) {
      return res.json({ addresses: [] });
    }

    // Convert shippingAddress JSON to array format expected by frontend
    const addr = order.shippingAddress;
    res.json({
      addresses: [{
        _id: "default-1",
        fullName: addr.fullName || order.customerName,
        phone: addr.phone || order.customerPhone,
        addressLine1: addr.addressLine1,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        type: "Home",
        isDefault: true
      }]
    });
  } catch (error) {
    next(error);
  }
};

// GET /admin/orders
export const getAdminOrders = async (req, res, next) => {
  try {
    const { status, limit = 50, startDate, endDate } = req.query;
    const limitNum = parseInt(limit, 10);
    const where = {};
    
    if (status) where.status = status;
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59.999Z') // include full end day
      };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limitNum,
        include: { items: true }
      }),
      prisma.order.count({ where })
    ]);
    res.json({ orders, pagination: { total } });
  } catch (error) {
    next(error);
  }
};

// GET /admin/reviews
export const getAdminReviews = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit, 10),
      include: { product: true }
    });
    // Map productId to the populated product object to match frontend expectations
    const mappedReviews = reviews.map(r => ({
      ...r,
      _id: r.id,
      productId: r.product || r.productId
    }));
    res.json({ reviews: mappedReviews });
  } catch (error) {
    next(error);
  }
};

// GET /admin/inquiries
export const getAdminInquiries = async (req, res, next) => {
  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ inquiries });
  } catch (error) {
    next(error);
  }
};

// PUT /admin/inquiries/:id
export const updateAdminInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { status }
    });
    res.json({ inquiry });
  } catch (error) {
    next(error);
  }
};

// DELETE /admin/inquiries/:id
export const deleteAdminInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.inquiry.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
