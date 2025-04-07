// /pages/api/catalog/add.js
import clientPromise from "../../../lib/mongodb";
import slugify from "slugify";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { type, typeName, brand, name, description, priceMin, priceMax, imageUrl } = req.body;

  if (!type || !typeName || !brand || !name || !description || !imageUrl) {
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

    const result = await db.collection("catalogItems").insertOne({
      type,
      typeName,
      brand,
      name,
      description,
      priceMin: parsedPriceMin,
      priceMax: parsedPriceMax,
      imageUrl,
      slug,
      createdAt: new Date(),
    });

    await db.collection("quickLinks").updateOne(
      { path },
      { $set: { path, label: name, parent } },
      { upsert: true }
    );

    res.status(201).json({ message: "Catalog item added", id: result.insertedId });
  } catch (e) {
    console.error("POST /catalog error:", e);
    res.status(500).json({ error: "Something went wrong" });
  }
}
