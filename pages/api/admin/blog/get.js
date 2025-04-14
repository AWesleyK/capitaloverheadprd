import clientPromise from "../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { withAuth } from "../../../../lib/middleware/withAuth";

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing blog ID" });

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const blog = await db.collection("blogs").findOne({ _id: new ObjectId(id) });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    res.status(200).json(blog);
  } catch (err) {
    console.error("Failed to fetch blog:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
