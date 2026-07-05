import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const seedRecipes = async () => {
  try {
    const tsPath = path.resolve(__dirname, '../../src/data/recipesData.ts');
    let content = fs.readFileSync(tsPath, 'utf-8');
    
    // Extract the array part
    const match = content.match(/export const recipes: Recipe\[\] = (\[.*\]);/s);
    if (!match) throw new Error('Could not find recipes array');
    
    let arrayStr = match[1];
    
    // Evaluate the object array string
    const recipes = eval(arrayStr);

    console.log('Clearing old recipes...');
    await prisma.recipe.deleteMany({});

    console.log('Seeding Recipes...');
    for (const r of recipes) {
      await prisma.recipe.create({ data: r });
    }
    console.log(`✅ ${recipes.length} Recipes seeded successfully!`);
  } catch (error) {
    console.error('Error seeding recipes:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedRecipes();
