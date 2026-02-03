import clientPromise from "../../../lib/mongodb";
import { withAuth } from "../../../lib/middleware/withAuth";

function slugify(str) {
  return String(str || "")
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
}

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const {
    type,
    typeName,
    brand,
    name,
    description,
    priceMin,
    priceMax,
    imageUrl,
  } = req.body || {};

  if (!type || !typeName || !name || !imageUrl) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const now = new Date();

    const slug = slugify(`${brand || ""} ${name}`);
    const itemPath = `/catalog/item/${slug}`;

    // ✅ CHECK CORRECT COLLECTION
    const existing = await db
        .collection("catalogItems")
        .findOne({ slug });

    if (existing) {
      return res.status(409).json({
        error: "Item with this name already exists",
        slug,
      });
    }

    // ✅ INSERT INTO CORRECT COLLECTION
    const doc = {
      type,
      typeName,
      brand,
      name,
      description,
      priceMin: priceMin ? Number(priceMin) : null,
      priceMax: priceMax ? Number(priceMax) : null,
      imageUrl,
      slug,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db
        .collection("catalogItems")
        .insertOne(doc);

    // ✅ Update quickLinks child
    await db.collection("quickLinks").updateOne(
        { path: itemPath },
        {
          $set: {
            path: itemPath,
            label: name,
            parent: typeName,
            updatedAt: now,
          },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true }
    );

    res.status(201).json({
      message: "Catalog item added",
      id: result.insertedId,
    });

  } catch (err) {
    console.error("POST /catalog/add error:", err);
    res.status(500).json({ error: "Failed to add catalog item" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
