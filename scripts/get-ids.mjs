import mongoose from "mongoose";
import { readFileSync } from "fs";
let mongoUrl;
const envRaw = readFileSync(new URL("../.env", import.meta.url), "utf-8");
for (const line of envRaw.split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const [k, ...rest] = t.split("=");
  const val = rest.join("=").trim();
  if (k?.trim() === "mongo_url") { mongoUrl = val; break; }
}
await mongoose.connect(mongoUrl, { dbName: "ingri_museo" });
const products = await mongoose.connection.db.collection("products").find({}).toArray();
products.forEach(p => console.log(JSON.stringify({ _id: p._id.toString(), name: p.name, category: p.category, price: p.price, image: p.image, rating: p.rating, description: p.description })));
await mongoose.disconnect();
