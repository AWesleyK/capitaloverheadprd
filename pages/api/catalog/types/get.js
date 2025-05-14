import clientPromise from "../../../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const types = await db.collection("catalogTypes").find({}).sort({ typeName: 1 }).toArray();
    res.status(200).json(types);
  } catch (err) {
    console.error("GET /catalog/types error:", err);
    res.status(500).json({ error: "Failed to fetch catalog types" });
  }
}
