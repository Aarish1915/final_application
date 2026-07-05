import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Starting Database Seed for Neon Postgres...");

  const fakeProducts = [
    {
      name: "Classic Espresso",
      category: "Beverages",
      price: 3.50,
      image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=500&q=60",
      rating: 4.8,
      reviews: 120,
      description: "Rich, full-bodied espresso shot perfect for starting your day.",
      inStock: true,
      featured: true
    },
    {
      name: "Chocolate Lava Cake",
      category: "Desserts",
      price: 6.99,
      image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=500&q=60",
      rating: 4.9,
      reviews: 85,
      description: "Warm chocolate cake with a molten fudge center.",
      inStock: true,
      featured: true
    },
    {
      name: "Avocado Toast",
      category: "Breakfast",
      price: 8.50,
      image: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=500&q=60",
      rating: 4.5,
      reviews: 45,
      description: "Fresh avocado on sourdough bread with a dash of chili flakes.",
      inStock: true,
      featured: false
    },
    {
      name: "Iced Matcha Latte",
      category: "Beverages",
      price: 5.00,
      image: "https://images.unsplash.com/photo-1536411396596-af5a1215b4bc?auto=format&fit=crop&w=500&q=60",
      rating: 4.7,
      reviews: 210,
      description: "Premium ceremonial matcha blended with oat milk over ice.",
      inStock: true,
      featured: true
    },
    {
      name: "Blueberry Muffin",
      category: "Bakery",
      price: 3.75,
      image: "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&w=500&q=60",
      rating: 4.6,
      reviews: 32,
      description: "Freshly baked muffin bursting with wild blueberries.",
      inStock: true,
      featured: false
    }
  ];

  try {
    for (const product of fakeProducts) {
      await prisma.product.create({
        data: product
      });
      console.log(`✅ Inserted: ${product.name}`);
    }
    console.log("🎉 Seeding complete! Check your frontend now.");
  } catch (error) {
    console.error("❌ Seeding Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
