// /pages/api/services/update.js
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

const slugify = (text) =>
  text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");

export default async function handler(req, res) {
  if (req.method !== "PUT") return res.status(405).end("Method Not Allowed");

  const { id, name, description, imageUrl } = req.body;

  if (!id || !name || !description || !imageUrl) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const slug = slugify(name);
    const path = `/services/${slug}`;
    const parent = "Services Overview";

    await db.collection("services").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          description,
          imageUrl,
          slug,
        },
      }
    );

    await db.collection("quickLinks").updateOne(
      { path },
      { $set: { path, label: name, parent } },
      { upsert: true }
    );

    res.status(200).json({ message: "Service updated" });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
