import Stripe from "stripe";
import jwt from "jsonwebtoken";
import dbConnect from "../../../../lib/mongoose";
import User from "../../../../models/users";
import SubscriptionSettings from "../../../../models/settings/subscriptionSettings";

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

    let settings = await SubscriptionSettings.findOne();
    if (!settings) {
      settings = await SubscriptionSettings.create({});
    }

    const tierPriceMap = {
      1: process.env.TIER_1_PRICE_ID,
      2: process.env.TIER_2_PRICE_ID,
      3: process.env.TIER_3_PRICE_ID,
      4: process.env.TIER_TEST_PRICE_ID,
    };

    const priceId = tierPriceMap[settings.tier || user.tier];
    if (!priceId) {
      return res.status(400).json({ error: "Invalid pricing tier" });
    }

    let stripeCustomerId = settings.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.fName} ${user.lName}`,
        metadata: { mongoUserId: user._id.toString() },
      });
      stripeCustomerId = customer.id;
      settings.stripeCustomerId = stripeCustomerId;
      await settings.save();
    }

    // Optional: Add setup fee if not paid
    const setupFeeAmount = !settings.setupFeePaid && settings.setupFeeAmount > 0
      ? [{
          price_data: {
            currency: "usd",
            product_data: {
              name: "Setup Fee",
            },
            unit_amount: settings.setupFeeAmount,
          },
          quantity: 1,
        }]
      : [];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: stripeCustomerId,
      line_items: [
        ...setupFeeAmount,
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/payments?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/payments?status=cancelled`,
      metadata: {
        mongoUserId: user._id.toString(),
      },
    });

    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("Checkout Session Error:", err);
    res.status(500).json({ error: "Internal server error", details: err.message });
  }
}
