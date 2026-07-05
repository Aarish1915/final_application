import prisma from '../utils/prisma.mjs';

// GET /admin/reservations
export const getAdminReservations = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, date } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    const where = {};
    if (status) where.status = status;
    if (date) where.date = date;

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        orderBy: [
          { reservationAt: 'desc' }
        ],
        skip: (pageNum - 1) * limitNum,
        take: limitNum
      }),
      prisma.reservation.count({ where })
    ]);

    const mappedReservations = reservations.map(r => {
      let date = "";
      let time = "";
      if (r.reservationAt) {
        const iso = new Date(r.reservationAt).toISOString();
        date = iso.split('T')[0];
        time = iso.split('T')[1].substring(0, 5);
      }
      return {
        ...r,
        _id: r.id,
        date,
        time
      };
    });

    res.json({
      reservations: mappedReservations,
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

// POST /api/reservations (Public booking)
export const createReservation = async (req, res, next) => {
  try {
    const { name, phone, email, date, time, guests, occasion, request } = req.body;
    
    if (!name || !phone || !date || !time || !guests) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    // Combine date and time strings into a proper JS Date object
    const reservationAt = new Date(`${date}T${time}:00Z`);

    const reservation = await prisma.reservation.create({
      data: {
        name,
        phone,
        email: email || "",
        reservationAt,
        guests: parseInt(guests, 10),
        occasion: occasion || "",
        request: request || "",
        status: "pending"
      }
    });

    res.status(201).json({ reservation });
  } catch (error) {
    next(error);
  }
};

// PATCH /admin/reservations/:id
export const updateReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const reservation = await prisma.reservation.update({
      where: { id },
      data: updateData
    });

    res.json({ reservation });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: "Reservation not found" });
    next(error);
  }
};

// DELETE /admin/reservations/:id
export const deleteReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.reservation.delete({ where: { id } });
    res.json({ message: "Reservation deleted" });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: "Reservation not found" });
    next(error);
  }
};
