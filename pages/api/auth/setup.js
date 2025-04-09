import dbConnect from "../../../lib/mongoose";
import User from "../../../models/users";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({ error: "Missing user ID or password" });
  }

  await dbConnect();
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.password) {
    return res.status(400).json({ error: "Password already set" });
  }

  const hashed = await bcrypt.hash(password, 10);
  user.password = hashed;
  user.setupComplete = true;
  await user.save();

  res.status(200).json({ message: "Password set successfully" });
}
