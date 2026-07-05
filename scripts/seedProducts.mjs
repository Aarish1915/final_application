import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';

let MONGO_URL;
try {
  const dotenv = await import('dotenv');
  dotenv.config();
  MONGO_URL = process.env.mongo_url;
} catch (e) {
  try {
    const envRaw = readFileSync(new URL('../.env', import.meta.url));
    const envText = envRaw.toString();
    for (const line of envText.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [k, ...rest] = trimmed.split('=');
      if (!k) continue;
      const key = k.trim();
      const val = rest.join('=').trim().replace(/^"|"$/g, '').replace(/^'|'$/g, '');
      if (key === 'mongo_url' || key === 'MONGO_URL') {
        MONGO_URL = val;
        break;
      }
    }
  } catch (err) {}
}

if (!MONGO_URL) {
  console.error('Missing mongo_url in .env');
  process.exit(1);
}

const sampleProducts = [
  { name: 'Saag', category: 'Base', price: 319, image: '/images/PRODUCTS/Screenshot 2026-02-12 171007.png', rating: 4.5, description: 'Classic saag preparation', inStock: true, featured: false },
  { name: 'Green Mint Chutney', category: 'Condiment', price: 199, image: '/images/PRODUCTS/Screenshot 2026-02-12 170910.png', rating: 4.3, description: 'Fresh mint chutney', inStock: true, featured: false },
  { name: 'Kacchi Kathal Biryani', category: 'Main Course', price: 449, image: '/images/PRODUCTS/Screenshot 2026-02-12 170922.png', rating: 4.8, description: 'Jackfruit biryani', inStock: true, featured: true },
  { name: 'Paneer Butter Curry', category: 'Gravy', price: 389, image: '/images/PRODUCTS/Screenshot 2026-02-12 170930.png', rating: 4.6, description: 'Paneer in butter curry', inStock: true, featured: false },
  { name: 'Kolkata Curry', category: 'Gravy', price: 359, image: '/images/PRODUCTS/Screenshot 2026-02-12 170939.png', rating: 4.5, description: 'Kolkata-style curry', inStock: true, featured: false },
  { name: 'Instant Pasta Sauce', category: 'Sauce', price: 249, image: '/images/PRODUCTS/Screenshot 2026-02-12 170951.png', rating: 4.2, description: 'Quick pasta sauce', inStock: true, featured: false },
  { name: 'Foonee Seasons', category: 'Seasoning', price: 179, image: '/images/PRODUCTS/Screenshot 2026-02-12 170958.png', rating: 4.3, description: 'Signature seasoning blend', inStock: true, featured: false },
  { name: 'Tomato Makhini Gravy (Frozen)', category: 'Frozen', price: 349, image: '/images/PRODUCTS/Screenshot 2026-02-12 170910.png', rating: 4.5, description: 'Frozen makhani gravy', inStock: true, featured: false },
  { name: 'Frozen Saag Base', category: 'Frozen', price: 299, image: '/images/PRODUCTS/Screenshot 2026-02-12 170930.png', rating: 4.4, description: 'Frozen saag base', inStock: true, featured: false },
  // ...add 31 more products with unique names, categories, images, prices, ratings, descriptions...
];

for (let i = 10; i < 40; i++) {
  sampleProducts.push({
    name: `Sample Product ${i+1}`,
    category: ['Base','Condiment','Main Course','Gravy','Sauce','Seasoning','Frozen'][i%7],
    price: 100 + (i*10),
    image: `/images/PRODUCTS/sample${i+1}.png`,
    rating: 4 + (i%5)*0.1,
    description: `Sample description for product ${i+1}`,
    inStock: true,
    featured: i%8===0
  });
}

async function main() {
  const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  const db = client.db('ingri_museo');
  const collection = db.collection('products');
  await collection.deleteMany({});
  const res = await collection.insertMany(sampleProducts);
  console.log(`Seeded ${res.insertedCount} products.`);
  await client.close();
}

main().catch(err => { console.error(err); process.exit(1); });
