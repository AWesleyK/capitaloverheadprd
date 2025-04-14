// /pages/api/admin/announcement.js

import { withAuth } from "../../../../lib/middleware/withAuth";
import dbConnect from "../../../../lib/mongoose";
import Announcement from "../../../../models/settings/announcement";

async function handler(req, res) {
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
      textColor: textColor || "#ffffff",
    };

    await Announcement.findOneAndUpdate({}, updated, { upsert: true });
    return res.status(200).json({ message: "Banner updated" });
  }

  return res.status(405).end();
}

export default withAuth(handler, { roles: ["Admin", "Owner", "User"], minTier: 1 });
