import mongoose from "mongoose";

const CatalogSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "catalogSettings",
      unique: true,
    },
    showPriceMin: { type: Boolean, default: true },
    showPriceMax: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.CatalogSettings ||
  mongoose.model("CatalogSettings", CatalogSettingsSchema);
