import { Router } from 'express';
import { adminLogin, getAdminProfile, getDashboardStats, getAdminUsers, getUserProfile, getUserAddresses, getAdminOrders, getAdminReviews, getAdminInquiries, updateAdminInquiry, deleteAdminInquiry } from '../controllers/admin.controller.mjs';
import { createProduct, updateProduct, deleteProduct, getPublicProducts } from '../controllers/products.controller.mjs';
import { updateOrder, deleteOrder, createAdminOrder } from '../controllers/orders.controller.mjs';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, getBanners, createBanner, updateBanner, deleteBanner } from '../controllers/promotions.controller.mjs';
import { getAllRecipes, createRecipe, updateRecipe, deleteRecipe } from '../controllers/recipes.controller.mjs';
import { getAdminReservations, updateReservation, deleteReservation } from '../controllers/reservations.controller.mjs';
import { getPincodes, addPincode, deletePincode } from '../controllers/pincodes.controller.mjs';
import { getAdminPayments, createAdminPayment, updatePaymentStatus } from '../controllers/payments.controller.mjs';
import { requireAdmin } from '../middlewares/auth.middleware.mjs';

const router = Router();

// Middleware to alias all PATCH requests to PUT to support mixed frontend methods seamlessly
router.use((req, res, next) => {
  if (req.method === 'PATCH') req.method = 'PUT';
  next();
});

router.post('/login', adminLogin);

// Protected Routes
router.get('/me', requireAdmin, getAdminProfile);
router.get('/dashboard', requireAdmin, getDashboardStats);
router.get('/users', requireAdmin, getAdminUsers);
router.get('/users/:id/profile', requireAdmin, getUserProfile);
router.get('/users/:id/addresses', requireAdmin, getUserAddresses);
// Orders
router.get('/orders', requireAdmin, getAdminOrders);
router.post('/orders', requireAdmin, createAdminOrder);
router.patch('/orders/:id', requireAdmin, updateOrder);
router.delete('/orders/:id', requireAdmin, deleteOrder);

// Reservations
router.get('/reservations', requireAdmin, getAdminReservations);
router.patch('/reservations/:id', requireAdmin, updateReservation);
router.delete('/reservations/:id', requireAdmin, deleteReservation);

// Reviews & Inquiries
// Reviews (Products)
router.get('/reviews', requireAdmin, getAdminReviews);
router.delete('/reviews/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.review.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Site Reviews
router.get('/site-reviews', requireAdmin, async (req, res) => {
  try {
    const reviews = await prisma.siteReview.findMany({ orderBy: { displayOrder: 'asc' } });
    res.json({ reviews });
  } catch (error) { res.status(500).json({ error: error.message }); }
});
router.post('/site-reviews', requireAdmin, async (req, res) => {
  try {
    const { _id, ...data } = req.body;
    const review = await prisma.siteReview.create({ data });
    res.json(review);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
router.patch('/site-reviews/:id', requireAdmin, async (req, res) => {
  try {
    const { _id, ...data } = req.body;
    const review = await prisma.siteReview.update({ where: { id: req.params.id }, data });
    res.json(review);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
router.delete('/site-reviews/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.siteReview.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});
router.get('/inquiries', requireAdmin, getAdminInquiries);
router.put('/inquiries/:id', requireAdmin, updateAdminInquiry);
router.delete('/inquiries/:id', requireAdmin, deleteAdminInquiry);

// Products
router.get('/products', requireAdmin, getPublicProducts);
router.post('/products', requireAdmin, createProduct);
router.put('/products/:id', requireAdmin, updateProduct);
router.delete('/products/:id', requireAdmin, deleteProduct);
router.get('/settings/product-config', requireAdmin, async (req, res) => {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'product_config' } });
    if (setting) {
      res.json(JSON.parse(setting.value));
    } else {
      res.json({ categories: [], storageTypes: [] });
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/settings/product-config', requireAdmin, async (req, res) => {
  try {
    const { categories, storageTypes } = req.body;
    await prisma.siteSetting.upsert({
      where: { key: 'product_config' },
      update: { value: JSON.stringify({ categories, storageTypes }) },
      create: { key: 'product_config', value: JSON.stringify({ categories, storageTypes }) }
    });
    res.json({ categories, storageTypes });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Promotions (Coupons & Banners)
router.get('/coupons', requireAdmin, getCoupons);
router.post('/coupons', requireAdmin, createCoupon);
router.patch('/coupons/:id', requireAdmin, updateCoupon);
router.delete('/coupons/:id', requireAdmin, deleteCoupon);

router.get('/shop-banners', requireAdmin, getBanners);
router.post('/shop-banners', requireAdmin, createBanner);
router.patch('/shop-banners/:id', requireAdmin, updateBanner);
router.delete('/shop-banners/:id', requireAdmin, deleteBanner);

router.get('/banners', requireAdmin, getBanners);
router.post('/banners', requireAdmin, createBanner);
router.patch('/banners/:id', requireAdmin, updateBanner);
router.delete('/banners/:id', requireAdmin, deleteBanner);

import prisma from '../utils/prisma.mjs';

// Recipes
router.get('/recipes', requireAdmin, getAllRecipes);
router.post('/recipes', requireAdmin, async (req, res) => {
  try {
    const { _id, ...data } = req.body;
    const recipe = await prisma.recipe.create({ data });
    res.status(201).json({ recipe });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/recipes/:id', requireAdmin, async (req, res) => {
  try {
    const { _id, ...data } = req.body;
    const recipe = await prisma.recipe.update({ where: { id: req.params.id }, data });
    res.json({ recipe });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/recipes/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.recipe.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Careers
router.get('/careers', requireAdmin, async (req, res) => {
  const jobs = await prisma.career.findMany();
  res.json({ jobs });
});
router.post('/careers', requireAdmin, async (req, res) => {
  try {
    const { _id, ...data } = req.body;
    const job = await prisma.career.create({ data });
    res.status(201).json({ job });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.patch('/careers/:id', requireAdmin, async (req, res) => {
  try {
    const { _id, ...data } = req.body;
    const career = await prisma.career.update({ where: { id: req.params.id }, data });
    res.json(career);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
router.put('/careers/:id', requireAdmin, async (req, res) => {
  try {
    const { _id, ...data } = req.body;
    const career = await prisma.career.update({ where: { id: req.params.id }, data });
    res.json(career);
  } catch (error) { res.status(500).json({ error: error.message }); }
});
router.delete('/careers/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.career.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Applications
router.get('/applications', requireAdmin, async (req, res) => {
  try {
    const { jobId } = req.query;
    const filter = jobId ? { careerId: jobId } : {};
    const applications = await prisma.application.findMany({ where: filter });
    res.json({ applications: applications.map(a => ({ ...a, _id: a.id })) });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/applications/:id', requireAdmin, async (req, res) => {
  try {
    const { _id, ...data } = req.body;
    const application = await prisma.application.update({ where: { id: req.params.id }, data });
    res.json({ application: { ...application, _id: application.id } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/applications/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.application.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Payments
router.get('/payments', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const filter = status ? { status } : {};
    
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: filter,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum
      }),
      prisma.payment.count({ where: filter })
    ]);
    res.json({ payments: payments.map(p => ({ ...p, _id: p.id })), pagination: { total } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/payments/:id', requireAdmin, async (req, res) => {
  try {
    const { _id, ...data } = req.body;
    const payment = await prisma.payment.update({ where: { id: req.params.id }, data });
    res.json({ payment });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/payments', requireAdmin, async (req, res) => {
  try {
    const { _id, ...data } = req.body;
    const payment = await prisma.payment.create({ data });
    res.status(201).json({ payment });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

import { generatePresignedUrl } from '../utils/s3.mjs';

// File Uploads
// Recipes (Admin CRUD)
router.get('/recipes', requireAdmin, getAllRecipes);
router.post('/recipes', requireAdmin, createRecipe);
router.patch('/recipes/:id', requireAdmin, updateRecipe);
router.delete('/recipes/:id', requireAdmin, deleteRecipe);

// Pincodes (Admin CRUD)
router.get('/pincodes', requireAdmin, getPincodes);
router.post('/pincodes', requireAdmin, addPincode);
router.delete('/pincodes/:id', requireAdmin, deletePincode);

// Payments (Admin CRUD)
router.get('/payments', requireAdmin, getAdminPayments);
router.post('/payments', requireAdmin, createAdminPayment);
router.patch('/payments/:id', requireAdmin, updatePaymentStatus);

router.post('/uploads/presign', requireAdmin, async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) return res.status(400).json({ error: "filename and contentType are required" });
    const { presignedUrl, publicUrl } = await generatePresignedUrl(filename, contentType);
    res.json({ uploadUrl: presignedUrl, publicUrl });
  } catch (error) {
    console.error("S3 Presign Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy upload to bypass frontend CORS!
import express from 'express';
import { uploadToS3Direct } from '../utils/s3.mjs';

router.put('/uploads/proxy', express.raw({ type: '*/*', limit: '50mb' }), async (req, res) => {
  try {
    const { key, contentType } = req.query;
    if (!key || !contentType) return res.status(400).json({ error: "Missing key or contentType" });
    
    await uploadToS3Direct(key, req.body, contentType);
    res.json({ success: true });
  } catch (error) {
    console.error("S3 Proxy Upload Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Menu
router.get('/menu', requireAdmin, async (req, res) => {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'cafe_menu_url' } });
    res.json({ menuUrl: setting?.value || "" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/menu', requireAdmin, async (req, res) => {
  try {
    const { menuUrl } = req.body;
    await prisma.siteSetting.upsert({
      where: { key: 'cafe_menu_url' },
      update: { value: menuUrl },
      create: { key: 'cafe_menu_url', value: menuUrl }
    });
    res.json({ success: true, menuUrl });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
