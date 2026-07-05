import prisma from '../utils/prisma.mjs';

// GET /admin/coupons
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ coupons });
  } catch (error) { next(error); }
};

// POST /admin/coupons
export const createCoupon = async (req, res, next) => {
  try {
    const { _id, ...data } = req.body;
    if (data.startsAt) data.startsAt = new Date(data.startsAt);
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
    const coupon = await prisma.coupon.create({ data });
    res.status(201).json({ coupon });
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: "Coupon code already exists" });
    res.status(500).json({ error: error.message });
  }
};

// PATCH /admin/coupons/:id
export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { _id, ...data } = req.body;
    if (data.startsAt) data.startsAt = new Date(data.startsAt);
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
    const coupon = await prisma.coupon.update({ where: { id }, data });
    res.json({ coupon });
  } catch (error) { 
    res.status(500).json({ error: error.message });
  }
};

// DELETE /admin/coupons/:id
export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({ where: { id } });
    res.json({ message: "Coupon deleted" });
  } catch (error) { next(error); }
};

// BANNERS & DEALS 
export const getBanners = async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { displayOrder: 'asc' } });
    res.json({ banners });
  } catch (error) { next(error); }
};

export const createBanner = async (req, res, next) => {
  try {
    const { title, image, link, description, active, displayOrder, startsAt, endsAt } = req.body;
    const data = { title, image, link, description, active, displayOrder };
    if (startsAt) data.startsAt = new Date(startsAt);
    if (endsAt) data.endsAt = new Date(endsAt);
    
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
    
    const banner = await prisma.banner.create({ data });
    res.status(201).json({ banner });
  } catch (error) { next(error); }
};

export const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, image, link, description, active, displayOrder, startsAt, endsAt } = req.body;
    const data = { title, image, link, description, active, displayOrder };
    if (startsAt) data.startsAt = new Date(startsAt);
    if (endsAt) data.endsAt = new Date(endsAt);

    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
    
    const banner = await prisma.banner.update({ where: { id }, data });
    res.json({ banner });
  } catch (error) { next(error); }
};

export const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.banner.delete({ where: { id } });
    res.json({ message: "Banner deleted" });
  } catch (error) {
    if (error.code === 'P2025') return res.json({ message: "Banner already deleted" });
    next(error);
  }
};
