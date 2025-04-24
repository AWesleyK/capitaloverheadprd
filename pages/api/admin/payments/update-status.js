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
    if (!settings || !settings.stripeCustomerId) {
      return res.status(400).json({ error: "Missing Stripe customer ID." });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: settings.stripeCustomerId,
      status: "all",
      limit: 1,
    });

    if (!subscriptions.data.length) {
      return res.status(400).json({ error: "No active subscriptions found." });
    }

    const subscription = subscriptions.data[0];
    settings.subscriptionId = subscription.id;
    settings.subscriptionStatus = subscription.status;
    await settings.save();

    res.status(200).json({ success: true, status: subscription.status });
  } catch (err) {
    console.error("Failed to update subscription status:", err);
    res.status(500).json({ error: "Unable to update subscription status." });
  }
}
