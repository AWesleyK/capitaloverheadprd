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

    const { question, answer, order } = req.body;
    const targetOrder = parseInt(order) || 0;

    if (!question || !answer) {
      return res.status(400).json({ error: "Question and answer are required" });
    }

    // If the order already exists, push it and all greater ones by one
    const conflictExists = await FAQ.exists({ order: targetOrder });
    if (conflictExists) {
      await FAQ.updateMany(
        { order: { $gte: targetOrder } },
        { $inc: { order: 1 } }
      );
    }

    const newFAQ = new FAQ({
      question,
      answer,
      order: targetOrder,
    });

    await newFAQ.save();

    res.status(200).json(newFAQ);
  } catch (err) {
    console.error("SAVE FAQ error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
