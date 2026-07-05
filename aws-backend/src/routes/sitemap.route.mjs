import express from 'express';
import { getSitemap } from '../controllers/sitemap.controller.mjs';

const router = express.Router();

router.get('/', getSitemap);

export default router;
