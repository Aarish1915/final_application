import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const fallbackProducts = [
  { name: 'Ingri Royal Saffron Biryani Mix', category: 'Ready-to-Cook', price: 349, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=600&fit=crop&q=80', description: 'Luxurious biryani mix with premium Kashmiri saffron' },
  { name: 'Ingri Classic Veg Biryani Base', category: 'Ready-to-Cook', price: 299, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=600&fit=crop&q=80', description: 'Aromatic vegetable biryani base' },
  { name: 'Ingri Jackfruit Delight Biryani', category: 'Ready-to-Cook', price: 399, image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&h=600&fit=crop&q=80', description: 'Innovative vegetarian biryani' },
  { name: 'Ingri Rich Makhani Gravy', category: 'Ready-to-Cook', price: 289, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&h=600&fit=crop&q=80', description: 'Velvety tomato-butter gravy base' },
  { name: 'Ingri Punjabi Saag Blend', category: 'Ready-to-Cook', price: 319, image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&h=600&fit=crop&q=80', description: 'Classic sarson ka saag' },
  { name: 'Ingri Tomato Tadka Curry Base', category: 'Ready-to-Cook', price: 249, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=600&fit=crop&q=80', description: 'Tangy tomato curry base' },
  { name: 'Ingri Sholokar Special Gravy', category: 'Ready-to-Cook', price: 329, image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&h=600&fit=crop&q=80', description: 'Rich slow-simmered gravy' },
  { name: 'Ingri Heritage Dal Tadka Mix', category: 'Ready-to-Cook', price: 269, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=600&fit=crop&q=80', description: 'Traditional dal tadka' },
  { name: 'Ingri Traditional Korma Curry Base', category: 'Ready-to-Cook', price: 339, image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&h=600&fit=crop&q=80', description: 'Mughlai-style korma base' },
  { name: 'Ingri Coastal Coconut Curry Mix', category: 'Ready-to-Cook', price: 299, image: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=600&h=600&fit=crop&q=80', description: 'Fragrant South Indian curry base' },
  { name: 'Ingri PureHarvest Saag', category: 'Healthy Range', price: 359, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=600&fit=crop&q=80', description: 'Farm-to-table organic greens blend' },
  { name: 'Ingri CleanLabel Curry Base', category: 'Healthy Range', price: 329, image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=600&h=600&fit=crop&q=80', description: 'Transparent-ingredient curry base' },
  { name: 'Ingri FarmFresh Gravy Mix', category: 'Healthy Range', price: 309, image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&h=600&fit=crop&q=80', description: 'Light farm-fresh gravy' },
  { name: 'Ingri Natural Spice Fusion', category: 'Healthy Range', price: 279, image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=600&h=600&fit=crop&q=80', description: 'Wellness spice blend' },
  { name: 'Ingri Wholesome Kitchen Series', category: 'Healthy Range', price: 449, image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&h=600&fit=crop&q=80', description: 'Curated trio of our healthiest bases' },
  { name: 'Ingri AyurGrain Biryani Base', category: 'Healthy Range', price: 379, image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&h=600&fit=crop&q=80', description: 'Ayurveda-inspired biryani base' },
  { name: 'Ingri VitalVeg Curry Blend', category: 'Healthy Range', price: 299, image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600&h=600&fit=crop&q=80', description: 'Nutrient-dense curry blend' },
  { name: 'Ingri Signature Garam Masala', category: 'Spices', price: 249, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=600&fit=crop&q=80', description: 'Proprietary blend of 14 whole spices' },
  { name: 'Ingri Stone-Ground Turmeric', category: 'Spices', price: 199, image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&h=600&fit=crop&q=80', description: 'Single-origin Lakadong turmeric' },
  { name: 'Ingri Royal Saffron Threads', category: 'Spices', price: 599, image: 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=600&h=600&fit=crop&q=80', description: 'Grade-1 Kashmiri Mongra saffron' },
  { name: 'Ingri Fresh Curry Leaf Powder', category: 'Spices', price: 179, image: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600&h=600&fit=crop&q=80', description: 'Sun-dried stone-ground curry leaves' },
  { name: 'Ingri Ginger-Garlic Essence Mix', category: 'Spices', price: 219, image: 'https://images.unsplash.com/photo-1599909533601-aa23d624e902?w=600&h=600&fit=crop&q=80', description: 'Ready-to-use dehydrated ginger-garlic paste' },
  { name: 'Ingri Biryani Masala Supreme', category: 'Spices', price: 279, image: 'https://images.unsplash.com/photo-1607672632458-9eb56696346a?w=600&h=600&fit=crop&q=80', description: 'Complex biryani spice blend' },
  { name: 'Ingri Tandoori Spice Blend', category: 'Spices', price: 229, image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&h=600&fit=crop&q=80', description: 'Smoky tandoori masala' }
];

async function seed() {
  let added = 0;
  for (const p of fallbackProducts) {
    const exists = await prisma.product.findFirst({ where: { name: p.name } });
    if (!exists) {
      await prisma.product.create({
        data: {
          name: p.name,
          category: p.category,
          price: p.price,
          mrp: p.price + 100,
          description: p.description,
          image: p.image,
          quantity: 100,
          inStock: true
        }
      });
      added++;
    }
  }
  console.log('Added ' + added + ' missing products to DB');
}
seed().catch(console.error).finally(() => prisma.$disconnect());
