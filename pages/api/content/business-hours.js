import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const hours = await db
      .collection("businessHours")
      .find()
      .sort({ order: 1 })
      .toArray();

    const grouped = {
      store: hours.filter(h => h.category === "store"),
      operation: hours.filter(h => h.category === "operation"),
    };

    res.status(200).json(grouped);
  } catch (err) {
    console.error("Failed to load hours:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
