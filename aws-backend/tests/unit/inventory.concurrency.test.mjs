import { jest } from '@jest/globals';

// Setup Mock Prisma before imports
const mockTx = {
  product: {
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn()
  }
};

jest.unstable_mockModule('../../src/utils/prisma.mjs', () => ({
  default: {
    $transaction: jest.fn(async (callback) => {
      return await callback(mockTx);
    })
  }
}));

const { reserveInventory } = await import('../../src/services/inventory.service.mjs');

describe('Inventory Concurrency Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully reserve inventory when stock is sufficient', async () => {
    mockTx.product.findUnique.mockResolvedValueOnce({
      id: 'prod_1',
      quantity: 10,
      reservedQuantity: 0
    });
    mockTx.product.updateMany.mockResolvedValueOnce({ count: 1 });

    const result = await reserveInventory('prod_1', 2);
    expect(result).toBe(true);
    expect(mockTx.product.updateMany).toHaveBeenCalledWith({
      where: { id: 'prod_1', quantity: { gte: 2 } },
      data: { reservedQuantity: { increment: 2 } }
    });
  });

  it('should throw an error when stock is insufficient (Race Condition Protection)', async () => {
    // Simulate only 1 item available
    mockTx.product.findUnique.mockResolvedValueOnce({
      id: 'prod_1',
      quantity: 5,
      reservedQuantity: 4 // Only 1 left!
    });
    // Prisma returns 0 updated rows if condition isn't met
    mockTx.product.updateMany.mockResolvedValueOnce({ count: 0 });

    // Try to buy 2
    await expect(reserveInventory('prod_1', 2)).rejects.toThrow('Insufficient stock');
  });
});
