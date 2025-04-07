import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("garage_catalog");

  const services = await db.collection("services").find({}).sort({ createdAt: -1 }).toArray();
  res.status(200).json(services);
}
