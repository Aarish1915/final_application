import mongoose from 'mongoose';
import { readFileSync } from 'fs';

let mongoUrl = process.env.mongo_url || process.env.MONGO_URL;

if (!mongoUrl) {
  try {
    const envRaw = readFileSync(new URL('../.env', import.meta.url), 'utf-8');
    for (const line of envRaw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      const value = rest.join('=').trim().replace(/^["']|["']$/g, '');
      if (key?.trim() === 'mongo_url' || key?.trim() === 'MONGO_URL') {
        mongoUrl = value;
        break;
      }
    }
  } catch {
    // Ignore and fail below.
  }
}

if (!mongoUrl) {
  console.error('Missing mongo_url in .env');
  process.exit(1);
}

const productSchema = new mongoose.Schema({}, { strict: false });
const bannerSchema = new mongoose.Schema({}, { strict: false });
const dealSchema = new mongoose.Schema({}, { strict: false });

const Product = mongoose.model('Product', productSchema, 'products');
const Banner = mongoose.model('Banner', bannerSchema, 'banners');
const Deal = mongoose.model('Deal', dealSchema, 'deals');

function pickProducts(products, count, category) {
  const pool = category ? products.filter((p) => p.category === category) : products;
  const source = pool.length > 0 ? pool : products;
  return source.slice(0, count).map((p) => p._id);
}

async function seedPromotions() {
  await mongoose.connect(mongoUrl, { dbName: 'ingri_museo' });
  console.log('Connected to MongoDB');

  const products = await Product.find({ inStock: { $ne: false } }).sort({ rating: -1, createdAt: -1 }).lean();
  if (products.length < 8) {
    throw new Error('Need at least 8 products to seed 2 banners and 4 deals.');
  }

  const now = new Date();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const banners = [
    {
      title: 'Signature Weekend Pairings',
      image: '/images/PRODUCTS/Screenshot 2026-02-12 170910.png',
      link: '/products',
      description: 'Chef-curated mains and gravies selected for your weekend table.',
      active: true,
      displayOrder: 1,
      startsAt: now,
      endsAt: in90Days,
    },
    {
      title: 'Festival Feast Collection',
      image: '/images/PRODUCTS/Screenshot 2026-02-12 170922.png',
      link: '/products?sort=rating',
      description: 'Premium festive favorites crafted for hosting and gifting moments.',
      active: true,
      displayOrder: 2,
      startsAt: now,
      endsAt: in90Days,
    },
  ];

  const deals = [
    {
      title: 'Best Seller Roundup',
      type: 'scroll',
      active: true,
      content: 'Most-loved picks customers are reordering this week.',
      products: pickProducts(products, 8),
      startsAt: now,
      endsAt: in90Days,
      displayOrder: 1,
    },
    {
      title: 'Ready-to-Cook Favourites',
      type: 'scroll',
      active: true,
      content: 'Fast gourmet solutions from the Ready-to-Cook range.',
      products: pickProducts(products, 8, 'Ready-to-Cook'),
      startsAt: now,
      endsAt: in90Days,
      displayOrder: 2,
    },
    {
      title: 'Healthy Essentials Edit',
      type: 'scroll',
      active: true,
      content: 'Clean-label healthy range picks for everyday wellness cooking.',
      products: pickProducts(products, 8, 'Healthy Range'),
      startsAt: now,
      endsAt: in90Days,
      displayOrder: 3,
    },
    {
      title: 'Spice Pantry Highlights',
      type: 'scroll',
      active: true,
      content: 'Kitchen essentials featuring aromatic small-batch spice blends.',
      products: pickProducts(products, 8, 'Spices'),
      startsAt: now,
      endsAt: in90Days,
      displayOrder: 4,
    },
  ];

  const bannerResults = await Promise.all(
    banners.map((banner) =>
      Banner.updateOne(
        { title: banner.title },
        { $set: banner },
        { upsert: true }
      )
    )
  );

  const dealResults = await Promise.all(
    deals.map((deal) =>
      Deal.updateOne(
        { title: deal.title },
        { $set: deal },
        { upsert: true }
      )
    )
  );

  const insertedBanners = bannerResults.filter((r) => r.upsertedCount > 0).length;
  const insertedDeals = dealResults.filter((r) => r.upsertedCount > 0).length;
  const updatedBanners = bannerResults.length - insertedBanners;
  const updatedDeals = dealResults.length - insertedDeals;

  console.log(`Banners processed: ${bannerResults.length} (inserted: ${insertedBanners}, updated: ${updatedBanners})`);
  console.log(`Deals processed: ${dealResults.length} (inserted: ${insertedDeals}, updated: ${updatedDeals})`);

  await mongoose.disconnect();
  console.log('Promotions seeded successfully.');
}

seedPromotions().catch(async (err) => {
  console.error('Seed promotions failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
