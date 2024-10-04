import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

const uri = process.env.MONGODB_URI;
const SECRET_KEY = process.env.CRON_SECRET_KEY;

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const client = new MongoClient(uri);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const providedKey = req.headers["x-cron-key"] || req.query.key;
  if (providedKey !== SECRET_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await client.connect();
    const database = client.db("ChaiMine");

    await database.collection("SongDagapur").deleteMany({});
    await database.collection("SongSevoke").deleteMany({});

    res.status(200).json({
      message: "Collections cleared successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Error connecting to the database" });
  } finally {
    await client.close();
  }
}
