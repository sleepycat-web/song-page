import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const client = new MongoClient(uri);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      await client.connect();
      const database = client.db("ChaiMine");

      // Determine which collection to query based on the 'location' query parameter
      const location = req.query.location as string;
      const collectionName =
        location === "dagapur" ? "SongDagapur" : "SongSevoke";
      const collection = database.collection(collectionName);

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const entries = await collection
        .find({
          timestamp: { $gte: twentyFourHoursAgo.toISOString() },
        })
        .sort({ timestamp: -1 })
        .toArray();

      res.status(200).json(entries);
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
