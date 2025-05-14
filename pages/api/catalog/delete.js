import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { withAuth } from "../../../lib/middleware/withAuth";
import { del } from "@vercel/blob";

async function handler(req, res) {
  const { id } = req.query;

  if (!id) return res.status(400).json({ error: "Missing catalog item ID" });

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    // 1. Find the catalog item
    const item = await db.collection("catalogItems").findOne({ _id: new ObjectId(id) });
    if (!item) return res.status(404).json({ error: "Catalog item not found" });

    // 2. Delete the image from Vercel Blob (if applicable)
    if (item.imageUrl?.includes("blob.vercel")) {
      try {
        await del(item.imageUrl);
      } catch (err) {
        console.warn("Failed to delete catalog image from Vercel Blob:", err.message);
      }
    }

    // 3. Delete the associated quick link
    const itemPath = `/catalog/item/${item.slug}`;
    await db.collection("quickLinks").deleteOne({ path: itemPath });

    // 4. Delete the catalog item
    await db.collection("catalogItems").deleteOne({ _id: new ObjectId(id) });

    res.status(200).json({ message: "Catalog item and quick link deleted" });
  } catch (err) {
    console.error("DELETE /catalog error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
