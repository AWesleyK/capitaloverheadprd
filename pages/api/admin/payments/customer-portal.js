import Stripe from "stripe";
import jwt from "jsonwebtoken";
import User from '../../../../models/users';
import dbConnect from '../../../../lib/mongoose';
import SubscriptionSettings from "../../../../models/settings/subscriptionSettings";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await dbConnect();

    const subSettings = await SubscriptionSettings.findOne(); // assuming single entry
    if (!subSettings?.stripeCustomerId) {
      return res.status(404).json({ error: "Stripe customer ID not found." });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subSettings.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/payments`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Customer portal error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
