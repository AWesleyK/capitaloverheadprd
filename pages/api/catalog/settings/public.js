import dbConnect from "../../../../lib/mongoose";
import CatalogSettings from "../../../../models/settings/catalogSettings";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end("Method not allowed");

  try {
    await dbConnect();

    const doc = await CatalogSettings.findOne({ key: "catalogSettings" }).lean();

    if (!doc) {
      // Return defaults if not found
      return res.status(200).json({
        showPriceMin: true,
        showPriceMax: true,
      });
    }

    const { _id, __v, ...safe } = doc;
    res.status(200).json(safe);
  } catch (err) {
    console.error("GET catalog/settings public error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
