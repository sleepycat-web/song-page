"use client";

import React, { useEffect, useState } from "react";

interface Song {
  _id: string;
  location: string;
  youtubeLink: string;
  name: string;
  timestamp: string;
}

const LatestSongDagapur: React.FC = () => {
  const [latestSong, setLatestSong] = useState<Song | null>(null);

  useEffect(() => {
    const fetchLatestSong = async () => {
      try {
        const response = await fetch("/api/getLatest?location=Dagapur");
        if (response.ok) {
          const data: Song = await response.json();
          if (
            data.location === "Dagapur" &&
            (!latestSong || data._id !== latestSong._id)
          ) {
            setLatestSong(data);
          }
        }
      } catch (error) {
        console.error("Error fetching latest song:", error);
      }
    };

    // Poll the API every second
    const intervalId = setInterval(fetchLatestSong, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [latestSong]);

  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div>
      {latestSong ? (
        <div>
          <h2>Latest Song in Dagapur</h2>
          <p>
            <strong>Location:</strong> {latestSong.location}
          </p>
          <p>
            <strong>YouTube Link:</strong> {latestSong.youtubeLink}
          </p>
          <p>
            <strong>Name:</strong> {latestSong.name}
          </p>
          <p>
            <strong>Last Updated:</strong> {latestSong.timestamp}
          </p>
          {getYouTubeVideoId(latestSong.youtubeLink) && (
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                latestSong.youtubeLink
              )}?autoplay=1&mute=0`}
              title={`YouTube video player for ${latestSong.name}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default LatestSongDagapur;