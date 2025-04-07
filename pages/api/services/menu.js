// /pages/api/services/menu.js
import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("garage_catalog");

  const services = await db
    .collection("services")
    .find({}, { projection: { name: 1, slug: 1 } })
    .sort({ name: 1 })
    .toArray();

  res.status(200).json(services);
}
