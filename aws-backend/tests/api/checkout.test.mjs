import { jest } from '@jest/globals';

// Setup Mock Prisma before imports
jest.unstable_mockModule('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $disconnect: jest.fn(),
      serviceablePincode: { findUnique: jest.fn().mockResolvedValue(null) }, // simulates invalid pincode
    }))
  };
});

const request = (await import('supertest')).default;
const app = (await import('../../src/app.mjs')).default;

jest.setTimeout(30000);

describe('POST /api/orders/checkout', () => {

  it('should block checkout if pincode is invalid', async () => {
    const res = await request(app)
      .post('/api/orders/checkout')
      .send({
        customerName: "Test User",
        customerEmail: "test@test.com",
        customerPhone: "9999999999",
        customerPincode: "999999", // Invalid pincode
        total: 500,
        orderType: "delivery",
        items: [{ name: "Cake", price: 500, quantity: 1 }]
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Sorry, we do not deliver to pincode 999999 yet.");
  });
});
