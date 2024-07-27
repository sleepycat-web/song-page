import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI || "";
let client: MongoClient;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db("ChaiMine");
}

// Store the last sent ID for each location
const lastSentIds: { [key: string]: string } = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const { location } = req.query;

  if (typeof location !== "string") {
    return res.status(400).json({ error: "Invalid location parameter" });
  }

  try {
    const db = await connectToDatabase();
    const collection = db.collection("Song");

    const latestEntry = await collection
      .find({ location })
      .sort({ _id: -1 })
      .limit(1)
      .toArray();

    if (latestEntry.length === 0) {
      return res
        .status(404)
        .json({ error: "No data found for the specified location" });
    }

    const latestId = latestEntry[0]._id.toString();

    // Check if the latest ID is different from the last sent ID
    if (latestId !== lastSentIds[location]) {
      // Update the last sent ID for this location
      lastSentIds[location] = latestId;
      res.status(200).json(latestEntry[0]);
    } else {
      // If the ID is the same, send a 204 No Content status
      res.status(204).end();
    }
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch data" });
  }
}
