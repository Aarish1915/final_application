import { PrismaClient } from '@prisma/client';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import mongoose from 'mongoose';

const prisma = new PrismaClient();

// ==========================================
// 1. DYNAMODB CONFIGURATION (For Users, Orders, Addresses)
// ==========================================
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'INSERT_YOUR_ACCESS_KEY',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'INSERT_YOUR_SECRET_KEY'
  }
});

// ==========================================
// 2. MONGODB CONFIGURATION (For Cafe Reservations)
// ==========================================
const MONGO_URI = process.env.MONGO_URI || "INSERT_YOUR_MONGODB_URI_HERE";

async function migrateUsers() {
  console.log("🚀 Starting User Migration from DynamoDB...");
  
  // NOTE: You must replace 'YourUsersTableName' with your actual DynamoDB table name
  const command = new ScanCommand({ TableName: 'YourUsersTableName' });
  
  try {
    const response = await dynamoClient.send(command);
    const users = response.Items || [];
    
    for (const item of users) {
      // Safely extract DynamoDB attributes (.S for String, etc)
      const email = item.email?.S;
      const name = item.name?.S || "Migrated User";
      const passwordHash = item.passwordHash?.S || "legacy_hash";
      const salt = item.salt?.S || "legacy_salt";
      
      if (email) {
        await prisma.user.upsert({
          where: { email },
          update: {},
          create: { email, name, passwordHash, salt }
        });
      }
    }
    console.log(`✅ Migrated ${users.length} users successfully!`);
  } catch (error) {
    console.error("❌ Failed to migrate Users. Check your AWS credentials.", error.message);
  }
}

async function migrateReservations() {
  console.log("🚀 Starting Reservation Migration from MongoDB...");
  
  try {
    if (MONGO_URI.includes("INSERT_YOUR")) {
      throw new Error("MongoDB URI is missing.");
    }

    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    
    // NOTE: Replace 'reservations' with your actual MongoDB collection name
    const reservations = await db.collection('reservations').find({}).toArray();
    
    for (const res of reservations) {
      await prisma.reservation.create({
        data: {
          name: res.name || "Unknown",
          phone: res.phone || "Unknown",
          email: res.email || null,
          reservationAt: new Date(res.date || Date.now()),
          guests: res.guests || 2,
          status: res.status || 'pending',
          occasion: res.occasion || null
        }
      });
    }
    console.log(`✅ Migrated ${reservations.length} reservations successfully!`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Failed to migrate Reservations.", error.message);
  }
}

async function runMigration() {
  console.log("==========================================");
  console.log("   INGRI LEGACY DATA MIGRATION SCRIPT");
  console.log("==========================================\n");
  
  console.log("⚠️  WARNING: Ensure your AWS keys and Mongo URI are inserted in this file or .env\n");
  
  await migrateUsers();
  await migrateReservations();
  
  await prisma.$disconnect();
  console.log("\n🎉 Migration process completed.");
}

runMigration();
