// scripts/generate-llms-txt.js
if (process.env.NODE_ENV !== "production") {
  try {
    require("dotenv").config({ path: ".env.local" });
  } catch (_) {}
}

const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");
const { CITY_LIST, normalizeCity } = require("../lib/cities");

function stripHtml(html) {
  if (!html) return "";
  // Basic HTML stripping: remove tags, replace common entities
  return html
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function generateLlmsTxt() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error("❌ Missing MONGODB_URI. Set it in Vercel Environment Variables (Production) and redeploy.");
    process.exit(1);
  }

  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db("garage_catalog");

  let content = "# Dino Doors Garage Doors and More - Information Hub\n\n";
  content += "This file contains comprehensive information about our services, product catalog, and expert garage door advice for AI models and crawlers.\n\n";

  // 0. General Information & About
  content += "## About Dino Doors\n\n";
  content += "Dino Doors Garage Doors and More is a family-owned and operated small company based in the heart of Oklahoma. Founded in 2019 by Jonathan Gruszka, we offer rural communities honest, dependable garage door and gate service. Our vision is to provide high-quality solutions with integrity and heart. Our physical location is in the heart of Elmore City.\n\n";
  content += "### Our Core Values\n\n";
  content += "- **Expertise**: With years of experience, our skilled technicians handle everything from simple repairs to complex installations.\n";
  content += "- **Customer Focus**: We prioritize our customers' needs and ensure they are satisfied with every job.\n";
  content += "- **Quality Assurance**: We use high-quality parts and stand behind our work with warranties you can count on.\n";
  content += "- **Safety Measures**: Safety is our top priority, both for our technicians and for your family.\n\n";

  // 1. Services
  console.log("Fetching services...");
  const services = await db.collection("services").find({}).toArray();
  content += "## Our Services\n\n";
  content += "We offer a wide range of garage door and gate services. Main services page: /services\n\n";
  for (const s of services) {
    content += `### ${s.name}\n`;
    content += `Slug: /services/${s.slug}\n`;
    content += `${stripHtml(s.description) || "No description available."}\n\n`;
  }

  // 2. Product Catalog
  console.log("Fetching catalog...");
  const catalogTypes = await db.collection("catalogTypes").find({}).toArray();
  const catalogItems = await db.collection("catalogItems").find({}).toArray();
  
  // Determine active types
  const usedTypes = new Set(catalogItems.map(item => item.type));
  const activeTypes = catalogTypes.filter(t => usedTypes.has(t.type));

  content += "## Product Catalog\n\n";
  content += "Browse our selection of garage doors and gate operators.\n\n";
  
  content += "### Categories\n\n";
  for (const t of activeTypes) {
    const typeSlug = encodeURIComponent(String(t.type).toLowerCase());
    content += `- ${t.typeName} Catalog (Slug: /catalog/${typeSlug})\n`;
  }
  content += "\n";

  content += "### Products\n\n";
  for (const item of catalogItems) {
    content += `#### ${item.name} (${item.brand})\n`;
    content += `Category: ${item.typeName}\n`;
    content += `Slug: /catalog/item/${item.slug}\n`;
    content += `${stripHtml(item.description) || "No description available."}\n\n`;
  }

  // 3. Service Areas
  content += "## Our Service Areas\n\n";
  content += "Dino Doors provides expert garage door repair and installation across southern and central Oklahoma. We serve both residential and commercial properties.\n\n";
  content += "Main Service Area Page: /services/service-area\n\n";
  content += "### Cities We Serve:\n";
  for (const city of CITY_LIST) {
    const slug = normalizeCity(city);
    content += `- ${city} (Slug: /service-area/${slug})\n`;
  }
  content += "\n";

  // 4. Blog
  console.log("Fetching blogs...");
  const blogs = await db
    .collection("blogs")
    .find({ isPublished: true, publishDate: { $lte: new Date() } })
    .sort({ publishDate: -1 })
    .toArray();

  content += "## Blog & Expert Advice\n\n";
  content += "Stay updated with the latest garage door tips, maintenance guides, and news from Dino Doors. Main blog page: /about/blogs\n\n";
  for (const b of blogs) {
    content += `### ${b.title}\n`;
    content += `Published: ${b.publishDate}\n`;
    content += `Slug: /about/blogs/${b.slug}\n`;
    content += `Summary: ${b.metaDesc}\n\n`;
    content += `${stripHtml(b.content) || ""}\n\n`;
  }

  // 5. FAQs
  console.log("Fetching FAQs...");
  const faqs = await db.collection("faqs").find({}).sort({ order: 1 }).toArray();
  if (faqs.length > 0) {
    content += "## Frequently Asked Questions\n\n";
    for (const faq of faqs) {
      content += `### ${faq.question}\n`;
      content += `${stripHtml(faq.answer)}\n\n`;
    }
  }

  const outPath = path.join(__dirname, "../public/llms.txt");
  fs.writeFileSync(outPath, content);
  console.log(`✅ llms.txt generated at ${outPath}`);

  await client.close();
}

generateLlmsTxt().catch((err) => {
  console.error("❌ llms.txt generation failed:", err);
  process.exit(1);
});
