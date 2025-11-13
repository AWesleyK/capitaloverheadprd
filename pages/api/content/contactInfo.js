// pages/api/content/contact-info.js
import dbConnect from '../../../lib/mongodb';   // adjust path if yours is different
import Setting from '../../../models/settings/siteSettings';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const doc = await Setting.findOne({ key: 'contactInfo' }).lean();

    if (!doc) {
      return res.status(404).json({ error: 'Contact info not found' });
    }

    const { _id, __v, ...safe } = doc;
    return res.status(200).json(safe);
  } catch (err) {
    console.error('Error fetching contact info:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
