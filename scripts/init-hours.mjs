// /scripts/init-hours.mjs
import { MongoClient } from "mongodb";
import dotenv from 'dotenv';
dotenv.config({ path: '../../../.env.local' });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "garage_catalog";

const storeHours = [
  { day: "Monday", hours: "8:00 AM - 5:00 PM", category: "store", order: 1 },
  { day: "Tuesday", hours: "8:00 AM - 5:00 PM", category: "store", order: 2 },
  { day: "Wednesday", hours: "8:00 AM - 5:00 PM", category: "store", order: 3 },
  { day: "Thursday", hours: "8:00 AM - 5:00 PM", category: "store", order: 4 },
  { day: "Friday", hours: "8:00 AM - 5:00 PM", category: "store", order: 5 },
  { day: "Saturday", hours: "Closed", category: "store", order: 6 },
  { day: "Sunday", hours: "Closed", category: "store", order: 7 },
];

const operationHours = [
  { day: "Monday", hours: "Open 24 Hours", category: "operation", order: 1 },
  { day: "Tuesday", hours: "Open 24 Hours", category: "operation", order: 2 },
  { day: "Wednesday", hours: "Open 24 Hours", category: "operation", order: 3 },
  { day: "Thursday", hours: "Open 24 Hours", category: "operation", order: 4 },
  { day: "Friday", hours: "Open 24 Hours", category: "operation", order: 5 },
  { day: "Saturday", hours: "Open 24 Hours", category: "operation", order: 6 },
  { day: "Sunday", hours: "Open 24 Hours", category: "operation", order: 7 },
];

async function seedHours() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("businessHours");

    // 💥 Purge existing records
    await collection.deleteMany({});

    // ✅ Insert all new records
    await collection.insertMany([...storeHours, ...operationHours]);

    console.log("✅ businessHours collection has been refreshed.");
  } catch (err) {
    console.error("❌ Error seeding hours:", err);
  } finally {
    await client.close();
  }
}

seedHours();
