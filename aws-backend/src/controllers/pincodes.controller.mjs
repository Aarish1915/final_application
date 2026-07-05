import prisma from '../utils/prisma.mjs';

// Get all pincodes (Admin)
export const getPincodes = async (req, res) => {
  try {
    const pincodes = await prisma.serviceablePincode.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ pincodes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pincodes' });
  }
};

// Add a new pincode (Admin)
export const addPincode = async (req, res) => {
  try {
    const { code, city, state } = req.body;
    if (!code) return res.status(400).json({ error: 'Pincode is required' });

    const exists = await prisma.serviceablePincode.findUnique({ where: { code } });
    if (exists) return res.status(400).json({ error: 'Pincode already exists' });

    const pincode = await prisma.serviceablePincode.create({
      data: { code, city, state, active: true }
    });
    res.status(201).json({ message: 'Pincode added', pincode });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add pincode' });
  }
};

// Delete a pincode (Admin)
export const deletePincode = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.serviceablePincode.delete({ where: { id } });
    res.json({ message: 'Pincode deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete pincode' });
  }
};

// Check if a pincode is serviceable (Public)
export const checkPincode = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'Pincode is required' });

    const pincode = await prisma.serviceablePincode.findUnique({ where: { code } });
    if (!pincode || !pincode.active) {
      return res.status(404).json({ serviceable: false, message: 'We currently do not deliver to this pincode.' });
    }
    
    res.json({ serviceable: true, city: pincode.city, state: pincode.state, message: 'Delivery available!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check pincode' });
  }
};
