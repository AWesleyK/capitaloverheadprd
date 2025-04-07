import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    // Fetch all quick links
    const links = await db.collection("quickLinks").find().toArray();

    // Separate and sort parents by 'order', and sort children alphabetically under each parent
    const parents = links
      .filter(l => !l.parent)
      .sort((a, b) => (a.order || 9999) - (b.order || 9999)); // fallback to 9999 if no order

    const children = links.filter(l => l.parent);

    const ordered = [];

    // Push parents into final array, followed by their children
    for (const parent of parents) {
      ordered.push({
        path: parent.path,
        label: parent.label,
        parent: null,
      });

      const groupedChildren = children
        .filter(c => c.parent === parent.label)
        .sort((a, b) => a.label.localeCompare(b.label));

      for (const child of groupedChildren) {
        ordered.push({
          path: child.path,
          label: child.label,
          parent: child.parent,
        });
      }
    }

    res.status(200).json(ordered);
  } catch (err) {
    console.error("Error fetching quick links:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
