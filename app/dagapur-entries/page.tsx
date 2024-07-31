"use client";
import { useState, useEffect } from "react";

interface Entry {
  _id: string;
  location: string;
  youtubeLink: string;
  name: string;
  timestamp: string;
}

export default function DagapurQueue() {
  const [entries, setEntries] = useState<Entry[]>([]);
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
        setEntries(data);
      } catch (error) {
        console.error("Failed to fetch entries:", error);
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchEntries();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-xl mb-4">Dagapur Entries</h1>
      <ul>
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
            <p>Timestamp: {entry.timestamp}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
