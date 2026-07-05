import NodeCache from 'node-cache';

// Initialize cache globally (data lives in RAM for standard duration)
export const apiCache = new NodeCache({ stdTTL: 86400, checkperiod: 120 }); // 24-hour default

export const cacheMiddleware = (durationInSeconds = 86400) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Use the full URL (including query params) as the unique cache key
    const key = '__express__' + req.originalUrl || req.url;
    const cachedResponse = apiCache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    } else {
      // Overwrite res.json to seamlessly inject the cache saving step
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        apiCache.set(key, body, durationInSeconds);
        originalJson(body);
      };
      next();
    }
  };
};

// Expose a helper to wipe the cache when an Admin updates products
export const clearCache = () => {
  apiCache.flushAll();
  console.log("🧹 Active Cache Invalidation: Memory wiped successfully!");
};
