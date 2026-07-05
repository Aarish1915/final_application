/**
 * Seed script — replaces all products in MongoDB with full INGRI product catalog (24 items).
 * Run: node scripts/seed-products.mjs
 */
import mongoose from "mongoose";
import { readFileSync } from "fs";

let mongoUrl;
try {
  const envRaw = readFileSync(new URL("../.env", import.meta.url), "utf-8");
  for (const line of envRaw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const [k, ...rest] = t.split("=");
    const val = rest.join("=").trim().replace(/^["']|["']$/g, "");
    if (k?.trim() === "mongo_url") { mongoUrl = val; break; }
  }
} catch { /* */ }
if (!mongoUrl) { console.error("❌ mongo_url not found in .env"); process.exit(1); }

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  image: { type: String, default: "" },
  rating: { type: Number, default: 0 },
  description: { type: String, default: "" },
  inStock: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

/* ══════════════════════════════════════════════════════════
   Full INGRI Product Catalog — 24 products, 3 categories
   ══════════════════════════════════════════════════════════ */
const products = [
  // ─── Ready-to-Cook / Instant Mixes (10) ───
  {
    name: "Ingri Royal Saffron Biryani Mix",
    category: "Ready-to-Cook",
    price: 349,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=600&fit=crop&q=80",
    rating: 4.8, featured: true, inStock: true,
    description: "A luxurious biryani mix infused with premium Kashmiri saffron threads, whole spices, and slow-roasted aromatics. Just add rice and vegetables for a restaurant-quality dum biryani at home.",
  },
  {
    name: "Ingri Classic Veg Biryani Base",
    category: "Ready-to-Cook",
    price: 299,
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=600&fit=crop&q=80",
    rating: 4.6, featured: false, inStock: true,
    description: "An aromatic vegetable biryani base with caramelised onions, whole garam masala, and a touch of kewra. Perfect for weeknight dinners — ready in under 30 minutes.",
  },
  {
    name: "Ingri Jackfruit Delight Biryani",
    category: "Ready-to-Cook",
    price: 399,
    image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&h=600&fit=crop&q=80",
    rating: 4.9, featured: true, inStock: true,
    description: "An innovative vegetarian biryani featuring tender raw jackfruit layered with saffron rice and whole spices. A signature Ingri creation that rivals the finest dum biryanis.",
  },
  {
    name: "Ingri Rich Makhani Gravy",
    category: "Ready-to-Cook",
    price: 289,
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&h=600&fit=crop&q=80",
    rating: 4.7, featured: true, inStock: true,
    description: "Velvety tomato-butter gravy base with cashew cream and a hint of fenugreek. Zero preservatives — just add paneer, chicken, or vegetables for an authentic makhani experience.",
  },
  {
    name: "Ingri Punjabi Saag Blend",
    category: "Ready-to-Cook",
    price: 319,
    image: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&h=600&fit=crop&q=80",
    rating: 4.6, featured: false, inStock: true,
    description: "Classic sarson ka saag preparation with hand-picked mustard greens, spinach, and bathua. Slow-cooked to perfection with traditional Punjabi spices. Pair with makki ki roti.",
  },
  {
    name: "Ingri Tomato Tadka Curry Base",
    category: "Ready-to-Cook",
    price: 249,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=600&fit=crop&q=80",
    rating: 4.5, featured: false, inStock: true,
    description: "A tangy tomato curry base tempered with mustard seeds, curry leaves, and dried red chillies. Versatile enough for sabzi, dal, or a quick curry — just heat and add your protein.",
  },
  {
    name: "Ingri Sholokar Special Gravy",
    category: "Ready-to-Cook",
    price: 329,
    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600&h=600&fit=crop&q=80",
    rating: 4.7, featured: false, inStock: true,
    description: "A rich, slow-simmered gravy inspired by the royal kitchens of Awadh. Features browned onions, yoghurt, and a secret blend of 12 spices for deep, layered flavour.",
  },
  {
    name: "Ingri Heritage Dal Tadka Mix",
    category: "Ready-to-Cook",
    price: 269,
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=600&fit=crop&q=80",
    rating: 4.6, featured: false, inStock: true,
    description: "A traditional dal tadka base with ghee-roasted cumin, garlic, and dried red chillies. Made with heirloom toor dal sourced from organic farms in Maharashtra.",
  },
  {
    name: "Ingri Traditional Korma Curry Base",
    category: "Ready-to-Cook",
    price: 339,
    image: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&h=600&fit=crop&q=80",
    rating: 4.7, featured: false, inStock: true,
    description: "A Mughlai-style korma base with blanched almonds, poppy seeds, and aromatic spices simmered in a creamy yoghurt sauce. Luxuriously smooth and mildly spiced.",
  },
  {
    name: "Ingri Coastal Coconut Curry Mix",
    category: "Ready-to-Cook",
    price: 299,
    image: "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=600&h=600&fit=crop&q=80",
    rating: 4.5, featured: false, inStock: true,
    description: "A fragrant South Indian curry base with fresh coconut, curry leaves, and Guntur chillies. Inspired by the coastal kitchens of Kerala and Karnataka.",
  },

  // ─── Healthy / Premium Range (7) ───
  {
    name: "Ingri PureHarvest Saag",
    category: "Healthy Range",
    price: 359,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=600&fit=crop&q=80",
    rating: 4.6, featured: true, inStock: true,
    description: "Farm-to-table organic greens blend — no artificial colours, no preservatives, no added sugar. Made with certified organic spinach, fenugreek, and dill from partner farms in Punjab.",
  },
  {
    name: "Ingri CleanLabel Curry Base",
    category: "Healthy Range",
    price: 329,
    image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=600&h=600&fit=crop&q=80",
    rating: 4.5, featured: false, inStock: true,
    description: "A transparent-ingredient curry base with only 6 recognisable components. No hidden additives, no artificial flavours — just honest, clean cooking made simple.",
  },
  {
    name: "Ingri FarmFresh Gravy Mix",
    category: "Healthy Range",
    price: 309,
    image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&h=600&fit=crop&q=80",
    rating: 4.4, featured: false, inStock: true,
    description: "A light, farm-fresh gravy mix made with vine-ripened tomatoes, cold-pressed mustard oil, and hand-ground spices. Low sodium, high flavour.",
  },
  {
    name: "Ingri Natural Spice Fusion",
    category: "Healthy Range",
    price: 279,
    image: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=600&h=600&fit=crop&q=80",
    rating: 4.5, featured: false, inStock: true,
    description: "A wellness-focused spice blend combining turmeric, black pepper, cinnamon, and ashwagandha. Designed for daily use — sprinkle on meals, stir into warm milk, or add to smoothies.",
  },
  {
    name: "Ingri Wholesome Kitchen Series",
    category: "Healthy Range",
    price: 449,
    image: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=600&h=600&fit=crop&q=80",
    rating: 4.7, featured: false, inStock: true,
    description: "A curated trio of our healthiest bases — PureHarvest Saag, CleanLabel Curry, and FarmFresh Gravy — in a single convenient pack. Perfect for health-conscious home cooks.",
  },
  {
    name: "Ingri AyurGrain Biryani Base",
    category: "Healthy Range",
    price: 379,
    image: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&h=600&fit=crop&q=80",
    rating: 4.6, featured: false, inStock: true,
    description: "An Ayurveda-inspired biryani base with millets, brown rice aromatics, and digestive spices like ajwain and fennel. Wholesome, gut-friendly, and deeply satisfying.",
  },
  {
    name: "Ingri VitalVeg Curry Blend",
    category: "Healthy Range",
    price: 299,
    image: "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=600&h=600&fit=crop&q=80",
    rating: 4.5, featured: false, inStock: true,
    description: "A nutrient-dense curry blend packed with moringa, beetroot powder, and amla. Adds vibrant colour and a superfood boost to any vegetable curry.",
  },

  // ─── Spice & Ingredient Series (7) ───
  {
    name: "Ingri Signature Garam Masala",
    category: "Spices",
    price: 249,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=600&fit=crop&q=80",
    rating: 4.8, featured: true, inStock: true,
    description: "A proprietary blend of 14 whole spices — stone-ground in small batches for maximum aroma. Includes black cardamom, mace, star anise, and Malabar pepper.",
  },
  {
    name: "Ingri Stone-Ground Turmeric",
    category: "Spices",
    price: 199,
    image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600&h=600&fit=crop&q=80",
    rating: 4.5, featured: false, inStock: true,
    description: "Single-origin Lakadong turmeric from Meghalaya with 7-9% curcumin content — among the highest in the world. Cold stone-ground to preserve natural oils and potency.",
  },
  {
    name: "Ingri Royal Saffron Threads",
    category: "Spices",
    price: 599,
    image: "https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=600&h=600&fit=crop&q=80",
    rating: 4.9, featured: true, inStock: true,
    description: "Grade-1 Kashmiri Mongra saffron — hand-harvested from the fields of Pampore. Each strand delivers intense colour, aroma, and flavour. Packed in an airtight glass vial.",
  },
  {
    name: "Ingri Fresh Curry Leaf Powder",
    category: "Spices",
    price: 179,
    image: "https://images.unsplash.com/photo-1506368249639-73a05d6f6488?w=600&h=600&fit=crop&q=80",
    rating: 4.4, featured: false, inStock: true,
    description: "Sun-dried and stone-ground curry leaves from organic farms in Tamil Nadu. Retains the vibrant green colour and intense aroma of fresh leaves. A South Indian pantry essential.",
  },
  {
    name: "Ingri Ginger-Garlic Essence Mix",
    category: "Spices",
    price: 219,
    image: "https://images.unsplash.com/photo-1599909533601-aa23d624e902?w=600&h=600&fit=crop&q=80",
    rating: 4.6, featured: false, inStock: true,
    description: "A ready-to-use ginger-garlic paste in dehydrated form — no refrigeration needed. Made from fresh Malabar ginger and Rajasthani garlic, cold-processed to lock in pungency.",
  },
  {
    name: "Ingri Biryani Masala Supreme",
    category: "Spices",
    price: 279,
    image: "https://images.unsplash.com/photo-1607672632458-9eb56696346a?w=600&h=600&fit=crop&q=80",
    rating: 4.7, featured: false, inStock: true,
    description: "A complex biryani spice blend with royal cumin, nutmeg, saffron strands, and dried rose petals. Crafted to deliver the authentic Lucknowi biryani aroma in every grain.",
  },
  {
    name: "Ingri Tandoori Spice Blend",
    category: "Spices",
    price: 229,
    image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&h=600&fit=crop&q=80",
    rating: 4.4, featured: false, inStock: true,
    description: "Smoky, vibrant tandoori masala with Kashmiri chilli, roasted cumin, and a touch of charcoal essence. Perfect for marinades, tikkas, and grilled dishes.",
  },
];

async function seed() {
  await mongoose.connect(mongoUrl, { dbName: "ingri_museo" });
  console.log("✅ Connected to MongoDB");

  const deleted = await Product.deleteMany({});
  console.log(`🗑️  Deleted ${deleted.deletedCount} old products`);

  const inserted = await Product.insertMany(products);
  console.log(`✅ Inserted ${inserted.length} INGRI products:\n`);

  const cats = {};
  inserted.forEach(p => {
    if (!cats[p.category]) cats[p.category] = [];
    cats[p.category].push(p);
  });
  for (const [cat, items] of Object.entries(cats)) {
    console.log(`  📦 ${cat} (${items.length})`);
    items.forEach(p => console.log(`     • ${p.name} — ₹${p.price} [${p._id}]`));
  }

  await mongoose.disconnect();
  console.log("\n🎉 Done! All 24 products seeded.");
}

seed().catch(err => { console.error("❌ Seed failed:", err); process.exit(1); });
