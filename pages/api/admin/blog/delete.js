import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { withAuth } from "../../../../lib/middleware/withAuth";
import { del } from "@vercel/blob";

async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end("Method not allowed");

  const { id } = req.query;

  if (!id) return res.status(400).json({ error: "Missing blog ID" });

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const blogs = db.collection("blogs");
    const quickLinks = db.collection("quickLinks");

    // 🟡 Step 1: Fetch the blog to get image URL and slug
    const blog = await blogs.findOne({ _id: new ObjectId(id) });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    // 🟠 Step 2: Delete image from Vercel Blob if exists
    if (blog.imageUrl?.includes("blob.vercel")) {
      try {
        await del(blog.imageUrl);
      } catch (err) {
        console.warn("Blob deletion failed:", err.message);
      }
    }

    // 🔴 Step 3: Delete the blog and the quick link
    await blogs.deleteOne({ _id: new ObjectId(id) });

    const path = `/about/blogs/${blog.slug}`;
    await quickLinks.deleteOne({ path });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Blog delete error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
