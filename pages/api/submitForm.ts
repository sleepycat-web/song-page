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

function formatDateToIST(date: Date): string {
  const istOffset = 0; // IST offset in milliseconds
  const istDate = new Date(date.getTime() + istOffset);

  const day = istDate.getDate();
  const month = istDate.toLocaleString("default", { month: "long" });
  const year = istDate.getFullYear();

  let hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const strMinutes = minutes < 10 ? "0" + minutes : minutes;

  return `${day} ${month} ${year} ${hours}:${strMinutes} ${ampm}`;
}

function getCollectionName(location: string): string {
  switch (location.toLowerCase()) {
    case "dagapur":
      return "SongDagapur";
    case "sevoke":
      return "SongSevoke";
    default:
      throw new Error("Invalid location");
  }
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const { location, youtubeLink, name } = req.body;

    let collectionName: string;
    try {
      collectionName = getCollectionName(location);
    } catch (error) {
      return res.status(400).json({ error: "Invalid location" });
    }

    const db = await connectToDatabase();
    const collection = db.collection(collectionName);

    // // Get the last entry
    // const lastEntry = await collection
    //   .find({}, { sort: { _id: -1 }, limit: 1 })
    //   .toArray();

    // // Check if the youtubeLink exists in the last entry
    // const isDuplicate =
    //   lastEntry.length > 0 && lastEntry[0].youtubeLink === youtubeLink;

    // if (isDuplicate) {
    //   return res.status(400).json({ error: "duplicate_song" });
    // }

    // Get current date and time
    const now = new Date();

    // Format date and time to IST
    const formattedDate = formatDateToIST(now);

    await collection.insertOne({
      location,
      youtubeLink,
      name,
      timestamp: formattedDate,
    });

    res.status(200).json({ message: "Data saved successfully" });
  } catch (error) {
    res.status(500).json({ error: "Unable to save data" });
  }
}