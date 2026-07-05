import { Router } from 'express';
import { getAdminOrders, checkoutGuest, verifyWebhook, verifyPayment, verifyPaymentCallback, updateOrder, deleteOrder, getMyOrders } from '../controllers/orders.controller.mjs';
import { checkoutLimiter } from '../middlewares/rateLimiter.middleware.mjs';

import { requireAdmin, requireAuth } from '../middlewares/auth.middleware.mjs';

const router = Router();

// Public / Customer Route
router.post('/checkout', checkoutLimiter, checkoutGuest);
router.post('/webhook', verifyWebhook);
router.post('/verify', verifyPayment);
router.post('/verify-callback', verifyPaymentCallback);
router.get('/my-orders', requireAuth, getMyOrders);

// Admin Routes (Protected by requireAdmin)
router.get('/admin', requireAdmin, getAdminOrders);
router.patch('/admin/:id', requireAdmin, updateOrder);
router.delete('/admin/:id', requireAdmin, deleteOrder);

export default router;
