import { Router } from 'express';
import prisma from '../utils/prisma.mjs';
import { createInquiry } from '../controllers/inquiries.controller.mjs';
import { getConfig } from '../controllers/config.controller.mjs';

const router = Router();

// Careers
router.get('/careers', async (req, res) => {
  try {
    const careers = await prisma.career.findMany({ where: { active: true } });
    res.json({ jobs: careers.map(c => ({ ...c, _id: c.id })) });
  } catch (error) { res.status(500).json({ error: error.message }); }
});
router.post('/careers/apply', async (req, res) => {
  try {
    const { jobId, ...rest } = req.body;
    const application = await prisma.application.create({ data: { careerId: jobId, ...rest } });
    res.status(201).json(application);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/settings/product-config', async (req, res) => {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'product_config' } });
    if (setting) {
      res.json(JSON.parse(setting.value));
    } else {
      res.json({ categories: [], storageTypes: [] });
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/site-reviews', async (req, res) => {
  try {
    const reviews = await prisma.siteReview.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' }
    });
    res.json({ reviews });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Coupons
router.post('/coupons/validate', async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    
    if (!coupon || !coupon.active) return res.status(400).json({ error: "Invalid or inactive coupon" });
    if (orderTotal < coupon.minOrderAmount) return res.status(400).json({ error: `Minimum order amount of ₹${coupon.minOrderAmount} required` });
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return res.status(400).json({ error: "Coupon expired" });
    
    let discount = 0;
    if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue;
    } else {
      discount = (orderTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }
    
    res.json({ 
      couponId: coupon.id, 
      code: coupon.code, 
      discount: Math.round(discount), 
      description: coupon.description || '' 
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Reviews (Guest mode enabled)
router.post('/reviews', async (req, res) => {
  try {
    const review = await prisma.review.create({ data: req.body });
    res.status(201).json({ message: "Review submitted successfully!", review: { ...review, _id: review.id } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/reviews/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const sort = req.query.sort || 'newest';

    const orderBy = sort === 'highest' ? { rating: 'desc' } : sort === 'lowest' ? { rating: 'asc' } : { createdAt: 'desc' };

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { user: true }
    });

    const total = await prisma.review.count({ where: { productId } });
    
    // Calculate stats
    const allReviews = await prisma.review.findMany({ where: { productId }, select: { rating: true } });
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    allReviews.forEach(r => {
      if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++;
      sum += r.rating;
    });
    const avgRating = total > 0 ? (sum / total).toFixed(1) : 0;
    const pages = Math.ceil(total / limit);

    res.json({
      reviews: reviews.map(r => ({ ...r, _id: r.id })),
      total,
      avgRating: parseFloat(avgRating),
      ratingCounts,
      pagination: { pages, page, limit }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Banners & Deals
router.get('/deals', async (req, res) => {
  try {
    const deals = await prisma.deal.findMany({ where: { active: true } });
    res.json({ deals: deals.map(d => ({ ...d, _id: d.id })) });
  } catch (error) { res.status(500).json({ error: error.message }); }
});
router.get('/banners', async (req, res) => {
  try {
    const banners = await prisma.banner.findMany({ where: { active: true } });
    res.json({ banners: banners.map(b => ({ ...b, _id: b.id })) });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Mocked Endpoints to prevent 404 HTML crashes
router.get('/shop-banners', (req, res) => res.json({ banners: [] }));
router.get('/site-reviews', (req, res) => res.json({ reviews: [] }));

// Inquiries
router.post('/inquiries', createInquiry);

// Config
router.get('/config', getConfig);

// Menu PDF
router.get('/menu', async (req, res) => {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: 'cafe_menu_url' } });
    res.json({ menuUrl: setting?.value || "" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

export default router;
