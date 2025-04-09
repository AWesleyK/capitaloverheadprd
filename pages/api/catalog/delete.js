// /pages/api/catalog/delete.js

import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { withAuth } from '../../../lib/middleware/withAuth';

async function handler(req, res) {
  const { id } = req.query;

  if (!id) return res.status(400).json({ error: "Missing catalog item ID" });

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    await db.collection("catalogItems").deleteOne({ _id: new ObjectId(id) });

    res.status(200).json({ message: "Catalog item deleted" });
  } catch (err) {
    console.error("DELETE /catalog error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });