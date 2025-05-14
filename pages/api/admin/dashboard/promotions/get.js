import clientPromise from "../../../../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const images = await db.collection("promotionImages")
      .find({})
      .sort({ uploadedAt: -1 }) // newest first
      .toArray();

    res.status(200).json(images);
  } catch (err) {
    console.error("GET /promotions error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
