// scripts/apply-city-overrides.js
//
// Reconciles admin-authored city changes (stored in Mongo) with the committed
// base content in data/dinodoors-city-service-pages.json:
//
//   effective cityHubs = (base hubs ∪ cityHubsAdded) − cityHubsDeleted
//                        then field overrides from cityHubOverrides applied
//
// Deleted cities also have their city/service combo pages removed so they
// aren't generated or sitemapped. The JSON file stays the source of truth for
// structure/defaults. This step is NON-FATAL: if MONGODB_URI is missing or
// Mongo is unreachable, the base JSON is used unchanged so a build can never
// lose city content.

if (process.env.NODE_ENV !== "production") {
  try {
    require("dotenv").config({ path: ".env.local" });
  } catch (_) {}
}

const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const JSON_PATH = path.join(__dirname, "../data/dinodoors-city-service-pages.json");
const OVERRIDABLE = ["metaTitle", "metaDescription", "intro"];

async function applyCityOverrides() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn("⚠️  apply-city-overrides: MONGODB_URI not set — using base JSON unchanged.");
    return;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
  } catch (err) {
    console.warn("⚠️  apply-city-overrides: could not read base JSON — skipping.", err.message);
    return;
  }
  if (!data || !Array.isArray(data.cityHubs)) {
    console.warn("⚠️  apply-city-overrides: base JSON has no cityHubs — skipping.");
    return;
  }

  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db("garage_catalog");
    const [overrides, added, deleted] = await Promise.all([
      db.collection("cityHubOverrides").find({}).toArray(),
      db.collection("cityHubsAdded").find({}).toArray(),
      db.collection("cityHubsDeleted").find({}).toArray(),
    ]);

    const overrideBySlug = new Map(overrides.map((o) => [o.citySlug, o]));
    const deletedSlugs = new Set(deleted.map((d) => d.citySlug));

    // 1. Base ∪ added (added wins on slug collision is avoided — base kept, dup skipped)
    let hubs = [...data.cityHubs];
    const baseSlugs = new Set(hubs.map((h) => h.citySlug));
    for (const a of added) {
      if (a && a.citySlug && !baseSlugs.has(a.citySlug)) hubs.push(a);
    }

    // 2. Remove deleted
    hubs = hubs.filter((h) => !deletedSlugs.has(h.citySlug));

    // 3. Apply field overrides
    for (const hub of hubs) {
      const ov = overrideBySlug.get(hub.citySlug);
      if (!ov) continue;
      for (const field of OVERRIDABLE) {
        if (typeof ov[field] === "string" && ov[field].trim() !== "") hub[field] = ov[field];
      }
    }

    data.cityHubs = hubs;

    // 4. Drop combo pages belonging to deleted cities
    if (Array.isArray(data.cityServicePages) && deletedSlugs.size > 0) {
      data.cityServicePages = data.cityServicePages.filter((p) => !deletedSlugs.has(p.citySlug));
    }

    fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2));
    console.log(
      `✅ apply-city-overrides: ${hubs.length} hubs (` +
        `+${added.length} added, -${deletedSlugs.size} deleted, ${overrides.length} overridden).`
    );
  } catch (err) {
    console.warn("⚠️  apply-city-overrides: Mongo error — using base JSON unchanged.", err.message);
  } finally {
    await client.close().catch(() => {});
  }
}

applyCityOverrides().catch((err) => {
  console.warn("⚠️  apply-city-overrides: unexpected error — using base JSON unchanged.", err.message);
});
