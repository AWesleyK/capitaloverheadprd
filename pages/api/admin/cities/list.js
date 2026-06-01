// /pages/api/admin/cities/list.js
// Returns each city hub's effective editable content: the latest Mongo
// override if present, otherwise the base value from the JSON. Lets the admin
// see their most recent edits even before the next rebuild.
import clientPromise from "../../../../lib/mongodb";
import { withAuth } from "../../../../lib/middleware/withAuth";
import cityServiceData from "../../../../data/dinodoors-city-service-pages.json";

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end("Method not allowed");

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");
    const overrides = await db.collection("cityHubOverrides").find({}).toArray();
    const bySlug = new Map(overrides.map((o) => [o.citySlug, o]));

    const hubs = (cityServiceData.cityHubs || []).map((h) => {
      const ov = bySlug.get(h.citySlug) || {};
      const pick = (field) =>
        typeof ov[field] === "string" && ov[field].trim() !== "" ? ov[field] : (h[field] || "");
      return {
        citySlug: h.citySlug,
        cityName: h.cityName,
        state: h.state,
        metaTitle: pick("metaTitle"),
        metaDescription: pick("metaDescription"),
        intro: pick("intro"),
        hasOverride: !!bySlug.get(h.citySlug),
      };
    });

    res.status(200).json(hubs);
  } catch (err) {
    console.error("Failed to list city content:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
