// scripts/generate-nav-data.js
if (process.env.NODE_ENV !== "production") {
  try {
    require("dotenv").config({ path: ".env.local" });
  } catch (_) {}
}

const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

async function generateNavData() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error("❌ Missing MONGODB_URI. Set it in Vercel Environment Variables (Production) and redeploy.");
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db("garage_catalog");

  // Fetch Services
  const services = await db
    .collection("services")
    .find({}, { projection: { name: 1, slug: 1, imageUrl: 1 } })
    .sort({ name: 1 })
    .toArray();

  // Fetch Catalog Types (active ones)
  const allTypes = await db.collection("catalogTypes").find({}).toArray();
  const activeTypes = [];
  for (const type of allTypes) {
    const hasItems = await db.collection("catalogItems").findOne({ type: type.type });
    if (hasItems) activeTypes.push(type);
  }

  // Fetch Catalog Items
  const catalogItems = await db.collection("catalogItems")
    .find({}, { projection: { name: 1, slug: 1, type: 1, typeName: 1, brand: 1, priceMin: 1, priceMax: 1, imageUrl: 1 } })
    .sort({ brand: 1, name: 1 })
    .toArray();

  // Fetch Blogs
  const blogs = await db
    .collection("blogs")
    .find({ isPublished: true, publishDate: { $lte: new Date() } })
    .sort({ publishDate: -1 })
    .project({ title: 1, slug: 1, imageUrl: 1, metaDesc: 1, publishDate: 1 })
    .toArray();

  // Fetch Catalog Settings
  const settingsDoc = await db.collection("settings").findOne({ key: "catalogSettings" });
  const catalogSettings = {
    showPriceMin: settingsDoc?.showPriceMin ?? true,
    showPriceMax: settingsDoc?.showPriceMax ?? true,
  };

  const navData = {
    services: services.map(s => ({ _id: s._id.toString(), name: s.name, slug: s.slug, imageUrl: s.imageUrl })),
    catalogTypes: activeTypes.map(t => ({ _id: t._id.toString(), type: t.type, typeName: t.typeName })),
    catalogItems: catalogItems.map(i => ({ 
      _id: i._id.toString(), 
      name: i.name, 
      slug: i.slug, 
      type: i.type, 
      typeName: i.typeName, 
      brand: i.brand, 
      priceMin: i.priceMin, 
      priceMax: i.priceMax, 
      imageUrl: i.imageUrl 
    })),
    blogs: blogs.map(b => ({ 
      _id: b._id.toString(), 
      title: b.title, 
      slug: b.slug, 
      imageUrl: b.imageUrl, 
      metaDesc: b.metaDesc, 
      publishDate: b.publishDate 
    })),
    catalogSettings,
    lastUpdated: new Date().toISOString()
  };

  const outPath = path.join(__dirname, "../data/nav-data.json");
  fs.writeFileSync(outPath, JSON.stringify(navData, null, 2));
  console.log(`✅ Nav data generated at ${outPath}`);

  await client.close();
}

generateNavData().catch((err) => {
  console.error("❌ Nav data generation failed:", err);
  process.exit(1);
});
