import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const items = await db.collection("catalogItems")
      .find({})
      .sort({ brand: 1, name: 1 }) // Sort by brand, then name
      .toArray();

    res.status(200).json(items);
  } catch (err) {
    console.error("GET /catalog error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
