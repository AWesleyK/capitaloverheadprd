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

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    const faqToDelete = await FAQ.findById(id);

    if (!faqToDelete) {
      return res.status(404).json({ error: "FAQ not found" });
    }

    const deletedOrder = faqToDelete.order;
    await FAQ.findByIdAndDelete(id);

    // After deletion, shift all subsequent FAQs down by 1
    await FAQ.updateMany(
      { order: { $gt: deletedOrder } },
      { $inc: { order: -1 } }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("DELETE FAQ error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
