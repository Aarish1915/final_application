import { readFile } from 'fs/promises';
import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';

// Try to load dotenv if available, otherwise fall back to manual .env parsing
let MONGO_URL;
try {
  const dotenv = await import('dotenv');
  dotenv.config();
  MONGO_URL = process.env.mongo_url;
} catch (e) {
  // dotenv not installed or failed — try manual parse of .env
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
  } catch (err) {
    // ignore — will handle below
  }
}

if (!MONGO_URL) {
  console.error('Missing mongo_url in .env — please install dotenv or add mongo_url to .env');
  process.exit(1);
}

async function main() {
  try {
    const dataRaw = await readFile(new URL('./menuData.json', import.meta.url), 'utf-8');
    const data = JSON.parse(dataRaw);

    const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('ingri_museo');
    const collection = db.collection('menu_sections');

    // Replace existing menu
    await collection.deleteMany({});
    if (Array.isArray(data.sections)) {
      const docs = data.sections.map((s) => ({
        ...s,
        createdAt: new Date(),
      }));
      const res = await collection.insertMany(docs);
      console.log(`Inserted ${res.insertedCount} sections`);
    } else {
      console.error('menuData.json missing sections array');
    }

    await client.close();
    console.log('Upload complete, connection closed');
  } catch (err) {
    console.error('Error uploading menu:', err);
    process.exit(1);
  }
}

main();
