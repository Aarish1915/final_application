import { jest } from '@jest/globals';
import crypto from 'crypto';

// Setup Mock Prisma before imports
const mockTx = {
  product: {
    updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    findUnique: jest.fn().mockResolvedValue({ quantity: 100, reservedQuantity: 1 }),
    update: jest.fn().mockResolvedValue({ quantity: 98, inStock: true })
  }
};

jest.unstable_mockModule('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $transaction: jest.fn(async (callback) => {
        return await callback(mockTx);
      }),
      product: {
        updateMany: jest.fn().mockResolvedValue({ count: 1 })
      }
    }))
  };
});

// Use dynamic imports to ensure mock is applied
const { CheckoutSchema } = await import('../src/validators/checkout.mjs');
const { verifyRazorpaySignature } = await import('../src/utils/razorpay.mjs');
const { reserveInventory, finalizeInventory } = await import('../src/services/inventory.service.mjs');

describe('Checkout and Inventory Tests', () => {
  
  describe('1. Zod Validation (CheckoutSchema)', () => {
    it('should validate a correct checkout payload', () => {
      const validPayload = {
        customerName: 'Aarish Ali',
        customerEmail: 'aarish@example.com',
        customerPhone: '9876543210',
        customerPincode: '122016',
        items: [{
          productId: 'prod_123',
          name: 'Test Product',
          price: 199,
          quantity: 2
        }],
        total: 398,
        orderType: 'delivery'
      };
      const result = CheckoutSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject payload missing items or customerName', () => {
      const invalidPayload = {
        customerEmail: 'missing-name@example.com',
        total: 100
      };
      const result = CheckoutSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      expect(result.error.issues.some(i => i.path.includes('customerName'))).toBe(true);
      expect(result.error.issues.some(i => i.path.includes('items'))).toBe(true);
    });
  });

  describe('2. Razorpay Signature Verification', () => {
    it('should successfully verify a correct signature', () => {
      const secret = 'dummy_secret';
      const body = JSON.stringify({ event: 'payment.captured' });
      // Generate expected signature exactly how Razorpay does
      const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');
      
      const result = verifyRazorpaySignature(body, expectedSignature, secret);
      expect(result).toBe(true);
    });

    it('should fail on tampered payload or wrong secret', () => {
      const secret = 'dummy_secret';
      const body = JSON.stringify({ event: 'payment.captured' });
      const badSignature = 'abcd1234invalid';
      
      const result = verifyRazorpaySignature(body, badSignature, secret);
      expect(result).toBe(false);
    });
  });

  describe('3. Inventory Service (reserve/finalize/release)', () => {
    it('should successfully call reserveInventory', async () => {
      mockTx.product.updateMany.mockResolvedValueOnce({ count: 1 });
      const result = await reserveInventory('prod_123', 2);
      expect(result).toBe(true);
    });
    
    it('should successfully call finalizeInventory', async () => {
      mockTx.product.updateMany.mockResolvedValueOnce({ count: 1 });
      const result = await finalizeInventory('prod_123', 2);
      expect(result).toBe(true);
    });
  });

});
