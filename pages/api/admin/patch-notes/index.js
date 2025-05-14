// /pages/api/admin/patch-notes/index.js
import clientPromise from "../../../../lib/mongodb";
import { withAuth } from "../../../../lib/middleware/withAuth";

async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("garage_catalog");
  const collection = db.collection("patchNotes");

  if (req.method === "GET") {
    const notes = await collection.find({})
      .sort({ createdAt: -1 })
      .toArray();
    return res.status(200).json(notes);
  }

  if (req.method === "POST") {
    const { version, notes } = req.body;
    if (!version || !notes) return res.status(400).json({ error: "Missing fields" });

    await collection.insertOne({ version, notes, createdAt: new Date() });
    return res.status(201).json({ message: "Patch notes added" });
  }

  return res.status(405).end("Method Not Allowed");
}

export default withAuth(handler, { roles: ["Overlord"], minTier: 1 });