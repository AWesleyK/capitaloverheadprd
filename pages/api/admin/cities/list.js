// /pages/api/admin/cities/list.js
// Effective city list for the admin: (base ∪ added) − deleted, with the latest
// Mongo field overrides applied, plus flags so the UI can show state without a
// rebuild.
import clientPromise from "../../../../lib/mongodb";
import { withAuth } from "../../../../lib/middleware/withAuth";
import cityServiceData from "../../../../data/dinodoors-city-service-pages.json";

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end("Method not allowed");

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");
    const [overrides, added, deleted] = await Promise.all([
      db.collection("cityHubOverrides").find({}).toArray(),
      db.collection("cityHubsAdded").find({}).toArray(),
      db.collection("cityHubsDeleted").find({}).toArray(),
    ]);

    const overrideBySlug = new Map(overrides.map((o) => [o.citySlug, o]));
    const deletedSlugs = new Set(deleted.map((d) => d.citySlug));

    const baseHubs = cityServiceData.cityHubs || [];
    const baseSlugs = new Set(baseHubs.map((h) => h.citySlug));
    const addedHubs = added.filter((a) => a && a.citySlug && !baseSlugs.has(a.citySlug));

    const combined = [
      ...baseHubs.map((h) => ({ hub: h, isAdded: false })),
      ...addedHubs.map((h) => ({ hub: h, isAdded: true })),
    ].filter(({ hub }) => !deletedSlugs.has(hub.citySlug));

    const result = combined.map(({ hub, isAdded }) => {
      const ov = overrideBySlug.get(hub.citySlug) || {};
      const pick = (field) =>
        typeof ov[field] === "string" && ov[field].trim() !== "" ? ov[field] : (hub[field] || "");
      return {
        citySlug: hub.citySlug,
        cityName: hub.cityName,
        state: hub.state,
        metaTitle: pick("metaTitle"),
        metaDescription: pick("metaDescription"),
        intro: pick("intro"),
        isAdded,
        hasOverride: !!overrideBySlug.get(hub.citySlug),
      };
    });

    result.sort((a, b) => (a.cityName || "").localeCompare(b.cityName || ""));
    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to list city content:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
