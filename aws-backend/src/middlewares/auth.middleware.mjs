import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is required. Generate one with: node -e "console.log(require(\"crypto\").randomBytes(32).toString(\"hex\"))"');

export const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const token = authHeader.split(" ")[1];
    
    // Verify cryptographic signature
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.userId && !payload.id) payload.id = payload.userId;

    if (!payload.isAdmin) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    req.admin = payload; // Attach to request for controllers to use
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    const token = authHeader.split(" ")[1];
    
    const payload = jwt.verify(token, JWT_SECRET);
    
    req.user = payload; // Attach to request
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};
