// pages/api/admin/content/site-settings/save.js
import dbConnect from "../../../../../lib/mongoose";
import User from "../../../../../models/users";
import SiteSettings from "../../../../../models/settings/siteSettings";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  try {
    await dbConnect();

    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const {
      email,
      phone,
      addressLine1,
      addressLine2,
      facebookPercentageRecommended,
      facebookReviewCount,
      facebookReviewsUrl,
      facebookReviewLabel,
    } = req.body || {};

    // Validate phone is exactly 10 digits
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        error: "Phone number must be exactly 10 digits (numbers only).",
      });
    }

    // Facebook fields validation
    if (
      facebookPercentageRecommended !== undefined &&
      (facebookPercentageRecommended < 0 || facebookPercentageRecommended > 100)
    ) {
      return res.status(400).json({
        error: "Facebook recommendation percentage must be between 0 and 100.",
      });
    }
    if (
      facebookReviewCount !== undefined &&
      (facebookReviewCount < 0 || !Number.isInteger(Number(facebookReviewCount)))
    ) {
      return res.status(400).json({
        error: "Facebook review count must be a non-negative integer.",
      });
    }
    if (facebookReviewsUrl && !/^https?:\/\/.+/.test(facebookReviewsUrl)) {
      return res.status(400).json({
        error:
          "Facebook reviews URL must be a valid URL starting with http:// or https://.",
      });
    }

    // Auto-format phone into (###) ###-####
    const phoneDisplay = `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;

    const updated = await SiteSettings.findOneAndUpdate(
      { key: "siteSettings" },
      {
        $set: {
          email: email || "",
          phone,
          phoneDisplay,
          addressLine1: addressLine1 || "",
          addressLine2: addressLine2 || "",
          facebookPercentageRecommended: Number(facebookPercentageRecommended) || 0,
          facebookReviewCount: Number(facebookReviewCount) || 0,
          facebookReviewsUrl: facebookReviewsUrl || "",
          facebookReviewLabel: facebookReviewLabel || "",
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    const { _id, __v, ...safe } = updated;
    res.status(200).json({ message: "Site settings saved", settings: safe });
  } catch (err) {
    console.error("SAVE site-settings error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
