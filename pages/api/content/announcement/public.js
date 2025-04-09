import dbConnect from "../../../../lib/mongoose";
import Announcement from "../../../../models/settings/announcement";

export default async function handler(req, res) {
  await dbConnect();

  const banner = await Announcement.findOne({ enabled: true }).sort({ updatedAt: -1 });

  if (!banner || (banner.expiresAt && new Date() > banner.expiresAt)) {
    return res.status(200).json({ banner: null });
  }

  res.status(200).json({ banner });
}
