import dbConnect from "../../../../../lib/mongoose";
import User from "../../../../../models/users";
import CatalogSettings from "../../../../../models/settings/catalogSettings";
import { withAuth } from "../../../../../lib/middleware/withAuth";

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  try {
    await dbConnect();

    const { showPriceMin, showPriceMax } = req.body || {};

    const updated = await CatalogSettings.findOneAndUpdate(
      { key: "catalogSettings" },
      {
        $set: {
          showPriceMin: !!showPriceMin,
          showPriceMax: !!showPriceMax,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    const { _id, __v, ...safe } = updated;
    res.status(200).json({ message: "Catalog settings saved", settings: safe });
  } catch (err) {
    console.error("SAVE admin/catalog/settings error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
