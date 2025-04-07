// /pages/api/sitemap.js
import { getServerSession } from "next-auth";
import clientPromise from "../../lib/mongodb";

export default async function handler(req, res) {
  const baseUrl = "https://dinodoors.net";

  const staticRoutes = [
    "",
    "about",
    "services",
    "services/service-area",
  ];

  let serviceRoutes = [];

  try {
    const client = await clientPromise;
    const db = client.db();
    const services = await db.collection("services").find().toArray();

    serviceRoutes = services.map((service) => `services/${service.slug}`);
  } catch (err) {
    console.error("Error fetching dynamic routes for sitemap:", err);
  }

  const allRoutes = [...staticRoutes, ...serviceRoutes];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${allRoutes
      .map((route) => {
        return `
      <url>
        <loc>${baseUrl}/${route}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`;
      })
      .join("")}
  </urlset>`;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();
}