// pages/api/admin/blog/list.js
import clientPromise from "../../../../lib/mongodb";
import { withAuth } from "../../../../lib/middleware/withAuth";

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");
    const blogs = await db.collection("blogs").find({}).sort({ createdAt: -1 }).toArray();

    res.status(200).json(blogs);
  } catch (err) {
    console.error("Failed to fetch blogs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
