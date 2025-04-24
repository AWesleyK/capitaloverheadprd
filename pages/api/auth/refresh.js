import jwt from "jsonwebtoken";
import dbConnect from "../../../lib/mongoose";
import User from "../../../models/users";
import SubscriptionSettings from "../../../models/settings/subscriptionSettings";
import cookie from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const settings = await SubscriptionSettings.findOne();

    // Create fresh JWT payload
    const payload = {
      id: user._id,
      username: user.username,
      roles: user.roles,
      tier: user.tier,
      setupFeePaid: settings?.setupFeePaid || false,
      subscriptionStatus: settings?.subscriptionStatus || "inactive",
    };

    const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("JWT refresh error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
