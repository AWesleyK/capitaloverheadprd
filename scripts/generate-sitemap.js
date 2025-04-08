// scripts/generate-sitemap.js
require("dotenv").config({ path: ".env.local" });

const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const baseUrl = "https://dinodoors.net";

async function generateSitemap() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db("garage_catalog");

  const services = await db.collection("services").find({}, { projection: { slug: 1 } }).toArray();
  const catalog = await db.collection("catalogItems").find({}, { projection: { slug: 1 } }).toArray();

  const staticRoutes = [
    "",
    "about",
    "services",
    "services/service-area",
  ];


  const serviceRoutes = services.map(s => `services/${s.slug}`);
  const catalogRoutes = catalog.map(c => `catalog/item/${c.slug}`);
  const allRoutes = [...staticRoutes, ...serviceRoutes, ...catalogRoutes];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${allRoutes.map(route => `
      <url>
        <loc>${baseUrl}/${route}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`).join("")}
  </urlset>`;

  fs.writeFileSync(path.join(__dirname, "../public/sitemap.xml"), sitemap);
  console.log("✅ Sitemap generated");
  await client.close();
}

generateSitemap();
