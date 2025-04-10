// models/dashboard/quicknotes.js

import mongoose from "mongoose";

const noteItemSchema = new mongoose.Schema({
  content: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const quickNotesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  notes: { type: [noteItemSchema], default: [] },
});

export default mongoose.models.QuickNotes || mongoose.model("QuickNotes", quickNotesSchema);
