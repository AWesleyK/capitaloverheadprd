import clientPromise from "../../../../lib/mongodb";
import { withAuth } from "../../../../lib/middleware/withAuth";

function slugify(str) {
  return String(str || "")
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
}

function singularizeBasic(name) {
  const cleaned = String(name || "").trim();
  if (cleaned.endsWith("s") && cleaned.length > 3) return cleaned.slice(0, -1);
  return cleaned;
}

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { type, typeName: typeNameFromBody } = req.body || {};
  if (!type) return res.status(400).json({ error: "Missing type" });

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const cleanedType = String(type).trim();
    const computedTypeName = singularizeBasic(cleanedType);
    const typeName = String(typeNameFromBody || computedTypeName).trim();

    // ✅ Case-insensitive uniqueness for type
    const existing = await db
        .collection("catalogTypes")
        .findOne({ type: { $regex: new RegExp(`^${cleanedType}$`, "i") } });

    if (existing) {
      return res.status(409).json({ error: "Catalog type already exists." });
    }

    const typeSlug = slugify(typeName);
    const safePath = `/catalog/${typeSlug}`;
    const now = new Date();

    // ✅ Insert new catalog type
    await db.collection("catalogTypes").insertOne({
      type: cleanedType,
      typeName,
      typeSlug,
      createdAt: now,
      updatedAt: now,
    });

    // 🔢 Find next available quickLinks order (ignore 9999+)
    const highestOrderDoc = await db
        .collection("quickLinks")
        .find({ order: { $lt: 9999 } })
        .sort({ order: -1 })
        .limit(1)
        .next();

    const nextOrder = (highestOrderDoc?.order ?? 0) + 1;

    // 📌 Upsert parent quickLink group
    // IMPORTANT: label = typeName (this is the grouping key children should reference)
    await db.collection("quickLinks").updateOne(
        { path: safePath },
        {
          $set: {
            path: safePath,
            label: typeName,
            order: nextOrder,
            updatedAt: now,
          },
          $setOnInsert: {
            createdAt: now,
          },
        },
        { upsert: true }
    );

    return res.status(201).json({
      message: "Catalog type and parent quickLink added",
      type: cleanedType,
      typeName,
      typeSlug,
      path: safePath,
      order: nextOrder,
    });
  } catch (err) {
    console.error("POST /api/catalog/types/add error:", err);
    return res.status(500).json({ error: "Failed to add catalog type" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
