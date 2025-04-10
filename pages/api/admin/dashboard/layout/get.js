// /pages/api/admin/dashboard/layout/get.js
import dbConnect from "../../../../../lib/mongoose";
import User from "../../../../../models/users";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  try {
    await dbConnect();

    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user.dashboardLayout || []);
  } catch (err) {
    console.error("GET layout error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}