export default async function handler(req, res) {
    const { customerId } = req.body;
  
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/payments`
    });
  
    res.status(200).json({ url: session.url });
  }
  