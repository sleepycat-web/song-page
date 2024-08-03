import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const client = new MongoClient(uri);

function getISTTime(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffset = 0;
  const ist = new Date(utc + istOffset);
  return ist.toISOString();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      await client.connect();
      const database = client.db("ChaiMine");

      const location = req.query.location as string;
      const collectionName =
        location === "dagapur" ? "SongDagapur" : "SongSevoke";
      const collection = database.collection(collectionName);

      const entries = await collection
        .find({})
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray();

      const currentTime = getISTTime();

      res.status(200).json({
        entries,
        currentTime,
      });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Error connecting to the database" });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
