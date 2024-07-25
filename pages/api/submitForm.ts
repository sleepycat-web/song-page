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

// Helper function to format the date to "11 July 2021 12:23 pm"
function formatDateToIST(date: Date): string {
  // Convert to IST by adding 5 hours and 30 minutes
  const istOffset = 0;
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {
    const { location, youtubeLink, name } = req.body;
    const db = await connectToDatabase();
    const collection = db.collection("Song");

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
