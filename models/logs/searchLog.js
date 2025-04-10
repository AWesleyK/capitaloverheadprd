// /models/SearchLog.js
import mongoose from "mongoose";

const SearchLogSchema = new mongoose.Schema({
  page: String,
  queryParams: mongoose.Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
  ip: String,
  userAgent: String,
});

export default mongoose.models.SearchLog || mongoose.model("SearchLog", SearchLogSchema);
