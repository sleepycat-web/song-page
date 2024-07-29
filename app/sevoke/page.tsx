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

const LatestSongSevoke: React.FC = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(300);
  const youtubePlayerRef = useRef<YT.Player | null>(null);
  const [playerKey, setPlayerKey] = useState(0);
  const [isValidYouTubeLink, setIsValidYouTubeLink] = useState(true);
  const [lastPlayedLibrarySongId, setLastPlayedLibrarySongId] = useState<
    string | null
  >(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
    } else {
      const newSong = getRandomSong();
      setCurrentSong({
        ...newSong,
        location: "Sevoke",
        timestamp: new Date().toISOString(), // Ensure ISO string format
      });
      setLastPlayedLibrarySongId(newSong._id);
    }
    setTimeRemaining(300);
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
        const response = await fetch("/api/getLatest?location=Sevoke");
        if (response.status === 200) {
          const data: Song = await response.json();
          if (data.location === "Sevoke") {
            if (isInitialLoad) {
              const randomSong = getRandomSong();
              setCurrentSong({
                ...randomSong,
                location: "Sevoke",
                timestamp: new Date().toISOString(),
              });
              setLastPlayedLibrarySongId(randomSong._id);
              setIsInitialLoad(false);
            } else if (!currentSong) {
              setCurrentSong(data);
            } else if (
              !queue.some((song) => song._id === data._id) &&
              data._id !== currentSong._id
            ) {
              setQueue((prevQueue) =>
                [...prevQueue, data].sort(
                  (a, b) =>
                    new Date(a.timestamp).getTime() -
                    new Date(b.timestamp).getTime()
                )
              );
            }
          }
        } else if (response.status === 204) {
          // No new data, do nothing
        } else {
          console.error("Error fetching latest song:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching latest song:", error);
      }
    };

    fetchLatestSong(); // Run immediately

    const fetchInterval = setInterval(fetchLatestSong, 1000);
    const timerInterval = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          playNextSong();
          return 300;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(timerInterval);
    };
  }, [currentSong, queue, isInitialLoad]);

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

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const onPlayerReady = (event: YT.PlayerEvent) => {
    youtubePlayerRef.current = event.target;
  };

  const handleError = () => {
    setIsValidYouTubeLink(false);
    const randomSong = getRandomSong();
    setCurrentSong({
      ...randomSong,
      location: "Sevoke",
      timestamp: new Date().toISOString(), // Ensure ISO string format
    });
    setLastPlayedLibrarySongId(randomSong._id);
    setIsValidYouTubeLink(true);
  };

  const handleNextClick = () => {
    playNextSong();
  };

  const handleResetClick = () => {
    setQueue([]);
    setIsInitialLoad(true);
    localStorage.removeItem("songQueue");
    localStorage.removeItem("currentSong");
  };

  return (
     <div className="relative">
    {/* Profile component in the top right corner */}
    <div className="hidden lg:block absolute top-0 right-0 m-4">
      <Profile />
    </div>

    {/* Existing content */}
    <div>
      {currentSong ? (
        <div className="ml-4">
          <h2 className="py-2 text-2xl font-bold">Current Song in Sevoke</h2>
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
          <p>
            <strong>Time until next song:</strong> {formatTime(timeRemaining)}
          </p>

          {isValidYouTubeLink && getYouTubeVideoId(currentSong?.youtubeLink) ? (
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

export default LatestSongSevoke;
