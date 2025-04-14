// ./pages/api/content/blogs/get-by-slug.js

import clientPromise from "../../../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end("Method not allowed");

  const { slug } = req.query;

  if (!slug) return res.status(400).json({ error: "Missing slug parameter" });

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const blog = await db.collection("blogs").findOne({ slug, isPublished: true });

    if (!blog) return res.status(404).json({ error: "Blog post not found" });

    return res.status(200).json(blog);
  } catch (err) {
    console.error("Failed to fetch blog post:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
