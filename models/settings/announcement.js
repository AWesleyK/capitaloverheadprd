import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  message: { type: String, required: true },
  backgroundColor: { type: String, default: "#f59e0b" }, // amber
  enabled: { type: Boolean, default: true },
  expiresAt: { type: Date, default: null },
  version: { type: String, default: "1.0" },
  textColor: { type: String, default: "#ffffff" },
}, { timestamps: true });

export default mongoose.models.Announcement || mongoose.model("Announcement", announcementSchema);
