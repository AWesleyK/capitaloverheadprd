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

    const servicesCollection = db.collection("services");
    const quickLinksCollection = db.collection("quickLinks");

    // 1. Fetch the current service before updating
    const existingService = await servicesCollection.findOne({ _id: new ObjectId(id) });

    if (!existingService) {
      return res.status(404).json({ error: "Service not found" });
    }

    const oldSlug = existingService.slug;
    const oldPath = `/services/${oldSlug}`;

    // 2. Create new slug/path
    const newSlug = slugify(name);
    const newPath = `/services/${newSlug}`;
    const parent = "All Services";

    // 3. Update the service
    await servicesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          description,
          imageUrl,
          slug: newSlug,
        },
      }
    );

    // 4. Update the quick link by matching the OLD path
    await quickLinksCollection.updateOne(
      { path: oldPath },
      { $set: { path: newPath, label: name, parent } },
      { upsert: true }
    );

    res.status(200).json({ message: "Service updated" });
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
