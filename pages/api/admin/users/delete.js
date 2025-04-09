import dbConnect from "../../../../lib/mongoose";
import User from "../../../../models/users";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.roles?.includes("Owner")) {
      return res.status(403).json({ error: "Access denied" });
    }

    await dbConnect();

    const id = req.query.id;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await User.deleteOne({ _id: id });

    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
