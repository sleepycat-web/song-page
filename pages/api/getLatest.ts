import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
let client: MongoClient;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db("ChaiMine");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const { location } = req.query;

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

    res.status(200).json(latestEntry[0]);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch data" });
  }
}
