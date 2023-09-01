import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

dotenv.config();

const uri = process.env.MONGODB_URI;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 30000, // Set the timeout to 30 seconds
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 60000, // Set the timeout to 60 seconds
};

let client;

export async function connectToDatabase() {
  if (!client) {
    console.log('Connecting to database');
    try {
      client = new MongoClient(uri, options);
      await client.connect();
    } catch (error) {
      console.error('Failed to connect to the database', error);
      throw error;
    }
  }

  return {
    db: client.db('KnoMoreJunk'), // replace 'test' with your actual database name
    client,
  };
}

