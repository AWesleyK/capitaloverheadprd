// /pages/api/services/add.js
import clientPromise from "../../../lib/mongodb";
import { withAuth } from '../../../lib/middleware/withAuth';

const slugify = (text) =>
  text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");

// Normalize optional SEO/content fields shared by add + update.
export const normalizeSeoFields = (body = {}) => {
  const str = (v) => (typeof v === "string" ? v.trim() : "");
  const highlights = Array.isArray(body.highlights)
    ? body.highlights.map((h) => str(h)).filter(Boolean)
    : [];
  const faqs = Array.isArray(body.faqs)
    ? body.faqs
        .map((f) => ({ question: str(f?.question), answer: str(f?.answer) }))
        .filter((f) => f.question && f.answer)
    : [];
  return {
    metaTitle: str(body.metaTitle),
    metaDescription: str(body.metaDescription),
    highlights,
    faqs,
  };
};

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { name, description, imageUrl } = req.body;

  if (!name || !description || !imageUrl) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const slug = slugify(name);
    const path = `/services/${slug}`;
    const parent = "All Services";

    const result = await db.collection("services").insertOne({
      name,
      description,
      imageUrl,
      slug,
      ...normalizeSeoFields(req.body),
      createdAt: new Date(),
    });

    await db.collection("quickLinks").updateOne(
      { path },
      { $set: { path, label: name, parent } },
      { upsert: true }
    );

    res.status(201).json({ message: "Service added", id: result.insertedId });
  } catch (err) {
    console.error("Failed to add service:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });