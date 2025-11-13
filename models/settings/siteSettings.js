// models/settings/siteSettings.js
import mongoose from "mongoose";

const SiteSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "siteSettings",
      unique: true,
    },
    email: { type: String },
    phone: { type: String },          // raw digits for tel:
    phoneDisplay: { type: String },   // pretty format for UI
    addressLine1: { type: String },
    addressLine2: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings ||
  mongoose.model("SiteSettings", SiteSettingsSchema);
