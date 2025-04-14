import dbConnect from "../../../../lib/mongoose";
import User from "../../../../models/users";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and temporary password are required" });
  }

  await dbConnect();

  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(409).json({ error: "Username already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hashedPassword,
    setupComplete: false,
  });

  res.status(200).json({ message: "User created", user });
}
