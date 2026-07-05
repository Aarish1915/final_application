import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";
dotenv.config();

const region = process.env.AWS_REGION || "ap-south-1";
const bucketName = process.env.AWS_S3_BUCKET_NAME;

export const s3Client = new S3Client({
  region,
  endpoint: process.env.AWS_ENDPOINT || undefined,
  forcePathStyle: !!process.env.AWS_ENDPOINT, // Required for Supabase/MinIO
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const generatePresignedUrl = async (fileName, fileType) => {
  if (!bucketName) {
    throw new Error("AWS_S3_BUCKET_NAME is not configured in .env");
  }

  // Sanitize file name and add timestamp to prevent overwrites
  const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniqueFileName = `${Date.now()}-${safeFileName}`;
  const key = `uploads/${uniqueFileName}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: fileType,
    CacheControl: "max-age=31536000, public",
  });

  // Return a local proxy URL instead of the actual S3 presigned URL to completely bypass CORS!
  const presignedUrl = `/admin/uploads/proxy?key=${encodeURIComponent(key)}&contentType=${encodeURIComponent(fileType)}`;
  
  let publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  if (process.env.AWS_ENDPOINT) {
    if (process.env.AWS_ENDPOINT.includes('supabase.co')) {
      // Convert Supabase S3 endpoint to Supabase Public Object endpoint
      const baseUrl = process.env.AWS_ENDPOINT.replace('/s3', '/object/public');
      publicUrl = `${baseUrl}/${bucketName}/${key}`;
    } else {
      publicUrl = `${process.env.AWS_ENDPOINT}/${bucketName}/${key}`;
    }
  }

  return { presignedUrl, publicUrl, key };
};

export const uploadToS3Direct = async (key, buffer, contentType) => {
  if (!bucketName) throw new Error("AWS_S3_BUCKET_NAME is not configured");
  
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  
  await s3Client.send(command);
};
