// /pages/api/content/business-hours/post.js

import clientPromise from '../../../../lib/mongodb';
import { withAuth } from '../../../../lib/middleware/withAuth';

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { category, hours } = req.body;

  if (!category || !["store", "operation"].includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  if (!hours || typeof hours !== "object") {
    return res.status(400).json({ error: "Invalid hours object" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("garage_catalog");

    const updates = await Promise.all(
      daysOfWeek.map((day, index) =>
        db.collection("businessHours").updateOne(
          { day, category },
          {
            $set: {
              hours: hours[day],
              order: index + 1,
            },
          },
          { upsert: true }
        )
      )
    );

    res.status(200).json({ message: "Business hours updated", result: updates });
  } catch (err) {
    console.error("POST /business-hours error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export default withAuth(handler, { roles: ["Admin", "Owner"], minTier: 1 });
