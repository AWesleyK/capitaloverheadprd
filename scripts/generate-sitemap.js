require("dotenv").config({ path: ".env.local" });
const fs = require("fs");
const path = require("path");
const https = require("https");
const { MongoClient } = require("mongodb");

const baseUrl = "https://dinodoors.net";

async function generateSitemap() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db("garage_catalog");

  // Collect all content
  const [services, catalogItems, blogs, catalogTypes] = await Promise.all([
    db.collection("services").find({}, { projection: { slug: 1 } }).toArray(),
    db.collection("catalogItems").find({}, { projection: { slug: 1, type: 1 } }).toArray(),
    db.collection("blogs").find(
      { isPublished: true, publishDate: { $lte: new Date() } },
      { projection: { slug: 1 } }
    ).toArray(),
    db.collection("catalogTypes").find({}, { projection: { type: 1 } }).toArray()
  ]);

  // Determine which catalog types are used
  const usedTypes = new Set(catalogItems.map(item => item.type));

  // Static routes
  const staticRoutes = [
    "",
    "about",
    "services",
    "services/service-area",
    "about/blogs",
    "about/learn-more"
  ];

  // Dynamic routes
  const serviceRoutes = services.map(s => `services/${s.slug}`);
  const catalogItemRoutes = catalogItems.map(c => `catalog/item/${c.slug}`);
  const blogRoutes = blogs.map(b => `about/blogs/${b.slug}`);
  const catalogTypeRoutes = catalogTypes
    .filter(t => usedTypes.has(t.type))
    .map(t => `catalog/${t.type.toLowerCase().replace(/\s+/g, "%20")}`);

  const allRoutes = [
    ...staticRoutes,
    ...serviceRoutes,
    ...catalogTypeRoutes,
    ...catalogItemRoutes,
    ...blogRoutes
  ];

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(route => `
  <url>
    <loc>${baseUrl}/${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`)
  .join("")}
</urlset>`;

  fs.writeFileSync(path.join(__dirname, "../public/sitemap.xml"), sitemap);
  console.log("✅ Sitemap generated");

  await pingSearchEngines();
  await client.close();
}

function pingSearchEngines() {
  const sitemapUrl = encodeURIComponent(`${baseUrl}/sitemap.xml`);
  const targets = [
    {
      name: "Google",
      url: `https://www.google.com/ping?sitemap=${sitemapUrl}`
    },
    {
      name: "Bing (IndexNow)",
      url: `https://www.bing.com/ping?sitemap=${sitemapUrl}`
    }
  ];

  return Promise.all(targets.map(target =>
    new Promise((resolve) => {
      https.get(target.url, (res) => {
        console.log(`📡 Pinged ${target.name}: ${res.statusCode}`);
        resolve();
      }).on("error", (err) => {
        console.error(`❌ Failed to ping ${target.name}:`, err.message);
        resolve();
      });
    })
  ));
}

generateSitemap();
