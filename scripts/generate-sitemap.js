// scripts/generate-sitemap.js

// Only load .env.local for LOCAL development.
// On Vercel, env vars come from the dashboard and .env.local is not present.
if (process.env.NODE_ENV !== "production") {
  try {
    require("dotenv").config({ path: ".env.local" });
  } catch (_) {}
}

const fs = require("fs");
const path = require("path");
const https = require("https");
const { MongoClient } = require("mongodb");
const { CITY_LIST, normalizeCity } = require("../lib/cities");

// Prefer env-driven base URL, fall back to your real domain.
const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://dinodoors.net").replace(/\/+$/, "");

async function generateSitemap() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error("❌ Missing MONGODB_URI. Set it in Vercel Environment Variables (Production) and redeploy.");
    process.exit(1); // fail build so you don't silently deploy a stale/incorrect sitemap
  }

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db("garage_catalog");

  // Collect all content
  const [services, catalogItems, blogs, catalogTypes] = await Promise.all([
    db.collection("services").find({}, { projection: { slug: 1 } }).toArray(),
    db.collection("catalogItems").find({}, { projection: { slug: 1, type: 1 } }).toArray(),
    db.collection("blogs")
        .find(
            { isPublished: true, publishDate: { $lte: new Date() } },
            { projection: { slug: 1 } }
        )
        .toArray(),
    db.collection("catalogTypes").find({}, { projection: { type: 1 } }).toArray(),
  ]);

  // Determine which catalog types are used
  const usedTypes = new Set(catalogItems.map((item) => item.type));

  // Static routes
  const staticRoutes = [
    "",
    "about",
    "services",
    "services/service-area",
    "about/blogs",
    "about/core-values",
  ];

  // Dynamic routes
  const serviceRoutes = services.map((s) => `services/${s.slug}`);
  const serviceAreaRoutes = CITY_LIST.map((city) => `service-area/${normalizeCity(city)}`);
  const catalogItemRoutes = catalogItems.map((c) => `catalog/item/${c.slug}`);
  const blogRoutes = blogs.map((b) => `about/blogs/${b.slug}`);

  // Use encodeURIComponent for safety (spaces, special chars, etc.)
  const catalogTypeRoutes = catalogTypes
      .filter((t) => usedTypes.has(t.type))
      .map((t) => `catalog/${encodeURIComponent(String(t.type).toLowerCase())}`);

  const allRoutes = [
    ...staticRoutes,
    ...serviceRoutes,
    ...serviceAreaRoutes,
    ...catalogTypeRoutes,
    ...catalogItemRoutes,
    ...blogRoutes,
  ];

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
      .map(
          (route) => `
  <url>
    <loc>${baseUrl}/${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      )
      .join("")}
</urlset>`;

  const outPath = path.join(__dirname, "../public/sitemap.xml");
  fs.writeFileSync(outPath, sitemap);
  console.log(`✅ Sitemap generated at ${outPath}`);

  await pingSearchEngines();
  await client.close();
}

function pingSearchEngines() {
  const sitemapUrl = encodeURIComponent(`${baseUrl}/sitemap.xml`);

  const targets = [
    { name: "Google", url: `https://www.google.com/ping?sitemap=${sitemapUrl}` },
    { name: "Bing", url: `https://www.bing.com/ping?sitemap=${sitemapUrl}` },
  ];

  return Promise.all(
      targets.map(
          (target) =>
              new Promise((resolve) => {
                https
                    .get(target.url, (res) => {
                      res.resume(); // allow socket to close

                      console.log(`📡 Pinged ${target.name}: ${res.statusCode}`);

                      // Don’t break the build on deprecated endpoints
                      if (res.statusCode === 404 && target.name === "Google") {
                        console.warn("Google sitemap ping endpoint returned 404 (common/deprecated behavior).");
                      }
                      if (res.statusCode === 410 && target.name === "Bing") {
                        console.warn("Bing sitemap ping endpoint returned 410 (deprecated). Consider IndexNow API later.");
                      }

                      resolve();
                    })
                    .on("error", (err) => {
                      console.error(`❌ Failed to ping ${target.name}:`, err.message);
                      resolve();
                    });
              })
      )
  );
}

generateSitemap().catch((err) => {
  console.error("❌ Sitemap generation failed:", err);
  process.exit(1);
});
