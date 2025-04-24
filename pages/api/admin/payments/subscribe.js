// pages/api/admin/payments/subscribe.js

import jwt from "jsonwebtoken";
import dbConnect from "../../../../lib/mongoose";
import User from "../../../../models/users";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user || !user.roles.includes("Owner")) {
      return res.status(403).json({ error: "Only the owner can subscribe" });
    }

    const tierPriceMap = {
      1: process.env.TIER_1_PRICE_ID,
      2: process.env.TIER_2_PRICE_ID,
      3: process.env.TIER_3_PRICE_ID,
    };

    const priceId = tierPriceMap[user.tier];
    if (!priceId) {
      console.error("❌ Invalid tier or missing price ID:", user.tier);
      return res.status(400).json({ error: "Invalid pricing tier selected." });
    }

    console.log("✅ Using Stripe Price ID:", priceId);

    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.fName} ${user.lName}`,
        metadata: { mongoUserId: user._id.toString() },
      });

      stripeCustomerId = customer.id;
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }

    if (!user.setupFeePaid && user.setupFeeAmount > 0) {
      console.log("💸 Adding one-time setup fee:", user.setupFeeAmount);
      await stripe.invoiceItems.create({
        customer: stripeCustomerId,
        amount: user.setupFeeAmount,
        currency: "usd",
        description: "One-time setup fee for custom site build",
      });
    }

    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
    });

    console.log("📦 Subscription created:", subscription.id);

    const invoiceId = subscription.latest_invoice;
    if (!invoiceId) {
      return res.status(400).json({ error: "No invoice created for subscription." });
    }

    const invoice = await stripe.invoices.retrieve(invoiceId);

    if (!invoice.payment_intent) {
      console.log("❌ No payment_intent found on invoice:", invoice.id);
      return res.status(400).json({
        error: "No payment intent was generated. Ensure your price and setup fee are valid.",
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);

    user.subscriptionId = subscription.id;
    user.subscriptionStatus = subscription.status;
    await user.save();

    console.log("✅ Returning clientSecret:", paymentIntent.client_secret);
    res.status(200).json({ clientSecret: paymentIntent.client_secret });

  } catch (err) {
    console.error("🔥 Stripe Subscribe Error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message || "Unknown error",
    });
  }
}
