//./lib/middleware/withAuth.js

import jwt from "jsonwebtoken";

export function withAuth(handler) {
  return async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // attach decoded user info to request
      return handler(req, res);
    } catch (err) {
      console.error("Auth error:", err);
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
  };
}
