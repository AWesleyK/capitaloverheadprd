import clientPromise from "../../lib/mongodb";
import { CITY_LIST, normalizeCity } from "../../lib/cities";

const DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || "https://dinodoors.net";

function getNewestDate(dates) {
  const validDates = dates
    .filter(Boolean)
    .map((d) => new Date(d))
    .filter((d) => !isNaN(d.getTime()));
  if (validDates.length === 0) return new Date().toISOString().split("T")[0];
  const newest = new Date(Math.max(...validDates));
  return newest.toISOString().split("T")[0];
}

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    // Fetch dynamic data
    const [services, blogs, catalogItems, catalogTypes] = await Promise.all([
      db.collection("services").find({}, { projection: { slug: 1, createdAt: 1, modifiedAt: 1 } }).toArray(),
      db.collection("blogs")
        .find(
          { isPublished: true, publishDate: { $lte: new Date() } },
          { projection: { slug: 1, createdAt: 1, updatedAt: 1, publishDate: 1 } }
        )
        .toArray(),
      db.collection("catalogItems").find({}, { projection: { slug: 1, type: 1, createdAt: 1, updatedAt: 1, modifiedAt: 1 } }).toArray(),
      db.collection("catalogTypes").find({}, { projection: { type: 1, createdAt: 1, updatedAt: 1 } }).toArray(),
    ]);

    const today = new Date().toISOString().split("T")[0];

    // 1. Static Routes
    const staticRoutes = [
      { route: "", lastmod: today },
      { route: "about", lastmod: today },
      { route: "services", lastmod: today },
      { route: "services/service-area", lastmod: today },
      { route: "about/blogs", lastmod: today },
      { route: "about/core-values", lastmod: today },
    ];

    // 2. Service Routes
    const serviceRoutes = services.map((s) => ({
      route: `services/${s.slug}`,
      lastmod: getNewestDate([s.createdAt, s.modifiedAt])
    }));

    // 3. Service Area Routes (from CITY_LIST)
    const serviceAreaRoutes = CITY_LIST.map((city) => ({
      route: `service-area/${normalizeCity(city)}`,
      lastmod: today
    }));

    // 4. Catalog Item Routes
    const catalogItemRoutes = catalogItems.map((c) => ({
      route: `catalog/item/${c.slug}`,
      lastmod: getNewestDate([c.createdAt, c.updatedAt, c.modifiedAt])
    }));

    // 5. Catalog Type Routes (only if they have items)
    const usedTypes = new Set(catalogItems.map((i) => i.type));
    const catalogTypeRoutes = catalogTypes
      .filter((t) => usedTypes.has(t.type))
      .map((t) => ({
        route: `catalog/${encodeURIComponent(String(t.type).toLowerCase())}`,
        lastmod: getNewestDate([t.createdAt, t.updatedAt])
      }));

    // 6. Blog Routes
    const blogRoutes = blogs.map((b) => ({
      route: `about/blogs/${b.slug}`,
      lastmod: getNewestDate([b.createdAt, b.updatedAt, b.publishDate])
    }));

    const allRoutes = [
      ...staticRoutes,
      ...serviceRoutes,
      ...serviceAreaRoutes,
      ...catalogTypeRoutes,
      ...catalogItemRoutes,
      ...blogRoutes,
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
      .map((r) => {
        return `  <url>
    <loc>${DOMAIN}/${r.route === "" ? "" : r.route}</loc>
    <lastmod>${r.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      })
      .join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "text/xml");
    res.write(sitemap);
    res.end();
  } catch (err) {
    console.error("Sitemap API error:", err);
    res.status(500).send("Error generating sitemap");
  }
}
