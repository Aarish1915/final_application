import { jest } from '@jest/globals';
import request from 'supertest';
import crypto from 'crypto';

// Setup Mock Prisma before imports
const mockOrderUpdate = jest.fn().mockResolvedValue({ id: 'ord_123', total: 100, customerName: 'Test' });
const mockPaymentCreate = jest.fn().mockResolvedValue({ id: 'pay_123' });
const mockPaymentFindFirst = jest.fn().mockResolvedValue(null);

jest.unstable_mockModule('../../src/utils/prisma.mjs', () => ({
  default: {
    order: {
      update: mockOrderUpdate
    },
    payment: {
      findFirst: mockPaymentFindFirst,
      create: mockPaymentCreate
    }
  }
}));

const appModule = await import('../../src/app.mjs');
const app = appModule.default;

describe('Razorpay Mobile Callback Tests', () => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'test_secret';
  
  beforeAll(() => {
    process.env.RAZORPAY_KEY_SECRET = secret;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to success page on valid signature', async () => {
    const payload = {
      razorpay_order_id: 'order_abc123',
      razorpay_payment_id: 'pay_def456'
    };
    
    // Generate valid signature
    const body = payload.razorpay_order_id + "|" + payload.razorpay_payment_id;
    const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
    payload.razorpay_signature = signature;

    const res = await request(app)
      .post('/api/orders/verify-callback')
      .type('form')
      .send(payload);

    expect(res.status).toBe(302); // Redirect
    expect(res.header.location).toContain('/order-confirmation/ord_123');
    
    // Verify database updates were called
    expect(mockOrderUpdate).toHaveBeenCalledWith({
      where: { orderId: 'order_abc123' },
      data: { status: 'paid' }
    });
    expect(mockPaymentCreate).toHaveBeenCalled();
  });

  it('should redirect to failure page on invalid signature', async () => {
    const payload = {
      razorpay_order_id: 'order_abc123',
      razorpay_payment_id: 'pay_def456',
      razorpay_signature: 'invalid_signature_here'
    };

    const res = await request(app)
      .post('/api/orders/verify-callback')
      .type('form')
      .send(payload);

    expect(res.status).toBe(302); // Redirect
    expect(res.header.location).toContain('/checkout?error=PaymentVerificationFailed');
    
    // Verify database was NOT updated
    expect(mockOrderUpdate).not.toHaveBeenCalled();
    expect(mockPaymentCreate).not.toHaveBeenCalled();
  });
});
