// /pages/api/catalog/update.js
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import slugify from "slugify";
import { withAuth } from '../../../lib/middleware/withAuth';

async function handler(req, res) {
  if (req.method !== "PUT") return res.status(405).end("Method Not Allowed");

  const { id, brand, name, description, type, typeName, priceMin, priceMax, imageUrl } = req.body;

  if (!id || !brand || !name || !description || !type || !typeName || !imageUrl) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const parsedPriceMin = priceMin !== "" ? parseFloat(priceMin) : null;
  const parsedPriceMax = priceMax !== "" ? parseFloat(priceMax) : null;

  if ((parsedPriceMin && isNaN(parsedPriceMin)) || (parsedPriceMax && isNaN(parsedPriceMax))) {
    return res.status(400).json({ error: "Invalid price values" });
  }

  const newSlug = slugify(name, { lower: true, strict: true });
  const newPath = `/catalog/item/${newSlug}`;
  const parent = type === "Garage Doors" ? "Garage Door Catalog"
              : type === "Gates" ? "Gate Catalog"
              : null;

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const catalogItems = db.collection("catalogItems");
    const quickLinks = db.collection("quickLinks");

    // 🟡 Step 1: Get the existing item to find the old path
    const existingItem = await catalogItems.findOne({ _id: new ObjectId(id) });

    if (!existingItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    const oldSlug = existingItem.slug;
    const oldPath = `/catalog/item/${oldSlug}`;

    // 🟢 Step 2: Update the item with the new data
    await catalogItems.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          brand,
          name,
          description,
          type,
          typeName,
          priceMin: parsedPriceMin,
          priceMax: parsedPriceMax,
          imageUrl,
          slug: newSlug,
          modifiedAt: new Date(),
        },
      }
    );

    // 🔄 Step 3: Update the quick link based on the old path
    await quickLinks.updateOne(
      { path: oldPath },
      { $set: { path: newPath, label: name, parent } },
      { upsert: true }
    );

    res.status(200).json({ message: "Catalog item updated" });
  } catch (err) {
    console.error("PUT /catalog error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default withAuth(handler);