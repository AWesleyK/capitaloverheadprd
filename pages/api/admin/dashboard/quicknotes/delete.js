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
    const { id } = req.body;

    const result = await QuickNote.updateOne(
      { userId: decoded.id },
      { $pull: { notes: { _id: id } } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Note not found" });
    }

    const updated = await QuickNote.findOne({ userId: decoded.id });
    res.status(200).json({ success: true, notes: updated.notes });
  } catch (err) {
    console.error("DELETE quick note error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
