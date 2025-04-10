// /pages/api/admin/dashboard/quicknotes/save.js
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
    const { content } = req.body;

    // Push the note into the user's notes array
    const updated = await QuickNote.findOneAndUpdate(
      { userId: decoded.id },
      {
        $push: {
          notes: {
            content,
            completed: false,
            createdAt: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );

    const addedNote = updated.notes[updated.notes.length - 1];
    res.status(200).json(addedNote);
  } catch (err) {
    console.error("SAVE quick notes error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
