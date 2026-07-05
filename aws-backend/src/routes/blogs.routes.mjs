import { Router } from 'express';
import { getPublicBlogs, getBlogBySlug, getAdminBlogs, createBlog, updateBlog, deleteBlog } from '../controllers/blogs.controller.mjs';
import { requireAdmin } from '../middlewares/auth.middleware.mjs';

const router = Router();

// Admin Routes
router.get('/admin', requireAdmin, getAdminBlogs);
router.post('/admin', requireAdmin, createBlog);
router.patch('/admin/:id', requireAdmin, updateBlog);
router.delete('/admin/:id', requireAdmin, deleteBlog);

// Public Routes
router.get('/', getPublicBlogs);
router.get('/:slug', getBlogBySlug);

export default router;
