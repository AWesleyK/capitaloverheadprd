import dbConnect from "../../../lib/mongoose";
import User from "../../../models/users";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const {
    userId,
    password,
    fName,
    lName,
    email,
    address,
    city,
    state,
    zip,
  } = req.body;

  if (!userId || !password || !fName || !lName || !email) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  await dbConnect();

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found." });

  const hashed = await bcrypt.hash(password, 10);

  user.password = hashed;
  user.setupComplete = true;

  user.fName = fName;
  user.lName = lName;
  user.email = email;
  user.address = address;
  user.city = city;
  user.state = state;
  user.zip = zip;

  await user.save();

  res.status(200).json({ message: "Setup complete" });
}
