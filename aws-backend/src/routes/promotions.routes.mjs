import { Router } from 'express';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, getBanners, createBanner, updateBanner, deleteBanner } from '../controllers/promotions.controller.mjs';
import { requireAdmin } from '../middlewares/auth.middleware.mjs';

const router = Router();

// Admin Routes (Coupons)
router.get('/admin/coupons', requireAdmin, getCoupons);
router.post('/admin/coupons', requireAdmin, createCoupon);
router.patch('/admin/coupons/:id', requireAdmin, updateCoupon);
router.delete('/admin/coupons/:id', requireAdmin, deleteCoupon);

// Admin Routes (Banners)
router.get('/admin/banners', requireAdmin, getBanners);
router.post('/admin/banners', requireAdmin, createBanner);
router.patch('/admin/banners/:id', requireAdmin, updateBanner);
router.delete('/admin/banners/:id', requireAdmin, deleteBanner);

export default router;
