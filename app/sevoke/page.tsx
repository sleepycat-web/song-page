"use client";

import songLibrary from "../../scripts/song/library";
import React, { useEffect, useState, useRef } from "react";
import YouTube from "react-youtube";
import Profile from "./profile";

//fine
interface Song {
  _id: string;
  location: string;
  youtubeLink: string;
  name: string;
  timestamp: string;
}

//fine
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
  const [timeRemaining, setTimeRemaining] = useState<number | null>(300);
  const youtubePlayerRef = useRef<YT.Player | null>(null);
  const [playerKey, setPlayerKey] = useState(0);
  const [isLibrarySong, setIsLibrarySong] = useState<boolean>(false);
  const [isValidYouTubeLink, setIsValidYouTubeLink] = useState(true);
  const [lastPlayedLibrarySongId, setLastPlayedLibrarySongId] = useState<
    string | null
    >(null);
  
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  //new fn
const handleNewSong = (newSong: Song) => {
  if (isLibrarySong) {
    // If a library song is playing, interrupt it and play the new queue song
    setCurrentSong(newSong);
    setIsLibrarySong(false);
    setTimeRemaining(300);

    //
    setQueue((prevQueue) => [
      ...prevQueue.filter((song) => song._id !== newSong._id),
    ]);
  } else {
    // If a queue song is playing, add the new song to the queue
    setQueue((prevQueue) => {
      if (!prevQueue.some((song) => song._id === newSong._id)) {
        return [...prevQueue, newSong].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      }
      return prevQueue;
    });
  }
};



  //fine
  const getRandomSong = () => {
    const availableSongs = songLibrary.filter(
      (song) => song._id !== lastPlayedLibrarySongId
    );
    const randomIndex = Math.floor(Math.random() * availableSongs.length);
    return availableSongs[randomIndex];
  };

  //fine
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
    setTimeRemaining(300);
  } else {
    const newSong = getRandomSong();
    setCurrentSong({
      ...newSong,
      location: "Sevoke",
      timestamp: new Date().toISOString(),
    });
    setLastPlayedLibrarySongId(newSong._id);
    setIsLibrarySong(true);
    setTimeRemaining(null);
  }
};

  //fine, to validate youtube link
  useEffect(() => {
    if (currentSong && !getYouTubeVideoId(currentSong.youtubeLink)) {
      handleError();
    } else {
      setIsValidYouTubeLink(true);
    }
  }, [currentSong]);

  //fine ig this is suspicious
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
             setIsLibrarySong(true);
             setTimeRemaining(null);
             setIsInitialLoad(false);
           } else if (!currentSong) {
             setCurrentSong(data);
             setIsLibrarySong(false);
             setTimeRemaining(300);
           } else if (data._id !== currentSong._id) {
             handleNewSong(data);
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

   let timerInterval: NodeJS.Timeout | null = null;
   if (!isLibrarySong && timeRemaining !== null) {
     timerInterval = setInterval(() => {
       setTimeRemaining((prevTime) => {
         if (prevTime !== null && prevTime <= 1) {
           playNextSong();
           return 300;
         }
         return prevTime !== null ? prevTime - 1 : null;
       });
     }, 1000);
   }

   return () => {
     clearInterval(fetchInterval);
     if (timerInterval) clearInterval(timerInterval);
   };
 }, [currentSong, queue, isInitialLoad, isLibrarySong, timeRemaining]);
  //fine
  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (event.data === YT.PlayerState.ENDED) {
      playNextSong();
    }
  };

  //fine
  const onPlayerError = (event: YT.OnErrorEvent) => {
    console.error("YouTube player error:", event.data);
    handleError();
  };

  //fine
  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  //fine
 const formatTime = (seconds: number | null): string => {
   if (seconds === null) return "N/A";
   const minutes = Math.floor(seconds / 60);
   const remainingSeconds = seconds % 60;
   return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
 };

  //fine
  const onPlayerReady = (event: YT.PlayerEvent) => {
    youtubePlayerRef.current = event.target;
  };

  //fine
  const handleError = () => {
    setIsValidYouTubeLink(false);
    const randomSong = getRandomSong();
    setCurrentSong({
      ...randomSong,
      location: "Sevoke",
      timestamp: new Date().toISOString(),
    });
    setLastPlayedLibrarySongId(randomSong._id);
    setIsValidYouTubeLink(true);
    setIsLibrarySong(true);
    setTimeRemaining(null);
  };
  //fine
  const handleNextClick = () => {
    playNextSong();
  };

  //fine
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
            {!isLibrarySong && timeRemaining !== null && (
              <p>
                <strong>Time until next song:</strong>{" "}
                {formatTime(timeRemaining)}
              </p>
            )}
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

export default LatestSongSevoke;
