import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  try {
    // Avoid stale responses (especially on Vercel/CDN)
    res.setHeader("Cache-Control", "no-store, max-age=0");

    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const [quickLinks, catalogTypes] = await Promise.all([
      db.collection("quickLinks").find().toArray(),
      db.collection("catalogTypes").find().toArray(),
    ]);

    const catalogTypeNames = new Set(catalogTypes.map((t) => t.typeName));

    const parents = quickLinks
        .filter((l) => !l.parent)
        .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

    const children = quickLinks.filter((l) => !!l.parent);

    const ordered = [];

    for (const parent of parents) {
      const parentKey = parent.label; // IMPORTANT: match children against DB key
      const isCatalogGroup = catalogTypeNames.has(parentKey);

      // Display label can be prettified without breaking parent matching
      const displayLabel = isCatalogGroup ? `${parentKey} Catalog` : parentKey;

      ordered.push({
        path: parent.path,
        label: displayLabel,
        parent: null,
        order: parent.order ?? null,
        // optional: helps debugging and future-proofing
        parentKey,
      });

      // Match children by the DB parent value OR by display label (handles legacy data)
      const groupedChildren = children
          .filter(
              (c) => c.parent === parentKey || c.parent === displayLabel
          )
          .sort((a, b) => a.label.localeCompare(b.label));

      for (const child of groupedChildren) {
        ordered.push({
          path: child.path,
          label: child.label,
          parent: displayLabel, // Footer groups by this
        });
      }
    }

    res.status(200).json(ordered);
  } catch (err) {
    console.error("Error fetching quick links:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
