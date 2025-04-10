// /pages/api/admin/dashboard/quicknotes/clear-completed.js

import dbConnect from "../../../../../lib/mongoose";
import QuickNote from "../../../../../models/dashboard/quicknotes";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  try {
    await dbConnect();

    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await QuickNote.updateOne(
      { userId: decoded.id },
      { $pull: { notes: { completed: true } } }
    );

    const updated = await QuickNote.findOne({ userId: decoded.id });
    res.status(200).json({ success: true, modifiedCount: result.modifiedCount, notes: updated.notes });
  } catch (err) {
    console.error("CLEAR completed notes error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
