import dbConnect from "../../../../../lib/mongoose";
import jwt from "jsonwebtoken";
import FAQ from "../../../../../models/FAQ";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  try {
    await dbConnect();

    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id, question, answer, order } = req.body;
    const targetOrder = parseInt(order) || 0;

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    // If the order already exists for ANOTHER FAQ, push it and all greater ones by one
    const conflictExists = await FAQ.exists({ _id: { $ne: id }, order: targetOrder });
    if (conflictExists) {
      await FAQ.updateMany(
        { _id: { $ne: id }, order: { $gte: targetOrder } },
        { $inc: { order: 1 } }
      );
    }

    const updatedFAQ = await FAQ.findByIdAndUpdate(
      id,
      { question, answer, order: targetOrder },
      { new: true }
    );

    if (!updatedFAQ) {
      return res.status(404).json({ error: "FAQ not found" });
    }

    res.status(200).json(updatedFAQ);
  } catch (err) {
    console.error("UPDATE FAQ error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
