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

    const { id, fName, lName, email, address, city, state, zip } = req.body;

    if (!id) return res.status(400).json({ error: "Missing user ID" });

    await dbConnect();

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.fName = fName ?? user.fName;
    user.lName = lName ?? user.lName;
    user.email = email ?? user.email;
    user.address = address ?? user.address;
    user.city = city ?? user.city;
    user.state = state ?? user.state;
    user.zip = zip ?? user.zip;

    await user.save();

    res.status(200).json({ message: "User details updated" });
  } catch (err) {
    console.error("Update details error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
