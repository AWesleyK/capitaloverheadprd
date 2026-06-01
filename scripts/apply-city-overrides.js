// scripts/apply-city-overrides.js
//
// Merges admin-authored city-hub edits (stored in the `cityHubOverrides`
// Mongo collection) onto the committed base content in
// data/dinodoors-city-service-pages.json.
//
// The JSON file remains the source of truth for structure + default content;
// Mongo only holds the changed fields per city. This step is intentionally
// NON-FATAL: if MONGODB_URI is missing or Mongo is unreachable, it leaves the
// base JSON untouched so a build can never lose city content.

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
    const overrides = await db.collection("cityHubOverrides").find({}).toArray();

    if (overrides.length === 0) {
      console.log("apply-city-overrides: no overrides found — base JSON unchanged.");
      return;
    }

    const bySlug = new Map(overrides.map((o) => [o.citySlug, o]));
    let applied = 0;
    for (const hub of data.cityHubs) {
      const ov = bySlug.get(hub.citySlug);
      if (!ov) continue;
      for (const field of OVERRIDABLE) {
        if (typeof ov[field] === "string" && ov[field].trim() !== "") {
          hub[field] = ov[field];
        }
      }
      applied++;
    }

    fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2));
    console.log(`✅ apply-city-overrides: merged overrides for ${applied} city hub(s).`);
  } catch (err) {
    // Never fail the build over content overrides.
    console.warn("⚠️  apply-city-overrides: Mongo error — using base JSON unchanged.", err.message);
  } finally {
    await client.close().catch(() => {});
  }
}

applyCityOverrides().catch((err) => {
  console.warn("⚠️  apply-city-overrides: unexpected error — using base JSON unchanged.", err.message);
});
