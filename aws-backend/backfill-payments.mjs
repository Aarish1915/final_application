import prisma from './src/utils/prisma.mjs';

async function main() {
  console.log("Starting Payment backfill...");
  
  // Find all orders that are paid
  const paidOrders = await prisma.order.findMany({
    where: { status: 'paid' },
    include: { payments: true }
  });
  
  let count = 0;
  for (const order of paidOrders) {
    if (order.payments.length === 0) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          userId: order.userId || null,
          amount: order.total,
          method: "online",
          status: "completed",
          transactionId: "backfilled_" + Date.now(),
          customerName: order.customerName
        }
      });
      console.log(`Created payment for order ${order.orderId} (Total: ${order.total})`);
      count++;
    }
  }
  
  console.log(`Backfill complete. Created ${count} payment records.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
