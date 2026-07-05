import { Router } from 'express';
import { getAllRecipes, getRecipeBySlug } from '../controllers/recipes.controller.mjs';

const router = Router();

router.get('/', getAllRecipes);
router.get('/:slug', getRecipeBySlug);

export default router;
