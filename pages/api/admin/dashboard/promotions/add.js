import clientPromise from "../../../../../lib/mongodb";
import { withAuth } from "../../../../../lib/middleware/withAuth";

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { url } = req.body;

  if (!url) return res.status(400).json({ error: "Missing image URL" });

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const result = await db.collection("promotionImages").insertOne({
      url,
      uploadedAt: new Date(),
    });

    res.status(201).json({ message: "Image added", id: result.insertedId });
  } catch (err) {
    console.error("POST /promotions error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
