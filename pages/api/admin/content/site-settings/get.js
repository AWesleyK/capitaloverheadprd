// pages/api/admin/content/site-settings/get.js
import dbConnect from "../../../../../lib/mongoose";
import User from "../../../../../models/users";
import SiteSettings from "../../../../../models/settings/siteSettings";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end("Method not allowed");

  try {
    await dbConnect();

    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const doc = await SiteSettings.findOne({ key: "siteSettings" }).lean();

    if (!doc) return res.status(200).json(null);

    const { _id, __v, ...safe } = doc;
    res.status(200).json(safe);
  } catch (err) {
    console.error("GET site-settings error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
