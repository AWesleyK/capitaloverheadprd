import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { withAuth } from "../../../../lib/middleware/withAuth";

async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end("Method not allowed");

  const { id } = req.query;

  if (!id) return res.status(400).json({ error: "Missing blog ID" });

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    // Find blog to delete
    const blog = await db.collection("blogs").findOne({ _id: new ObjectId(id) });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    // Delete blog post
    await db.collection("blogs").deleteOne({ _id: new ObjectId(id) });

    // Delete related quickLink
    const path = `/about/blogs/${blog.slug}`;
    await db.collection("quickLinks").deleteOne({ path });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Blog delete error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
