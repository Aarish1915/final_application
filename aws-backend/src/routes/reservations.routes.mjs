import { Router } from 'express';
import { getAdminReservations, createReservation, updateReservation, deleteReservation } from '../controllers/reservations.controller.mjs';
import { requireAdmin } from '../middlewares/auth.middleware.mjs';

const router = Router();

// Public / Customer Route
router.post('/', createReservation);

// Admin Routes
router.get('/admin', requireAdmin, getAdminReservations);
router.patch('/admin/:id', requireAdmin, updateReservation);
router.delete('/admin/:id', requireAdmin, deleteReservation);

export default router;
