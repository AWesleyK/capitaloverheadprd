import dbConnect from "../../../../lib/mongoose";
import User from "../../../../models/users";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "PUT") return res.status(405).end();

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.roles?.includes("Owner")) {
      return res.status(403).json({ error: "Access denied" });
    }

    const { id, newPassword } = req.body;
    if (!id || !newPassword) {
      return res.status(400).json({ error: "Missing user ID or password" });
    }

    await dbConnect();

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    user.password = await bcrypt.hash(newPassword, 10);
    user.setupComplete = false;
    
    await user.save();

    res.status(200).json({ message: "Password reset" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
