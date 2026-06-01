// /pages/api/admin/cities/delete.js
// Removes a city from the live site. For admin-added cities, it deletes the
// added record outright. For base (JSON) cities, it records the slug in
// `cityHubsDeleted` so the build step filters it (and its combo pages) out.
import clientPromise from "../../../../lib/mongodb";
import { withAuth } from "../../../../lib/middleware/withAuth";
import cityServiceData from "../../../../data/dinodoors-city-service-pages.json";

const str = (v) => (typeof v === "string" ? v.trim() : "");

async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).end("Method not allowed");
  }

  const citySlug = str(req.body?.citySlug) || str(req.query?.citySlug);
  if (!citySlug) return res.status(400).json({ error: "Missing citySlug" });

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const isBase = (cityServiceData.cityHubs || []).some((h) => h.citySlug === citySlug);
    const wasAdded = await db.collection("cityHubsAdded").findOne({ citySlug });

    if (!isBase && !wasAdded) {
      return res.status(404).json({ error: "Unknown city" });
    }

    // Drop any admin-added record + field overrides for this slug.
    await Promise.all([
      db.collection("cityHubsAdded").deleteOne({ citySlug }),
      db.collection("cityHubOverrides").deleteOne({ citySlug }),
    ]);

    // For base cities, record a tombstone so the build excludes them.
    if (isBase) {
      await db.collection("cityHubsDeleted").updateOne(
        { citySlug },
        { $set: { citySlug, deletedAt: new Date() } },
        { upsert: true }
      );
    }

    res.status(200).json({ message: "City removed. Rebuild the site to publish." });
  } catch (err) {
    console.error("Failed to delete city:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
