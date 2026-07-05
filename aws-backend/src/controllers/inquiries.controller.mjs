import prisma from '../utils/prisma.mjs';

// POST /api/inquiries
export const createInquiry = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const inquiry = await prisma.inquiry.create({ 
      data: { name, email, phone, subject, message } 
    });
    
    res.status(201).json({ success: true, inquiry });
  } catch (err) {
    console.error('Error creating inquiry:', err);
    res.status(500).json({ error: 'Failed to submit inquiry' });
  }
};
