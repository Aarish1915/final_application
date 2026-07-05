import prisma from '../utils/prisma.mjs';

// GET /api/addresses
export const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const addresses = await prisma.address.findMany({
      where: { userId }
    });
    res.status(200).json({ addresses });
  } catch (error) {
    next(error);
  }
};

// POST /api/addresses
export const createAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const data = req.body;
    
    // If this is the first address, make it default
    const count = await prisma.address.count({ where: { userId } });
    const isDefault = data.isDefault || count === 0;

    const address = await prisma.address.create({
      data: {
        userId,
        fullName: data.fullName,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        isDefault
      }
    });

    res.status(201).json({ address });
  } catch (error) {
    next(error);
  }
};

// PUT /api/addresses/:id
export const updateAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const addressId = req.params.id;
    const data = req.body;

    // Verify ownership
    const existing = await prisma.address.findUnique({ where: { id: addressId } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // If making default, unset others
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      });
    }

    const updated = await prisma.address.update({
      where: { id: addressId },
      data: {
        fullName: data.fullName !== undefined ? data.fullName : existing.fullName,
        phone: data.phone !== undefined ? data.phone : existing.phone,
        addressLine1: data.addressLine1 !== undefined ? data.addressLine1 : existing.addressLine1,
        addressLine2: data.addressLine2 !== undefined ? data.addressLine2 : existing.addressLine2,
        city: data.city !== undefined ? data.city : existing.city,
        state: data.state !== undefined ? data.state : existing.state,
        pincode: data.pincode !== undefined ? data.pincode : existing.pincode,
        isDefault: data.isDefault !== undefined ? data.isDefault : existing.isDefault
      }
    });

    res.status(200).json({ address: updated });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/addresses/:id
export const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const addressId = req.params.id;

    const existing = await prisma.address.findUnique({ where: { id: addressId } });
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: 'Address not found' });
    }

    await prisma.address.delete({ where: { id: addressId } });
    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
};
