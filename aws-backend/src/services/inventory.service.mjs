import prisma from '../utils/prisma.mjs';

export async function reserveInventory(productId, qty) {
  return prisma.$transaction(async (tx) => {
    // Ensure enough free stock: quantity - reservedQuantity >= qty
    const updated = await tx.product.updateMany({
      where: {
        id: productId,
        quantity: { gte: qty }
      },
      data: {
        reservedQuantity: { increment: qty }
      }
    });

    if (updated.count === 0) {
      throw new Error('Insufficient stock');
    }
    
    // Also enforce that reservedQuantity does not exceed quantity (safeguard)
    const check = await tx.product.findUnique({ where: { id: productId }});
    if (check.reservedQuantity > check.quantity) {
      throw new Error('Insufficient stock');
    }
    
    return true;
  });
}

export async function finalizeInventory(productId, qty) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id: productId },
      data: {
        quantity: { decrement: qty }
      }
    });

    // If stock hits 0, auto-mark out of stock
    if (updated.quantity <= 0 && updated.inStock) {
      await tx.product.update({
        where: { id: productId },
        data: { inStock: false, quantity: Math.max(0, updated.quantity) }
      });
    }

    return true;
  });
}

export async function releaseInventory(productId, qty) {
  return prisma.product.updateMany({
    where: { 
      id: productId,
      reservedQuantity: { gte: qty }
    },
    data: { reservedQuantity: { decrement: qty } }
  });
}
