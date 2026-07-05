import rateLimit from 'express-rate-limit';

// Global Rate Limiter: Protects all standard API routes from spam
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs (Generous for development)
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Checkout Rate Limiter: Strictly protects the Razorpay endpoint from bot abuse
export const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 checkout attempts per minute
  message: { error: 'Checkout rate limit exceeded. Please wait a minute before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});
