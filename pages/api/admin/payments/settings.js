import jwt from "jsonwebtoken";
import dbConnect from "../../../../lib/mongoose";
import User from "../../../../models/users";
import SubscriptionSettings from "../../../../models/settings/subscriptionSettings";

export default async function handler(req, res) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user || !user.roles.includes("Owner")) {
      return res.status(403).json({ error: "Only the owner can access settings." });
    }

    let settings = await SubscriptionSettings.findOne();

    if (!settings) {
      // Create the default subscription settings
      settings = await SubscriptionSettings.create({
        setupFeePaid: false,
        setupFeeAmount: 0,
        tier: user.tier || 1,
        subscriptionStatus: "inactive",
      });
    }

    res.status(200).json({
      setupFeePaid: settings.setupFeePaid,
      setupFeeAmount: settings.setupFeeAmount,
      subscriptionStatus: settings.subscriptionStatus,
      stripeCustomerId: settings.stripeCustomerId,
      tier: settings.tier,
    });

  } catch (err) {
    console.error("Error loading subscription settings:", err);
    res.status(500).json({ error: "Failed to load subscription settings" });
  }
}
