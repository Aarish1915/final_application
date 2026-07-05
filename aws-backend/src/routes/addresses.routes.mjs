import { Router } from 'express';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../controllers/addresses.controller.mjs';
import { requireAuth } from '../middlewares/auth.middleware.mjs';

const router = Router();

router.use(requireAuth);

router.get('/', getAddresses);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export default router;
