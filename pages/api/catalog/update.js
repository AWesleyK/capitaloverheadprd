// /pages/api/catalog/update.js
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import slugify from "slugify";

export default async function handler(req, res) {
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

  const slug = slugify(name, { lower: true, strict: true });
  const path = `/catalog/item/${slug}`;
  const parent = type === "Garage Doors" ? "Garage Door Catalog"
              : type === "Gates" ? "Gate Catalog"
              : null;

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    await db.collection("catalogItems").updateOne(
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
          slug,
          modifiedAt: new Date(),
        },
      }
    );

    await db.collection("quickLinks").updateOne(
      { path },
      { $set: { path, label: name, parent } },
      { upsert: true }
    );

    res.status(200).json({ message: "Catalog item updated" });
  } catch (err) {
    console.error("PUT /catalog error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
