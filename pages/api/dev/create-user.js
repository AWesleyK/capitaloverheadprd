import dbConnect from "../../../lib/mongoose";
import User from "../../../models/users";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  await dbConnect();

  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(409).json({ error: "Username already exists" });
  }

  const user = await User.create({
    username,
    setupComplete: false,
  });

  res.status(200).json({ message: "User created", user });
}
