"use client";

import songLibrary from "../../scripts/song/library";
import React, { useEffect, useState, useRef } from "react";
import YouTube from "react-youtube";
import Profile from "./profile";

interface Song {
  _id: string;
  location: string;
  youtubeLink: string;
  name: string;
  timestamp: string;
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const LatestSongDagapur: React.FC = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const youtubePlayerRef = useRef<YT.Player | null>(null);
  const [playerKey, setPlayerKey] = useState(0);
  const [isLibrarySong, setIsLibrarySong] = useState<boolean>(false);
  const [isValidYouTubeLink, setIsValidYouTubeLink] = useState(true);
  const [lastPlayedLibrarySongId, setLastPlayedLibrarySongId] = useState<
    string | null
  >(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const handleNewSong = (newSong: Song) => {
    if (isLibrarySong || queue.length === 0) {
      // If currently playing a library song or the queue is empty, play the new song immediately
      setCurrentSong(newSong);
      setIsLibrarySong(false);
      setPlayerKey((prevKey) => prevKey + 1); // Force YouTube player to reload
    } else {
      // If a queue song is playing, update the queue
      setQueue((prevQueue) => {
        const updatedQueue = prevQueue.map((song) =>
          song._id === newSong._id ? newSong : song
        );

        // If the current song is the one that got updated, play it immediately
        if (currentSong && currentSong._id === newSong._id) {
          setCurrentSong(newSong);
          setPlayerKey((prevKey) => prevKey + 1);
          return updatedQueue.filter((song) => song._id !== newSong._id);
        }

        return updatedQueue;
      });
    }
  };

  const getRandomSong = () => {
    const availableSongs = songLibrary.filter(
      (song) => song._id !== lastPlayedLibrarySongId
    );
    const randomIndex = Math.floor(Math.random() * availableSongs.length);
    return availableSongs[randomIndex];
  };

  const playNextSong = () => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      if (currentSong && nextSong.youtubeLink === currentSong.youtubeLink) {
        setPlayerKey((prevKey) => prevKey + 1);
      }
      setCurrentSong(nextSong);
      setQueue((prevQueue) => prevQueue.slice(1));
      setLastPlayedLibrarySongId(null);
      setIsLibrarySong(false);
    } else {
      const newSong = getRandomSong();
      setCurrentSong({
        ...newSong,
        location: "Dagapur",
        timestamp: new Date().toISOString(),
      });
      setLastPlayedLibrarySongId(newSong._id);
      setIsLibrarySong(true);
    }
  };

  useEffect(() => {
    if (currentSong && !getYouTubeVideoId(currentSong.youtubeLink)) {
      handleError();
    } else {
      setIsValidYouTubeLink(true);
    }
  }, [currentSong]);

  useEffect(() => {
    const fetchLatestSong = async () => {
      try {
        const response = await fetch("/api/getLatest?location=Dagapur");
        if (response.status === 200) {
          const data: Song = await response.json();
          if (data.location === "Dagapur") {
            if (!currentSong) {
              setCurrentSong(data);
              setIsLibrarySong(false);
            } else if (data._id !== currentSong._id) {
              handleNewSong(data);
            } else if (data.youtubeLink !== currentSong.youtubeLink) {
              setCurrentSong(data);
              setPlayerKey((prevKey) => prevKey + 1);
            }
          }
        } else if (response.status === 204 || isInitialLoad) {
          // No new data or initial load, play a random song
          const randomSong = getRandomSong();
          setCurrentSong({
            ...randomSong,
            location: "Dagapur",
            timestamp: new Date().toISOString(),
          });
          setLastPlayedLibrarySongId(randomSong._id);
          setIsLibrarySong(true);
        } else {
          console.error("Error fetching latest song:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching latest song:", error);
      }
      setIsInitialLoad(false);
    };

    fetchLatestSong(); // Run immediately

    const fetchInterval = setInterval(fetchLatestSong, 1000);

    return () => {
      clearInterval(fetchInterval);
    };
  }, [currentSong, queue, isInitialLoad, isLibrarySong]);

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (event.data === YT.PlayerState.ENDED) {
      playNextSong();
    }
  };

  const onPlayerError = (event: YT.OnErrorEvent) => {
    console.error("YouTube player error:", event.data);
    handleError();
  };

  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const onPlayerReady = (event: YT.PlayerEvent) => {
    youtubePlayerRef.current = event.target;
  };

  const handleError = () => {
    setIsValidYouTubeLink(false);
    const randomSong = getRandomSong();
    setCurrentSong({
      ...randomSong,
      location: "Dagapur",
      timestamp: new Date().toISOString(),
    });
    setLastPlayedLibrarySongId(randomSong._id);
    setIsValidYouTubeLink(true);
    setIsLibrarySong(true);
  };

  const handleNextClick = () => {
    playNextSong();
  };

  const handleResetClick = () => {
    setQueue([]);
    const randomSong = getRandomSong();
    setCurrentSong({
      ...randomSong,
      location: "Dagapur",
      timestamp: new Date().toISOString(),
    });
    setLastPlayedLibrarySongId(randomSong._id);
    setIsLibrarySong(true);
    setIsInitialLoad(false);
  };

  return (
    <div className="relative">
      <div className="hidden lg:block absolute top-0 right-0 m-4">
        <Profile />
      </div>

      <div>
        {currentSong ? (
          <div className="ml-4">
            <h2 className="py-2 text-2xl font-bold">Current Song in Dagapur</h2>
            <p>
              <strong>Location:</strong> {currentSong.location}
            </p>
            <p>
              <strong>YouTube Link:</strong> {currentSong.youtubeLink}
            </p>
            <p>
              <strong>Name:</strong> {currentSong.name}
            </p>
            <p>
              <strong>Last Updated:</strong>{" "}
              {formatTimestamp(currentSong.timestamp)}
            </p>
            {isValidYouTubeLink &&
            getYouTubeVideoId(currentSong?.youtubeLink) ? (
              <YouTube
                key={`${currentSong._id}-${playerKey}`}
                videoId={getYouTubeVideoId(currentSong.youtubeLink)!}
                opts={{
                  height: "390",
                  width: "640",
                  playerVars: {
                    autoplay: 1,
                  },
                }}
                onReady={onPlayerReady}
                onStateChange={onPlayerStateChange}
                onError={onPlayerError}
                className="my-4"
              />
            ) : (
              <p>Loading new video...</p>
            )}

            <div className="flex space-x-4 mt-4">
              <button
                className="btn m-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                onClick={handleNextClick}
              >
                Next
              </button>
              <button
                className="btn m-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={handleResetClick}
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
        {queue.length > 0 && (
          <div className="ml-4">
            <h3>Next in Queue:</h3>
            {queue.map((song, index) => (
              <div key={song._id}>
                <p>
                  <strong>
                    {index + 1}. {song.name}
                  </strong>{" "}
                  - {song.youtubeLink}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestSongDagapur;
