import dbConnect from "../../../../lib/mongoose";
import User from "../../../../models/users";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.roles?.includes("Owner")) {
      return res.status(403).json({ error: "Access denied" });
    }

    await dbConnect();
    const users = await User.find({}, "-password"); // exclude password

    res.status(200).json({ users });
  } catch (err) {
    console.error("Error loading users:", err);
    res.status(500).json({ error: "Server error" });
  }
}
