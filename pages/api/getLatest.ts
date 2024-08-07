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

function getCollectionName(location: string): string {
  switch (location) {
    case "Sevoke":
      return "SongSevoke";
    case "Dagapur":
      return "SongDagapur";
    default:
      throw new Error("Invalid location");
  }
}

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
    let collectionName: string;

    try {
      collectionName = getCollectionName(location);
    } catch (error) {
      return res.status(400).json({ error: "Invalid location" });
    }

    const collection = db.collection(collectionName);

    // Find the first pending song
    const pendingSong = await collection.findOne({ status: "pending" });

    if (!pendingSong) {
      return res
        .status(404)
        .json({ error: "No pending songs found for the specified location" });
    }

    // Update the song status to 'played'
    await collection.updateOne(
      { _id: pendingSong._id },
      { $set: { status: "played" } }
    );

    // Remove the _id field from the response
    const { _id, ...songWithoutId } = pendingSong;

    res.status(200).json(songWithoutId);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch or update data" });
  }
}
