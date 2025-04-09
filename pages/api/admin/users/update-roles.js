import dbConnect from "../../../../lib/mongoose";
import User from "../../../../models/users";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "PUT") return res.status(405).end();

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.roles?.includes("Owner")) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { id, roles } = req.body;
    if (!id || !Array.isArray(roles)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    await dbConnect();

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.roles = roles;
    await user.save();

    res.status(200).json({ message: "Roles updated" });
  } catch (err) {
    console.error("Update roles error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
