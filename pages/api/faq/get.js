import dbConnect from "../../../lib/mongoose";
import FAQ from "../../../models/FAQ";

export default async function handler(req, res) {
  try {
    await dbConnect();

    const faqs = await FAQ.find({}).sort({ order: 1, createdAt: -1 });

    res.status(200).json(faqs);
  } catch (err) {
    console.error("GET public FAQ error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
