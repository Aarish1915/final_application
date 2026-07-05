import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const hashPassword = (password, salt) => {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
};

async function seedAdmin() {
  console.log("🔐 Seeding Default Admin User...");

  const email = "admin@ingri.com";
  const password = "password123";
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  try {
    const admin = await prisma.admin.upsert({
      where: { email },
      update: { passwordHash, salt },
      create: {
        name: "Super Admin",
        email,
        passwordHash,
        salt,
        role: "superadmin"
      }
    });
    console.log(`✅ Admin Created! Login with:`);
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${password}`);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
