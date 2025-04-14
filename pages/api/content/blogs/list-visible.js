// pages/api/blog/list-visible.js

import clientPromise from "../../../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end("Method not allowed");

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const blogs = await db
      .collection("blogs")
      .find({ isPublished: true, publishDate: { $lte: new Date() } })
      .sort({ publishDate: -1 })
      .project({
        title: 1,
        slug: 1,
        imageUrl: 1,
        metaDesc: 1,
        publishDate: 1,
      })
      .toArray();

    res.status(200).json(blogs);
  } catch (err) {
    console.error("Failed to fetch visible blogs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
