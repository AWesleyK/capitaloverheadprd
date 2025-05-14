// /pages/api/admin/dashboard/promotions/delete.js

import clientPromise from "../../../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { del } from "@vercel/blob";

export default async function handler(req, res) {
  const { id } = req.query;
  if (req.method !== "DELETE") return res.status(405).end("Method not allowed");

  if (!id) return res.status(400).json({ error: "Missing ID" });

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const entry = await db.collection("promotionImages").findOne({ _id: new ObjectId(id) });
    if (!entry) return res.status(404).json({ error: "Image not found" });

    // Delete the file from Vercel Blob
    await del(entry.url); // Only works if using Vercel Blob SDK and URL is valid

    // Delete the MongoDB record
    await db.collection("promotionImages").deleteOne({ _id: new ObjectId(id) });

    return res.status(200).json({ message: "Deleted from DB and blob" });
  } catch (err) {
    console.error("DELETE promotion error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
