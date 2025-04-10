// /pages/api/logs/search.js
import dbConnect from "../../../../../lib/mongoose";
import SearchLog from "../../../../../models/logs/searchLog";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    await dbConnect();
    const { page, queryParams } = req.body;

    await SearchLog.create({
      page,
      queryParams,
      userAgent: req.headers['user-agent'] || '',
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    });

    res.status(200).json({ message: "Search logged" });
  } catch (err) {
    console.error("Failed to log search:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
