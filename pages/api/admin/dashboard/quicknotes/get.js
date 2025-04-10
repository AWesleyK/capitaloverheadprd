import dbConnect from "../../../../../lib/mongoose";
import jwt from "jsonwebtoken";
import QuickNotes from "../../../../../models/dashboard/quicknotes";

export default async function handler(req, res) {
  try {
    await dbConnect();

    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const doc = await QuickNotes.findOneAndUpdate(
      { userId: decoded.id },
      { $setOnInsert: { notes: [] } }, // 👈 if it doesn't exist, create with empty array
      { upsert: true, new: true }      // 👈 upsert ensures it's created if missing
    );

    res.status(200).json(doc.notes);
  } catch (err) {
    console.error("GET quick notes error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
