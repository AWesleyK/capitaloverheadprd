import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Roles check - Only Admin and Owner can trigger rebuild
    const allowedRoles = ["Admin", "Owner"];
    if (!decoded.roles || !decoded.roles.some(role => allowedRoles.includes(role))) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const deployHookUrl = process.env.DEPLOY_HOOK_URL || process.env.NEXT_PUBLIC_DEPLOY_HOOK_URL;

    if (!deployHookUrl) {
      console.error("Missing DEPLOY_HOOK_URL");
      return res.status(500).json({ error: "Deploy hook URL not configured" });
    }

    const response = await fetch(deployHookUrl, { method: "POST" });

    if (response.ok) {
      res.status(200).json({ message: "Rebuild triggered successfully" });
    } else {
      const errorText = await response.text();
      console.error("Vercel deploy hook error:", errorText);
      res.status(500).json({ error: "Failed to trigger rebuild on Vercel" });
    }
  } catch (err) {
    console.error("Rebuild API error:", err);
    res.status(500).json({ error: "Failed to trigger rebuild" });
  }
}
