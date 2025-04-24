import jwt from "jsonwebtoken";
import Stripe from "stripe";
import dbConnect from "../../../../lib/mongoose";
import User from "../../../../models/users";
import SubscriptionSettings from "../../../../models/settings/subscriptionSettings";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await dbConnect();
    const user = await User.findById(decoded.id);
    if (!user || !user.roles.includes("Owner")) return res.status(403).end();

    const settings = await SubscriptionSettings.findOne();
    if (!settings || !settings.subscriptionId) {
      return res.status(400).json({ error: "No active subscription." });
    }

    await stripe.subscriptions.del(settings.subscriptionId);

    settings.subscriptionStatus = "canceled";
    await settings.save();

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to cancel subscription." });
  }
}
