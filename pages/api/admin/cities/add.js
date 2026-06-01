// /pages/api/admin/cities/add.js
// Creates a new city service-area hub. Stored in `cityHubsAdded` and merged
// into the base content at build time. New cities are hub pages (no per-service
// combo pages until those are added separately).
import clientPromise from "../../../../lib/mongodb";
import { withAuth } from "../../../../lib/middleware/withAuth";
import cityServiceData from "../../../../data/dinodoors-city-service-pages.json";

const str = (v) => (typeof v === "string" ? v.trim() : "");
const slugify = (text) =>
  String(text).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const cityName = str(req.body.cityName);
  const state = str(req.body.state) || "OK";
  if (!cityName) return res.status(400).json({ error: "City name is required" });

  // Match the existing slug convention (e.g. "moore-ok").
  const baseSlug = slugify(cityName);
  if (!baseSlug) return res.status(400).json({ error: "Invalid city name" });
  const citySlug = `${baseSlug}-${state.toLowerCase()}`;

  // Reject collisions with base or already-added cities.
  const baseSlugs = new Set((cityServiceData.cityHubs || []).map((h) => h.citySlug));
  if (baseSlugs.has(citySlug)) {
    return res.status(409).json({ error: `"${cityName}, ${state}" already exists.` });
  }

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const existing = await db.collection("cityHubsAdded").findOne({ citySlug });
    if (existing) return res.status(409).json({ error: `"${cityName}, ${state}" already exists.` });

    const hub = {
      citySlug,
      cityName,
      state,
      title: `Garage Door Services in ${cityName}, ${state}`,
      metaTitle: str(req.body.metaTitle) || `Garage Door & Gate Service in ${cityName}, ${state} | Dino Doors`,
      metaDescription:
        str(req.body.metaDescription) ||
        `Garage door repair, installation, and maintenance in ${cityName}, ${state}. Dino Doors — fast, reliable local service. Call (405) 456-0399.`,
      intro: str(req.body.intro) || "",
      canonicalPath: `/service-areas/${citySlug}`,
      nearbyCitySlugs: [],
      activeServiceSlugs: [],
      addedAt: new Date(),
    };

    await db.collection("cityHubsAdded").insertOne(hub);
    // If this slug had been deleted before, un-delete it.
    await db.collection("cityHubsDeleted").deleteOne({ citySlug });

    res.status(201).json({ message: "City added. Rebuild the site to publish.", citySlug });
  } catch (err) {
    console.error("Failed to add city:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
