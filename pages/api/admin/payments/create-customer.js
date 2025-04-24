import Stripe from 'stripe';
import { getSession } from 'next-auth/react';
import User from '../../../../models/users';
import dbConnect from '../../../../lib/mongoose';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const session = await getSession({ req });
  await dbConnect();
  
  const user = await User.findById(session.user.id);
  if (!user) return res.status(404).end();

  // If already has a Stripe ID
  if (user.stripeCustomerId) return res.status(200).json({ customerId: user.stripeCustomerId });

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.username,
    metadata: { userId: user._id.toString(), tier: user.tier }
  });

  user.stripeCustomerId = customer.id;
  await user.save();

  res.status(200).json({ customerId: customer.id });
}
