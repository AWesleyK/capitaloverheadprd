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

    const initialFaqs = [
      {
        question: "Do you offer emergency garage door repair services?",
        answer: "Yes! We understand that a broken garage door can be a security risk or a major inconvenience. Dino Doors offers prompt service to get your door back on track as quickly as possible.",
        order: 0
      },
      {
        question: "Which garage door opener brands do you service?",
        answer: "We service and install all major brands, including LiftMaster (MyQ), Genie, Linear, and Chamberlain. We also stock remotes and keypads for most common models.",
        order: 1
      },
      {
        question: "How often should I have my garage door serviced?",
        answer: "We recommend a professional inspection and tune-up at least once a year. Regular maintenance can prevent costly repairs and extend the life of your garage door and opener.",
        order: 2
      },
      {
        question: "Do you repair automatic gate operators as well?",
        answer: "Absolutely! We specialize in both garage doors and automatic driveway gates. We service brands like LiftMaster, DoorKing, Maximum Controls, US Automatic, and MightyMule.",
        order: 3
      }
    ];

    // We use a "smart" restore that only adds missing ones
    let restoredCount = 0;
    for (const faq of initialFaqs) {
      const exists = await FAQ.exists({ question: faq.question });
      if (!exists) {
        await FAQ.create({ ...faq, createdAt: new Date() });
        restoredCount++;
      }
    }

    res.status(200).json({ success: true, restoredCount });
  } catch (err) {
    console.error("RESTORE FAQ error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
