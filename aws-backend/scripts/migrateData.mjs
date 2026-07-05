import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load env from the root directory where the user put the MONGO_URL
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const prisma = new PrismaClient();

async function migrate() {
  console.log("🚀 Starting Data Migration: MongoDB -> Neon PostgreSQL");

  const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL;
  if (!MONGO_URL) {
    console.error("❌ ERROR: No MongoDB URL found in environment variables!");
    process.exit(1);
  }

  console.log("✅ Connecting to MongoDB...");
  await mongoose.connect(MONGO_URL);
  
  // Define Mongoose Models (Loose schema to just grab everything)
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const Admin = mongoose.model('Admin', new mongoose.Schema({}, { strict: false }));
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  const Reservation = mongoose.model('Reservation', new mongoose.Schema({}, { strict: false }));
  const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

  try {
    // 1. Migrate Users
    console.log("📦 Migrating Users...");
    const users = await User.find().lean();
    for (const u of users) {
      await prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          id: u._id.toString(),
          name: u.name || "Unknown",
          email: u.email,
          passwordHash: u.passwordHash,
          salt: u.salt,
          createdAt: u.createdAt || new Date(),
          updatedAt: u.updatedAt || new Date(),
        }
      });
    }
    console.log(`✅ Migrated ${users.length} Users`);

    // 2. Migrate Admins
    console.log("📦 Migrating Admins...");
    const admins = await Admin.find().lean();
    for (const a of admins) {
      await prisma.admin.upsert({
        where: { email: a.email },
        update: {},
        create: {
          id: a._id.toString(),
          name: a.name || "Admin",
          email: a.email,
          passwordHash: a.passwordHash,
          salt: a.salt,
          role: a.role || 'superadmin',
          createdAt: a.createdAt || new Date(),
          updatedAt: a.updatedAt || new Date(),
        }
      });
    }
    console.log(`✅ Migrated ${admins.length} Admins`);

    // 3. Migrate Products
    console.log("📦 Migrating Products...");
    const products = await Product.find().lean();
    for (const p of products) {
      await prisma.product.upsert({
        where: { id: p._id.toString() },
        update: {},
        create: {
          id: p._id.toString(),
          name: p.name,
          category: p.category,
          price: p.price,
          image: p.image || "",
          rating: p.rating || 0,
          reviews: p.reviews || 0,
          description: p.description || "",
          inStock: p.inStock !== false,
          featured: p.featured === true,
          createdAt: p.createdAt || new Date(),
          updatedAt: p.updatedAt || new Date(),
        }
      });
    }
    console.log(`✅ Migrated ${products.length} Products`);

    // 4. Migrate Reservations
    console.log("📦 Migrating Reservations...");
    const reservations = await Reservation.find().lean();
    for (const r of reservations) {
      await prisma.reservation.upsert({
        where: { id: r._id.toString() },
        update: {},
        create: {
          id: r._id.toString(),
          name: r.name,
          phone: r.phone,
          email: r.email || null,
          date: r.date,
          time: r.time,
          guests: r.guests || 1,
          occasion: r.occasion || null,
          request: r.request || null,
          status: r.status || "pending",
          createdAt: r.createdAt || new Date(),
          updatedAt: r.updatedAt || new Date(),
        }
      });
    }
    console.log(`✅ Migrated ${reservations.length} Reservations`);

    // 5. Migrate Orders
    console.log("📦 Migrating Orders...");
    const orders = await Order.find().lean();
    for (const o of orders) {
      // Create the main order
      const order = await prisma.order.upsert({
        where: { orderId: o.orderId || o._id.toString() },
        update: {},
        create: {
          id: o._id.toString(),
          orderId: o.orderId || o._id.toString(),
          userId: o.userId ? o.userId.toString() : null,
          customerName: o.customerName || "Guest",
          customerEmail: o.customerEmail || null,
          customerPhone: o.customerPhone || null,
          total: o.total || 0,
          status: o.status || "pending",
          orderType: o.orderType || "dine-in",
          notes: o.notes || null,
          createdAt: o.createdAt || new Date(),
          updatedAt: o.updatedAt || new Date(),
        }
      });

      // Insert embedded order items if they exist
      if (o.items && Array.isArray(o.items)) {
        for (const item of o.items) {
          try {
             await prisma.orderItem.create({
                data: {
                  orderId: order.id,
                  productId: item.productId ? item.productId.toString() : null,
                  name: item.name || "Unknown Item",
                  price: item.price || 0,
                  quantity: item.quantity || 1,
                  image: item.image || null
                }
             });
          } catch(e) {
             // Ignore duplicates if re-running
          }
        }
      }
    }
    console.log(`✅ Migrated ${orders.length} Orders`);

    console.log("🎉 All Data Successfully Migrated to Neon Postgres!");

  } catch (error) {
    console.error("❌ Migration Error:", error);
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
}

migrate();
