import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

async function testLogin() {
  const email = "admin@ingri.com";
  const password = "password123";

  console.log(`Testing login for ${email}`);
  const admin = await prisma.admin.findUnique({ where: { email } });
  
  if (!admin) {
    console.log("Admin not found in DB!");
    return;
  }
  console.log("Admin found! Salt:", admin.salt);
  console.log("Stored Hash:", admin.passwordHash);

  const computedHash = hashPassword(password, admin.salt);
  console.log("Computed Hash:", computedHash);

  if (computedHash === admin.passwordHash) {
    console.log("✅ MATCH!");
  } else {
    console.log("❌ MISMATCH!");
  }
  
  await prisma.$disconnect();
}

testLogin();
