// /pages/api/admin/cities/save.js
// Upserts a city hub's editable content into the `cityHubOverrides` collection.
// Applied onto the base JSON at build time (scripts/apply-city-overrides.js),
// so changes go live on the next rebuild.
import clientPromise from "../../../../lib/mongodb";
import { withAuth } from "../../../../lib/middleware/withAuth";
import cityServiceData from "../../../../data/dinodoors-city-service-pages.json";

const str = (v) => (typeof v === "string" ? v.trim() : "");

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const citySlug = str(req.body.citySlug);
  if (!citySlug) return res.status(400).json({ error: "Missing citySlug" });

  // Guard: only allow slugs that exist in the base content.
  const known = (cityServiceData.cityHubs || []).some((h) => h.citySlug === citySlug);
  if (!known) return res.status(400).json({ error: "Unknown city" });

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    await db.collection("cityHubOverrides").updateOne(
      { citySlug },
      {
        $set: {
          citySlug,
          metaTitle: str(req.body.metaTitle),
          metaDescription: str(req.body.metaDescription),
          intro: str(req.body.intro),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    res.status(200).json({ message: "City content saved. Rebuild the site to publish." });
  } catch (err) {
    console.error("Failed to save city content:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
