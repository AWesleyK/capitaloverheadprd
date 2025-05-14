// /pages/api/catalog/types/active.js
import clientPromise from "../../../../lib/mongodb";

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const allTypes = await db.collection("catalogTypes").find({}).toArray();

    const activeTypes = [];

    for (const type of allTypes) {
      const hasItems = await db.collection("catalogItems").findOne({ type: type.type });
      if (hasItems) activeTypes.push(type);
    }

    res.status(200).json(activeTypes);
  } catch (err) {
    console.error("GET /catalog/types/active error:", err);
    res.status(500).json({ error: "Failed to load catalog types" });
  }
}
