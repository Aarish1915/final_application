import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { globalLimiter } from './middlewares/rateLimiter.middleware.mjs';
import dotenv from 'dotenv';
import pinoHttp from 'pino-http';
import logger from './utils/logger.mjs';
import prisma from './utils/prisma.mjs';

dotenv.config();

// Route Imports
import productRoutes from './routes/products.routes.mjs';
import ordersRoutes from './routes/orders.routes.mjs';
import adminRoutes from './routes/admin.routes.mjs';
import pincodesRoutes from './routes/pincodes.routes.mjs';
import reservationRoutes from './routes/reservations.routes.mjs';
import blogRoutes from './routes/blogs.routes.mjs';
import promotionRoutes from './routes/promotions.routes.mjs';
import authRoutes from './routes/auth.routes.mjs';
import addressesRoutes from './routes/addresses.routes.mjs';
import recipesRoutes from './routes/recipes.routes.mjs';
import publicRoutes from './routes/public.routes.mjs';
import sitemapRoutes from './routes/sitemap.route.mjs';

const app = express();

app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    
    const allowedOrigins = ['https://www.ingri.world', 'https://admin.ingri.world', 'https://api.razorpay.com'];
    
    // Temporarily allow Vercel domains for staging environments
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(compression());

app.use('/api/', globalLimiter);

// 2. Body Parsers (with size limits for DOS protection)
app.use(express.json({ limit: '1mb' })); 
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 2.5 Global ID Mapper for Frontend Compatibility
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    const mapIds = (obj) => {
      if (obj === null || typeof obj !== 'object') return obj;
      if (obj instanceof Date) return obj;
      if (Array.isArray(obj)) return obj.map(mapIds);
      const newObj = {};
      for (const key in obj) {
        if (key === 'id') {
          newObj['_id'] = obj[key];
          newObj['id'] = obj[key];
        } else {
          newObj[key] = mapIds(obj[key]);
        }
      }
      return newObj;
    };
    return originalJson.call(this, mapIds(data));
  };
  next();
});

// 3. Health Check Route
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected', time: new Date().toISOString() });
  } catch (error) {
    logger.error('Health check failed: DB disconnected', error);
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

// 4. API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pincodes', pincodesRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api', publicRoutes);
app.use('/sitemap.xml', sitemapRoutes);

// 5. Global Error Handler
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
