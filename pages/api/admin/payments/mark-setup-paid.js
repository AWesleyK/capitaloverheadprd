import jwt from "jsonwebtoken";
import dbConnect from "../../../../lib/mongoose";
import User from "../../../../models/users";
import SubscriptionSettings from "../../../../models/settings/subscriptionSettings";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user || !user.roles.includes("Owner")) {
      return res.status(403).json({ error: "Only the owner can update setup status" });
    }

    let settings = await SubscriptionSettings.findOne();
    if (!settings) {
      settings = await SubscriptionSettings.create({});
    }

    if (!settings.setupFeePaid) {
      settings.setupFeePaid = true;
      await settings.save();
      console.log("✅ Setup fee marked as paid for owner");
    }

    res.status(200).json({ success: true });

  } catch (err) {
    console.error("Error marking setup fee paid:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
