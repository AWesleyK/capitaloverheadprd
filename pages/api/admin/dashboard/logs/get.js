// /pages/api/admin/dashboard/logs/get.js
import dbConnect from "../../../../../lib/mongoose";
import SearchLog from "../../../../../models/logs/searchLog";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  try {
    await dbConnect();

    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET); // Just validate token (no user lookup needed)

    const logs = await SearchLog.find({})
      .sort({ timestamp: -1 }) // most recent first
      .limit(50); // limit to most recent 50

    res.status(200).json(logs);
  } catch (err) {
    console.error("GET search logs error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
