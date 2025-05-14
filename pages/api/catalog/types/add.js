import clientPromise from "../../../../lib/mongodb";
import { withAuth } from "../../../../lib/middleware/withAuth";

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { type } = req.body;
  if (!type) return res.status(400).json({ error: "Missing type" });

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const cleanedType = type.trim();
    const safePath = `/catalog/${cleanedType.toLowerCase().replace(/\s+/g, "-")}`;

    // ✂️ Remove trailing 's' ONLY if it's plural-looking (basic rule)
    const typeName = cleanedType.endsWith("s") && cleanedType.length > 3
      ? cleanedType.slice(0, -1)
      : cleanedType;

    // 🔍 Check for existing type (case-insensitive)
    const existing = await db
      .collection("catalogTypes")
      .findOne({ type: { $regex: new RegExp(`^${cleanedType}$`, "i") } });

    if (existing) {
      return res.status(409).json({ error: "Catalog type already exists." });
    }

    // ✅ Insert new catalog type
    await db.collection("catalogTypes").insertOne({ type: cleanedType, typeName, createdAt: new Date() });

    // 🔢 Find next available quickLinks order
    const highestOrder = await db
      .collection("quickLinks")
      .find({ order: { $lt: 9999 } })
      .sort({ order: -1 })
      .limit(1)
      .toArray();

    const nextOrder = highestOrder[0]?.order ? highestOrder[0].order + 1 : 1;

    // 📌 Add parent quickLink group
    await db.collection("quickLinks").updateOne(
      { path: safePath },
      {
        $set: {
          path: safePath,
          label: typeName,
          order: nextOrder,
        },
      },
      { upsert: true }
    );

    res.status(201).json({ message: "Catalog type and quick link added" });
  } catch (err) {
    console.error("POST /catalog/types error:", err);
    res.status(500).json({ error: "Failed to add catalog type" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
