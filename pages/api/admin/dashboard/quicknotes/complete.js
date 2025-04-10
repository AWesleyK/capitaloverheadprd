// /pages/api/admin/dashboard/quicknotes/complete.js
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

    // Find the user’s QuickNotes document
    const doc = await QuickNote.findOne({ userId: decoded.id });
    if (!doc) return res.status(404).json({ error: "Notes document not found" });

    const note = doc.notes.id(id); // Mongoose magic to find subdocument by _id
    if (!note) return res.status(404).json({ error: "Note not found" });

    note.completed = !note.completed;
    await doc.save();

    res.status(200).json(note);
  } catch (err) {
    console.error("COMPLETE quick note error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
