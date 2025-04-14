import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { withAuth } from "../../../../lib/middleware/withAuth";

const slugify = (text) =>
  text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");

async function handler(req, res) {
  if (req.method !== "PUT") return res.status(405).end("Method not allowed");

  const {
    id,
    title,
    seoTitle,
    metaDesc,
    imageUrl,
    isPublished,
    tags,
    publishDate,
    content,
  } = req.body;

  if (!id || !title || !content || !imageUrl) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const slug = slugify(title);

    // Check if the new slug is used by another blog
    const existing = await db.collection("blogs").findOne({ slug, _id: { $ne: new ObjectId(id) } });
    if (existing) {
      return res.status(409).json({ error: "A blog with this title already exists." });
    }

    const result = await db.collection("blogs").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          seoTitle: seoTitle || title,
          metaDesc,
          slug,
          imageUrl,
          tags: tags || [],
          isPublished,
          publishDate: isPublished ? new Date(publishDate || Date.now()) : null,
          content,
          updatedAt: new Date(),
        },
      }
    );

    const path = `/about/blogs/${slug}`;
    await db.collection("quickLinks").updateOne(
      { path },
      { $set: { path, label: title, parent: "Blogs" } },
      { upsert: true }
    );

    res.status(200).json({ success: true, updated: result.modifiedCount });
  } catch (err) {
    console.error("Blog update error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
