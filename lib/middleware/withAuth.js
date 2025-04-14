// ./lib/middleware/withAuth.js

import jwt from "jsonwebtoken";

export function withAuth(handler, { roles = ["User"], minTier = 1 } = {}) {
  return async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Role-based access control
      if (
        roles.length > 0 &&
        (!decoded.roles || !roles.some((role) => decoded.roles.includes(role)))
      ) {
        return res.status(403).json({ error: "Forbidden: Insufficient role" });
      }

      // Tier-based access control
      if (!decoded.tier || decoded.tier < minTier) {
        return res.status(403).json({ error: "Forbidden: Insufficient tier" });
      }

      req.user = decoded;
      return handler(req, res);
    } catch (err) {
      console.error("Auth error:", err);
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
  };
}
