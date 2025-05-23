import dbConnect from "../../../lib/mongoose";
import User from "../../../models/users";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  await dbConnect();
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  if (user.accountLocked) {
    return res.status(403).json({ error: "Account is locked. Contact support." });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;

    if (user.loginAttempts >= 3) {
      user.accountLocked = true;
      user.lockedBy = "System";
      user.lockedAt = new Date();
    }

    await user.save();
    return res.status(401).json({
      error: user.accountLocked
        ? "Account is now locked due to multiple failed attempts."
        : "Invalid username or password",
    });
  }

  // ✅ Correct password
  user.loginAttempts = 0;
  user.lastLogin = new Date();
  await user.save();

  if (user.setupComplete === false) {
    return res.status(200).json({
      setupRequired: true,
      userId: user._id,
    });
  }

  const token = jwt.sign(
    {
      id: user._id,
      username: user.username,
      roles: user.roles,
      tier: user.tier,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.setHeader(
    "Set-Cookie",
    serialize("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    })
  );

  res.status(200).json({ message: "Login successful" });
}
