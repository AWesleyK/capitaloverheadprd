import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const [quickLinks, catalogTypes] = await Promise.all([
      db.collection("quickLinks").find().toArray(),
      db.collection("catalogTypes").find().toArray(),
    ]);

    const catalogTypeNames = new Set(catalogTypes.map(t => t.typeName));

    const parents = quickLinks
      .filter(l => !l.parent)
      .sort((a, b) => (a.order || 9999) - (b.order || 9999));

    const children = quickLinks.filter(l => l.parent);

    const ordered = [];

    for (const parent of parents) {
      const isCatalogGroup = catalogTypeNames.has(parent.label);

      const labelWithSuffix = isCatalogGroup ? `${parent.label} Catalog` : parent.label;

      ordered.push({
        path: parent.path,
        label: labelWithSuffix,
        parent: null,
      });

      const groupedChildren = children
        .filter(c => c.parent === parent.label)
        .sort((a, b) => a.label.localeCompare(b.label));

      for (const child of groupedChildren) {
        ordered.push({
          path: child.path,
          label: child.label,
          parent: labelWithSuffix, // match updated label
        });
      }
    }

    res.status(200).json(ordered);
  } catch (err) {
    console.error("Error fetching quick links:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
