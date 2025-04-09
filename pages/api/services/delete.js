import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { withAuth } from '../../../lib/middleware/withAuth';

async function handler(req, res) {
  const { id } = req.query;

  if (!id) return res.status(400).json({ error: "Missing service ID" });

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    await db.collection("services").deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: "Service deleted" });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ error: "Delete failed" });
  }
}

export default withAuth(handler);