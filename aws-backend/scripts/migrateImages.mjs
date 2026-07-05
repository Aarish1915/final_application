import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import mime from 'mime-types'; // Note: Need to run npm i mime-types
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  endpoint: process.env.AWS_ENDPOINT,
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const PUBLIC_URL_PREFIX = process.env.AWS_ENDPOINT.replace('/s3', '') + `/object/public/${BUCKET_NAME}`;

async function uploadFileToS3(filePath, s3Key) {
  const fileContent = fs.readFileSync(filePath);
  const contentType = mime.lookup(filePath) || 'application/octet-stream';

  const params = {
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: fileContent,
    ContentType: contentType,
    ACL: 'public-read',
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    return `${PUBLIC_URL_PREFIX}/${s3Key}`;
  } catch (error) {
    console.error(`Failed to upload ${s3Key}:`, error);
    return null;
  }
}

async function migrate() {
  console.log('Starting image migration to Supabase S3...');
  
  const products = await prisma.product.findMany();
  console.log(`Found ${products.length} products to process.`);

  const frontendPublicDir = path.resolve(__dirname, '../../public');

  let updatedCount = 0;

  for (const product of products) {
    let needsUpdate = false;
    const updateData = {};

    if (product.image && product.image.startsWith('/images/')) {
      const localPath = path.join(frontendPublicDir, product.image);
      if (fs.existsSync(localPath)) {
        console.log(`Uploading ${product.image}...`);
        const s3Key = `products/${product.id}/${path.basename(product.image)}`;
        const publicUrl = await uploadFileToS3(localPath, s3Key);
        
        if (publicUrl) {
          updateData.image = publicUrl;
          needsUpdate = true;
        }
      } else {
        console.warn(`File not found locally: ${localPath}`);
      }
    }

    if (product.images && product.images.length > 0) {
      const newImages = [];
      let imagesChanged = false;

      for (let i = 0; i < product.images.length; i++) {
        const img = product.images[i];
        if (img.startsWith('/images/')) {
          const localPath = path.join(frontendPublicDir, img);
          if (fs.existsSync(localPath)) {
            console.log(`Uploading extra image ${img}...`);
            const s3Key = `products/${product.id}/extra_${i}_${path.basename(img)}`;
            const publicUrl = await uploadFileToS3(localPath, s3Key);
            if (publicUrl) {
              newImages.push(publicUrl);
              imagesChanged = true;
            } else {
              newImages.push(img); 
            }
          } else {
            console.warn(`File not found locally: ${localPath}`);
            newImages.push(img);
          }
        } else {
           newImages.push(img);
        }
      }

      if (imagesChanged) {
        updateData.images = newImages;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      await prisma.product.update({
        where: { id: product.id },
        data: updateData
      });
      console.log(`Updated product ${product.id} in DB.`);
      updatedCount++;
    }
  }

  console.log(`Migration complete. Updated ${updatedCount} products.`);
}

migrate()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
