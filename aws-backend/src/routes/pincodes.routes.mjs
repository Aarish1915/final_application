import express from 'express';
import { getPincodes, addPincode, deletePincode, checkPincode } from '../controllers/pincodes.controller.mjs';

const router = express.Router();

// Public route
router.get('/check', checkPincode);

export default router;
