"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import songLibrary from "../scripts/song/library";
import YouTube from "react-youtube";

interface Song {
  _id: string;
  location: string;
  youtubeLink: string;
  name: string;
  timestamp: string;
}

interface SubPageProps {
  location: string;
  Profile: React.FC;
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

const SubPage: React.FC<SubPageProps> = ({ location, Profile }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playerKey, setPlayerKey] = useState(0);
  const [isLibrarySong, setIsLibrarySong] = useState<boolean>(true);
  const [isValidYouTubeLink, setIsValidYouTubeLink] = useState(true);
  const [lastPlayedLibrarySongId, setLastPlayedLibrarySongId] = useState<
    string | null
  >(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const youtubePlayerRef = useRef<YT.Player | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomSong = useCallback(() => {
    if (!songLibrary || songLibrary.length === 0) {
      console.error("Empty song library!");
      return null;
    }

    const availableSongs = songLibrary.filter(
      (song) => song._id !== lastPlayedLibrarySongId
    );
    if (availableSongs.length === 0) {
      console.log("All songs played, resetting last played");
      setLastPlayedLibrarySongId(null);
      return songLibrary[Math.floor(Math.random() * songLibrary.length)];
    }

    const randomSong =
      availableSongs[Math.floor(Math.random() * availableSongs.length)];
    console.log("Selected random song:", randomSong.name);
    return randomSong;
  }, [lastPlayedLibrarySongId]);

  const playNextSong = useCallback(() => {
    const randomSong = getRandomSong();
    if (!randomSong) {
      console.error("No song available to play!");
      return;
    }

    console.log("Playing next song:", randomSong.name);
    setCurrentSong({
      ...randomSong,
      location: location,
      timestamp: new Date().toISOString(),
    });
    setLastPlayedLibrarySongId(randomSong._id);
    setIsLibrarySong(true);
    setPlayerKey((prev) => prev + 1);
    setIsPlayerReady(false);
  }, [getRandomSong, location]);

  const handleError = useCallback(() => {
    console.log("Handling playback error");
    setIsValidYouTubeLink(false);
    setIsPlayerReady(false);
    playNextSong();
    setIsValidYouTubeLink(true);
  }, [playNextSong]);

  

  // Load initial library song
  useEffect(() => {
    console.log("Component mounted, initializing first song");
    if (!currentSong) {
      playNextSong();
    }
  }, [currentSong, playNextSong]);

  // YouTube link validation
  useEffect(() => {
    if (currentSong && !getYouTubeVideoId(currentSong.youtubeLink)) {
      console.log("Invalid YouTube link detected", currentSong.youtubeLink);
      handleError();
    } else {
      setIsValidYouTubeLink(true);
    }
  }, [currentSong, handleError]);

  // Song ended check with background play support
  useEffect(() => {
    const checkPlayerState = () => {
      if (youtubePlayerRef.current && isPlayerReady) {
        try {
          const playerState = youtubePlayerRef.current.getPlayerState();
          // If video is paused and page is hidden, resume playback
          if (playerState === YT.PlayerState.PAUSED && document.hidden) {
            youtubePlayerRef.current.playVideo();
          }
          // If video has ended, play next song regardless of visibility
          if (playerState === YT.PlayerState.ENDED) {
            console.log("Song ended naturally, playing next");
            playNextSong();
          }
        } catch (error) {
          console.error("Error checking player state:", error);
        }
      }
    };

    // Clear any existing interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    // Set up new interval
    checkIntervalRef.current = setInterval(checkPlayerState, 1000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isPlayerReady, playNextSong]);

  // Database song check
  useEffect(() => {
    const fetchLatestSong = async () => {
      try {
        console.log("Checking database for new songs...");
        const response = await fetch(`/api/getLatest?location=${location}`);

        if (response.status === 200) {
          const data: Song = await response.json();
          console.log("Database song found:", data.name);

          if (
            data.location === location &&
            (!currentSong || data._id !== currentSong._id)
          ) {
            console.log("Switching to database song:", data.name);
            setCurrentSong({
              ...data,
              location: location,
              timestamp: new Date().toISOString(),
            });
            setIsLibrarySong(false);
            setPlayerKey((prev) => prev + 1); // Ensure player remounts
            setIsPlayerReady(false);
          }
        } else {
          console.log("No database song available");
        }
      } catch (error) {
        console.error("Database fetch error:", error);
      }
    };

    const interval = setInterval(fetchLatestSong, 3000);
    return () => clearInterval(interval);
  }, [location, currentSong, setPlayerKey]); // Added setPlayerKey to dependencies

  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const onPlayerReady = (event: YT.PlayerEvent) => {
    console.log("YouTube player ready");
    youtubePlayerRef.current = event.target;
    setIsPlayerReady(true);

    try {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.playVideo();
      }
    } catch (error) {
      console.error("Error starting playback:", error);
      handleError();
    }
  };

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (event.data === YT.PlayerState.ENDED) {
      console.log("Player state changed to ENDED");
      playNextSong();
    }
    // If paused and page is hidden, resume playback
    if (event.data === YT.PlayerState.PAUSED && document.hidden) {
      event.target.playVideo();
    }
  };

  const onPlayerError = (event: YT.OnErrorEvent) => {
    console.error("YouTube player error:", event.data);
    handleError();
  };

  // Restart player when a new song is added
  useEffect(() => {
    if (currentSong) {
      setPlayerKey((prev) => prev + 1);
      setIsPlayerReady(false);
    }
  }, [currentSong]);

  return (
    <div className="relative">
      <div className="hidden lg:block absolute top-0 right-0 m-4">
        <Profile />
      </div>

      <div>
        {currentSong ? (
          <div className="ml-4">
            <h2 className="py-2 text-2xl font-bold">
              Current Song in {location}
            </h2>
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
              <strong>Source:</strong> {isLibrarySong ? "Library" : "Database"}
            </p>
            {isValidYouTubeLink &&
            getYouTubeVideoId(currentSong.youtubeLink) ? (
              <div className="my-4">
                <YouTube
                  key={`${currentSong._id}-${playerKey}`}
                  videoId={getYouTubeVideoId(currentSong.youtubeLink)!}
                  opts={{
                    height: "390",
                    width: "640",
                    playerVars: {
                      autoplay: 1,
                      playsinline: 1, // Added for better mobile support
                    },
                  }}
                  onReady={onPlayerReady}
                  onStateChange={onPlayerStateChange}
                  onError={onPlayerError}
                  className="my-4"
                />
                <div className="flex gap-2">
                  <button
                    className="btn mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={playNextSong}
                  >
                    Skip Song
                  </button>
                </div>
              </div>
            ) : (
              <div className="my-4">
                <p>Loading next song...</p>
                <button
                  className="btn mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={playNextSong}
                >
                  Skip
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="ml-4">
            <p>Loading initial song...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubPage;
