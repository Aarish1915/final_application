import prisma from '../utils/prisma.mjs';

export const getAllRecipes = async (req, res, next) => {
  try {
    const recipes = await prisma.recipe.findMany({ orderBy: { createdAt: 'desc' } });
    res.status(200).json({ recipes });
  } catch (error) {
    next(error);
  }
};

export const getRecipeBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const recipe = await prisma.recipe.findUnique({ where: { slug } });
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.status(200).json({ recipe });
  } catch (error) {
    next(error);
  }
};

export const createRecipe = async (req, res, next) => {
  try {
    const { title, slug, excerpt, content, coverImage, tags, category, status, featured, seoTitle, seoDescription, seoKeywords } = req.body;
    const recipe = await prisma.recipe.create({
      data: { title, slug, excerpt, content, coverImage, tags, category, status, featured, seoTitle, seoDescription, seoKeywords }
    });
    res.status(201).json({ recipe });
  } catch (error) { next(error); }
};

export const updateRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, excerpt, content, coverImage, tags, category, status, featured, seoTitle, seoDescription, seoKeywords } = req.body;
    const recipe = await prisma.recipe.update({
      where: { id },
      data: { title, slug, excerpt, content, coverImage, tags, category, status, featured, seoTitle, seoDescription, seoKeywords }
    });
    res.json({ recipe });
  } catch (error) { next(error); }
};

export const deleteRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.recipe.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) { next(error); }
};
