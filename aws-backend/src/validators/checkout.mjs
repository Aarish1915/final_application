import { z } from 'zod';

export const CheckoutSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerPhone: z.string().optional().or(z.literal('')),
  customerAddress: z.string().optional().or(z.literal('')),
  customerPincode: z.string().optional().or(z.literal('')),
  items: z.array(z.object({
    productId: z.string().nullable().optional(),
    _id: z.string().optional(),
    name: z.string(),
    price: z.number().nonnegative(),
    quantity: z.number().int().min(1),
    image: z.string().optional()
  })).min(1, 'At least one item is required'),
  total: z.number().nonnegative(),
  orderType: z.enum(['delivery','dine-in', 'dine_in', 'takeaway']).optional(),
  notes: z.string().optional()
});
