// /pages/api/auth/register.js
import dbConnect from "../../../lib/mongoose";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  await dbConnect();

  const { username, password, email, fName, lName } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });

  const existingUser = await User.findOne({ username });
  if (existingUser) return res.status(409).json({ error: "Username already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    password: hashedPassword,
    email,
    fName,
    lName,
    role: "User",
    accountLocked: false,
    loginAttempts: 0
  });

  await newUser.save();
  res.status(201).json({ message: "User registered successfully" });
}
