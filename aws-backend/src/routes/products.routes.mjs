import { Router } from 'express';
import { getPublicProducts, getSingleProduct, createProduct, updateProduct, deleteProduct } from '../controllers/products.controller.mjs';
import { cacheMiddleware } from '../middlewares/cache.middleware.mjs';
import { requireAdmin } from '../middlewares/auth.middleware.mjs';

const router = Router();

// Public Routes (Protected by Smart Cache)
router.get('/', cacheMiddleware(86400), getPublicProducts); 
router.get('/:id', cacheMiddleware(86400), getSingleProduct);

// Admin Routes (Protected by Auth)
router.post('/admin', requireAdmin, createProduct);
router.patch('/admin/:id', requireAdmin, updateProduct);
router.delete('/admin/:id', requireAdmin, deleteProduct);

export default router;
