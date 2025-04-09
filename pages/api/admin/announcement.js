import dbConnect from "../../../lib/mongoose";
import Announcement from "../../../models/settings/announcement";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isAdmin = decoded.roles?.includes("Admin") || decoded.roles?.includes("Owner");
    if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

    await dbConnect();

    if (req.method === "GET") {
      const banner = await Announcement.findOne().sort({ updatedAt: -1 });
      return res.status(200).json({ banner: banner || null });
    }

    if (req.method === "PUT") {
        const { message, backgroundColor, enabled, expiresAt, version, textColor } = req.body;
      
        if (!message || typeof message !== "string") {
          return res.status(400).json({ error: "Invalid message" });
        }
      
        const updated = {
            message: message.trim(),
          backgroundColor: backgroundColor || "#f59e0b",
          enabled: !!enabled,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          version: Date.now().toString(), 
          textColor: textColor || "#ffffff"
        };
      
        await Announcement.findOneAndUpdate({}, updated, { upsert: true });
        return res.status(200).json({ message: "Banner updated" });
      }
      

    return res.status(405).end(); // Method Not Allowed
  } catch (err) {
    console.error("Announcement API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
