// pages/api/admin/blog/recentLinks.js
import clientPromise from "../../../../lib/mongodb";
import { withAuth } from "../../../../lib/middleware/withAuth";

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");
    
    const recentBlogs = await db
      .collection("blogs")
      .find({ isPublished: true })
      .sort({ publishDate: -1 })
      .limit(5)
      .project({ title: 1, slug: 1, metaDesc: 1 })
      .toArray();

    if (recentBlogs.length === 0) {
      return res.status(200).json({ html: "" });
    }

    const links = recentBlogs
      .map(
        (b) =>
          `<div class="linkCard"><h5><a href="/about/blogs/${b.slug}">${b.title}</a></h5><p>${b.metaDesc || "Read more about this topic..."}</p></div>`
      )
      .join("\n");
    
    const html = `\n\n<h3>Check out our other blogs:</h3>\n<div class="linkGrid">\n${links}\n</div>`;

    return res.status(200).json({ html });
  } catch (err) {
    console.error("Failed to fetch recent links:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
