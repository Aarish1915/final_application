import { Router } from 'express';
import { login, customerLogin, register, getMe, updateProfile, googleLogin } from '../controllers/auth.controller.mjs';
import { requireAdmin, requireAuth } from '../middlewares/auth.middleware.mjs';

const router = Router();

// Admin Login
router.post('/admin/login', login);

// Admin session verification
router.get('/admin/me', requireAdmin, (req, res) => {
  res.status(200).json({ admin: req.admin });
});

// Customer Routes
router.post('/login', customerLogin);
router.post('/register', register);
router.post('/google', googleLogin);
router.get('/me', requireAuth, getMe);
router.put('/profile', requireAuth, updateProfile);

export default router;
