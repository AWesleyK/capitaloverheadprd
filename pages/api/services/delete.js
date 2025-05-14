import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { withAuth } from "../../../lib/middleware/withAuth";
import { del } from "@vercel/blob";

async function handler(req, res) {
  const { id } = req.query;

  if (!id) return res.status(400).json({ error: "Missing service ID" });

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    // 1. Fetch the service to get slug and imageUrl
    const service = await db.collection("services").findOne({ _id: new ObjectId(id) });
    if (!service) return res.status(404).json({ error: "Service not found" });

    // 2. Delete the image if hosted on Vercel Blob
    if (service.imageUrl?.includes("blob.vercel")) {
      try {
        await del(service.imageUrl);
      } catch (err) {
        console.warn("Vercel Blob delete failed:", err.message);
      }
    }

    // 3. Remove related quick link
    const servicePath = `/services/${service.slug}`;
    await db.collection("quickLinks").deleteOne({ path: servicePath });

    // 4. Delete the service itself
    await db.collection("services").deleteOne({ _id: new ObjectId(id) });

    res.status(200).json({ message: "Service and quick link deleted" });
  } catch (err) {
    console.error("DELETE /services error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
