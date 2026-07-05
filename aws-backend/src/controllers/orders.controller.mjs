import prisma from '../utils/prisma.mjs';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { reserveInventory, finalizeInventory, releaseInventory } from '../services/inventory.service.mjs';
import { CheckoutSchema } from '../validators/checkout.mjs';
import { verifyRazorpaySignature } from '../utils/razorpay.mjs';


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

// GET /admin/orders
export const getAdminOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    const where = {};
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: { items: true, user: true } // Fetch relational data natively
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /admin/orders
export const createAdminOrder = async (req, res, next) => {
  try {
    const { customerName, customerEmail, customerPhone, items, total, status, orderType, notes, shippingAddress } = req.body;
    
    // Generate a unique order ID
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;

    const order = await prisma.order.create({
      data: {
        orderId,
        customerName: customerName || "Guest",
        customerEmail,
        customerPhone,
        customerAddress: shippingAddress?.addressLine1 || "",
        customerPincode: shippingAddress?.pincode || "",
        total: parseFloat(total) || 0,
        status: status || 'pending',
        orderType: orderType || 'dine_in',
        notes,
        items: {
          create: (items || []).map(item => ({
            name: item.name || "Unknown Item",
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity, 10) || 1
          }))
        }
      },
      include: { items: true }
    });
    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders/checkout
export const checkoutGuest = async (req, res, next) => {
  try {
    // 1. Validate Input using Zod
    const parsed = CheckoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input data", details: parsed.error.format() });
    }
    const data = parsed.data;
    
    // 2. Pincode Validation Logic
    if (data.orderType === "delivery" || !data.orderType) {
      const validPincode = await prisma.serviceablePincode.findUnique({ where: { code: data.customerPincode?.trim() } });
      if (!validPincode || !validPincode.active) {
        return res.status(400).json({ error: `Sorry, we do not deliver to pincode ${data.customerPincode || 'blank'} yet.` });
      }
    }

    // 3. Reserve Inventory
    try {
      await Promise.all(data.items.map(async item => {
        const pId = item.productId || item._id;
        if (pId) await reserveInventory(pId, item.quantity);
      }));
    } catch (err) {
      return res.status(400).json({ error: err.message || "Insufficient stock for one or more items." });
    }

    // Generate custom Order ID like ORD + Timestamp + Random
    const orderIdStr = `ORD${Date.now()}${Math.floor(Math.random() * 9000) + 1000}`;

    // 4. Create Razorpay Order
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(data.total * 100), // Convert to paise
      currency: "INR",
      receipt: orderIdStr,
    });

    // 5. Save order to Postgres as 'pending'
    const order = await prisma.order.create({
      data: {
        orderId: rpOrder.id, // Save the actual Razorpay ID so we can verify the webhook
        customerName: data.customerName,
        customerEmail: data.customerEmail || "",
        customerPhone: data.customerPhone || "",
        customerAddress: data.customerAddress || "",
        customerPincode: data.customerPincode || "",
        total: data.total,
        orderType: (data.orderType === "dine-in" ? "dine_in" : data.orderType) || "delivery",
        status: "pending",
        notes: data.notes || "",
        items: {
          create: data.items.map(item => ({
            productId: item.productId || item._id || null, // Map React _id to productId
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            image: item.image || ""
          }))
        }
      },
      include: { items: true }
    });

    res.status(201).json({ order, rpOrder });
  } catch (error) {
    console.error("CHECKOUT CRASH:", JSON.stringify(error, null, 2), error);
    const msg = error?.error?.description || error?.message || "Payment Gateway Error";
    res.status(500).json({ error: msg });
  }
};

// Handle Razorpay Webhook Events
export const verifyWebhook = async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    
    const body = JSON.stringify(req.body);
    const isValid = verifyRazorpaySignature(body, signature, secret);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Handle payment capture
    if (req.body.event === 'payment.captured') {
      const paymentData = req.body.payload.payment.entity;
      const rpOrderId = paymentData.order_id;
      
      // Mark as paid
      const order = await prisma.order.update({
        where: { orderId: rpOrderId },
        data: { status: "paid" },
        include: { items: true }
      });

      // Ensure a payment record is created for the Admin Dashboard
      const existingPayment = await prisma.payment.findFirst({ where: { transactionId: paymentData.id } });
      if (!existingPayment) {
        await prisma.payment.create({
          data: {
            orderId: order.id,
            userId: order.userId || null,
            amount: order.total,
            method: "online",
            status: "completed",
            transactionId: paymentData.id,
            customerName: order.customerName
          }
        });
      }

      // Finalize inventory deduction
      for (const item of order.items) {
        if (item.productId) {
          try {
            await finalizeInventory(item.productId, item.quantity);
          } catch (err) {
            console.error(`Inventory finalize failed for product ${item.productId}:`, err);
            // Ideally trigger an alert here, but we still mark order as paid
          }
        }
      }
    }

    // Handle payment failed / order cancelled
    if (req.body.event === 'payment.failed') {
      const rpOrderId = req.body.payload.payment.entity.order_id;
      const order = await prisma.order.findUnique({ where: { orderId: rpOrderId }, include: { items: true } });
      if (order && order.status === 'pending') {
        for (const item of order.items) {
          if (item.productId) await releaseInventory(item.productId, item.quantity);
        }
      }
    }

    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ error: "Webhook failure" });
  }
};

// POST /api/orders/verify (Manual Frontend Verification)
export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    if (expectedSignature === razorpay_signature) {
      const updatedOrder = await prisma.order.update({
        where: { orderId: razorpay_order_id },
        data: { status: "paid" }
      });

      // Automatically create a Payment record so the Admin Dashboard payments tab is populated
      await prisma.payment.create({
        data: {
          orderId: updatedOrder.id,
          userId: updatedOrder.userId || null,
          amount: updatedOrder.total,
          method: "online",
          status: "completed",
          transactionId: razorpay_payment_id,
          customerName: updatedOrder.customerName
        }
      });

      // Finalize inventory deduction
      const orderForInv = await prisma.order.findUnique({ where: { orderId: razorpay_order_id }, include: { items: true } });
      if (orderForInv) {
        for (const item of orderForInv.items) {
          if (item.productId) {
            try { await finalizeInventory(item.productId, item.quantity); } 
            catch (err) { console.error(`Inventory finalize failed for ${item.productId}:`, err); }
          }
        }
      }

      return res.status(200).json({ success: true, message: "Payment verified", orderId: updatedOrder.id });
    }
    
    return res.status(400).json({ error: "Invalid payment signature" });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
};

// POST /api/orders/verify-callback (Mobile Redirect Verification)
export const verifyPaymentCallback = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

    const clientUrl = process.env.FRONTEND_URL || "https://final-application-green.vercel.app";

    if (expectedSignature === razorpay_signature) {
      const updatedOrder = await prisma.order.update({
        where: { orderId: razorpay_order_id },
        data: { status: "paid" }
      });

      const existingPayment = await prisma.payment.findFirst({ where: { transactionId: razorpay_payment_id } });
      if (!existingPayment) {
        await prisma.payment.create({
          data: {
            orderId: updatedOrder.id,
            userId: updatedOrder.userId || null,
            amount: updatedOrder.total,
            method: "online",
            status: "completed",
            transactionId: razorpay_payment_id,
            customerName: updatedOrder.customerName
          }
        });
      }

      return res.redirect(`${clientUrl}/order-confirmation/${updatedOrder.id}`);
    }
    
    return res.redirect(`${clientUrl}/checkout?error=PaymentVerificationFailed`);
  } catch (error) {
    console.error("Callback Verification Error:", error);
    const clientUrl = process.env.FRONTEND_URL || "https://final-application-green.vercel.app";
    return res.redirect(`${clientUrl}/checkout?error=ServerFailure`);
  }
};

// GET /api/orders/my-orders
export const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true, payments: true }
    });
    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
};

// PATCH /admin/orders/:id
export const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { items: true }
    });

    res.json({ order });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: "Order not found" });
    next(error);
  }
};

// DELETE /admin/orders/:id
export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Prisma cascade delete will automatically handle items if schema is configured with onDelete: Cascade
    await prisma.order.delete({ where: { id } });
    
    res.json({ message: "Order deleted" });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: "Order not found" });
    next(error);
  }
};
