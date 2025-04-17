import clientPromise from "../../../../lib/mongodb";
import { withAuth } from "../../../../lib/middleware/withAuth";

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const {
    title,
    seoTitle,
    metaDesc,
    imageUrl,
    isPublished,
    slug,
    tags,
    publishDate,
    content,
  } = req.body;

  if (!title || !slug || !imageUrl || !content) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    // Enforce unique slug
    const existing = await db.collection("blogs").findOne({ slug });
    if (existing) {
      return res.status(409).json({ error: "A blog with this title already exists." });
    }

    const blogData = {
      title,
      seoTitle: seoTitle || title,
      metaDesc,
      slug,
      imageUrl,
      tags: tags || [],
      isPublished,
      publishDate: isPublished ? new Date(publishDate || Date.now()) : null,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("blogs").insertOne(blogData);

// Only create quicklink if blog is published
if (isPublished) {
    const path = `/about/blogs/${slug}`;
    await db.collection("quickLinks").updateOne(
      { path },
      { $set: { path, label: title, parent: "Blogs" } },
      { upsert: true }
    );
  }
  

    return res.status(201).json({ message: "Blog published", id: result.insertedId });
  } catch (err) {
    console.error("Blog publish error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
