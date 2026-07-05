import app from '../src/app.mjs';

// Vercel serverless function entry point
export default (req, res) => {
  // Vercel's /api folder routing strips the '/api' prefix from req.url.
  // We must re-add it so Express can match routes like '/api/products'.
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url === '/' ? '' : req.url}`;
  }
  return app(req, res);
};
