import cron from 'node-cron';
import prisma from '../utils/prisma.mjs';
import Razorpay from 'razorpay';
import logger from '../utils/logger.mjs';
import { finalizeInventory } from '../services/inventory.service.mjs';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

// Run every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  try {
    logger.info('Running Razorpay polling cron job...');
    
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'pending',
        createdAt: {
          lte: fiveMinutesAgo,
          gte: twoDaysAgo
        }
      },
      include: { items: true }
    });

    if (pendingOrders.length === 0) {
      logger.info('No pending orders to verify.');
      return;
    }

    logger.info(`Found ${pendingOrders.length} pending orders. Verifying with Razorpay...`);

    for (const order of pendingOrders) {
      // Order ID in our DB is the Razorpay Order ID for online orders
      if (!order.orderId.startsWith('order_')) continue;

      try {
        const rpOrder = await razorpay.orders.fetch(order.orderId);
        
        if (rpOrder.status === 'paid') {
          logger.info(`Order ${order.orderId} was paid on Razorpay but pending in DB. Fixing...`);
          
          await prisma.order.update({
            where: { id: order.id },
            data: { status: 'paid' }
          });

          // Create payment record for admin dashboard
          const payments = await razorpay.orders.fetchPayments(order.orderId);
          const successfulPayment = payments.items.find(p => p.status === 'captured');
          
          if (successfulPayment) {
             const existingPayment = await prisma.payment.findFirst({ where: { transactionId: successfulPayment.id } });
             if (!existingPayment) {
               await prisma.payment.create({
                 data: {
                   orderId: order.id,
                   userId: order.userId || null,
                   amount: order.total,
                   method: 'online',
                   status: 'completed',
                   transactionId: successfulPayment.id,
                   customerName: order.customerName
                 }
               });
             }
          }

          // Finalize inventory
          for (const item of order.items) {
            if (item.productId) {
              await finalizeInventory(item.productId, item.quantity).catch(e => logger.error('Cron Inventory Sync Failed:', e));
            }
          }
        }
      } catch (err) {
        logger.error(`Failed to verify order ${order.orderId} with Razorpay`, err);
      }
    }
  } catch (error) {
    logger.error('Payment cron job failed:', error);
  }
});

logger.info('Payment Resilience Cron Job registered.');
