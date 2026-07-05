import prisma from '../utils/prisma.mjs';
import crypto from 'crypto';

// GET /admin/payments
export const getAdminPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, startDate, endDate } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    const where = {};
    if (status) where.status = status;
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59.999Z') // include full end day
      };
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        include: { order: true, user: true }
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      payments,
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

// POST /admin/payments
export const createAdminPayment = async (req, res, next) => {
  try {
    const { orderId, amount, method, status, transactionId, customerName } = req.body;
    
    const payment = await prisma.payment.create({
      data: {
        orderId: orderId || undefined,
        amount: parseFloat(amount) || 0,
        method: method || 'cash',
        status: status || 'pending',
        transactionId,
        customerName: customerName || 'Guest'
      }
    });
    res.status(201).json({ payment });
  } catch (error) {
    next(error);
  }
};

// PATCH /admin/payments/:id
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const payment = await prisma.payment.update({
      where: { id },
      data: { status }
    });
    res.json({ payment });
  } catch (error) {
    next(error);
  }
};
