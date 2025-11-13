// pages/api/content/site-settings/public.js
import dbConnect from "../../../../lib/mongoose";
import SiteSettings from "../../../../models/settings/siteSettings";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end("Method not allowed");

  try {
    await dbConnect();

    const doc = await SiteSettings.findOne({ key: "siteSettings" }).lean();

    if (!doc) {
      // Could return defaults or null; using null so Footer has fallbacks
      return res.status(200).json(null);
    }

    const { _id, __v, ...safe } = doc;
    res.status(200).json(safe);
  } catch (err) {
    console.error("PUBLIC site-settings error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
