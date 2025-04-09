// /pages/api/services/add.js
import clientPromise from "../../../lib/mongodb";
import { withAuth } from '../../../lib/middleware/withAuth';

const slugify = (text) =>
  text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { name, description, imageUrl } = req.body;

  if (!name || !description || !imageUrl) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const slug = slugify(name);
    const path = `/services/${slug}`;
    const parent = "Services Overview";

    const result = await db.collection("services").insertOne({
      name,
      description,
      imageUrl,
      slug,
      createdAt: new Date(),
    });

    await db.collection("quickLinks").updateOne(
      { path },
      { $set: { path, label: name, parent } },
      { upsert: true }
    );

    res.status(201).json({ message: "Service added", id: result.insertedId });
  } catch (err) {
    console.error("Failed to add service:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

export default withAuth(handler);