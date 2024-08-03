"use client";
import { useState, useEffect } from "react";

interface Entry {
  _id: string;
  location: string;
  youtubeLink: string;
  name: string;
  timestamp: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
   return date
     .toLocaleString("en-US", {
       day: "numeric",
       month: "long",
       year: "numeric",
       hour: "numeric",
       minute: "2-digit",
       hour12: true,
     })
     .replace(" at", "");
     
}

export default function DagapurQueue() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEntries() {
      try {
        const response = await fetch("/api/showLatest?location=dagapur");
        if (!response.ok) {
          throw new Error("Failed to fetch entries");
        }
        const data = await response.json();
        // Sort entries by timestamp in descending order
        const sortedEntries = data.entries.sort(
          (a: Entry, b: Entry) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setEntries(sortedEntries);
        setCurrentTime(data.currentTime);
      } catch (error) {
        console.error("Failed to fetch entries:", error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main className="">
      <h1 className="text-xl mb-4">Dagapur Entries</h1>
      <div className="mb-4">
        <p> {formatDate(currentTime)}</p>
        {/* <p>Showing {entries.length} most recent entries</p> */}
      </div>
      <ul className="text-white">
        {entries.map((entry) => (
          <li className="mb-4" key={entry._id}>
            <p>Name: {entry.name}</p>
            <p>
              YouTube Link:{" "}
              <a
                href={entry.youtubeLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                {entry.youtubeLink}
              </a>
            </p>
            <p>Timestamp: {formatDate(entry.timestamp)}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
