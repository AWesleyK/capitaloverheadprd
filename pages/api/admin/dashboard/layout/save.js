// /pages/api/admin/dashboard/layout/save.js
import dbConnect from "../../../../../lib/mongoose";
import User from "../../../../../models/users";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  try {
    await dbConnect();

    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { layout } = req.body;
    if (!Array.isArray(layout)) return res.status(400).json({ error: "Invalid layout format" });

    const isValidLayout = layout.every(key => typeof key === "string");
    if (!isValidLayout) return res.status(400).json({ error: "Each layout item must be a string" });

    user.dashboardLayout = layout;
    await user.save();

    res.status(200).json({ message: "Layout saved" });
  } catch (err) {
    console.error("SAVE layout error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
