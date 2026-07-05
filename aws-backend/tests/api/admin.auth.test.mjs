import { jest } from '@jest/globals';
import request from 'supertest';

// Setup Mock Auth Middleware before imports
jest.unstable_mockModule('../../src/middlewares/auth.middleware.mjs', () => ({
  requireAuth: jest.fn((req, res, next) => next()),
  requireAdmin: jest.fn((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === 'Bearer valid-admin-token') {
      req.user = { id: 'admin123', role: 'admin' };
      return next();
    }
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  })
}));

// Mock prisma
jest.unstable_mockModule('../../src/utils/prisma.mjs', () => ({
  default: {
    order: {
      findMany: jest.fn().mockResolvedValue([{ id: 1, total: 100 }]),
      count: jest.fn().mockResolvedValue(1)
    }
  }
}));

const appModule = await import('../../src/app.mjs');
const app = appModule.default;

describe('Admin Route Protection', () => {
  it('should block unauthenticated requests to admin routes', async () => {
    const res = await request(app).get('/api/admin/orders');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Access denied. Admins only.');
  });

  it('should block non-admin requests with invalid tokens', async () => {
    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(403);
  });

  it('should allow valid admin tokens to access routes', async () => {
    const res = await request(app)
      .get('/api/admin/orders')
      .set('Authorization', 'Bearer valid-admin-token');
    
    // It should hit the controller and return the mocked orders (200 OK)
    expect(res.status).toBe(200);
    expect(res.body.orders).toBeDefined();
    expect(res.body.orders.length).toBe(1);
  });
});
