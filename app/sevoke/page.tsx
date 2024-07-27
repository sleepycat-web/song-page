"use client";

import React, { useEffect, useState, useRef } from "react";
import YouTube from "react-youtube";

interface Song {
  _id: string;
  location: string;
  youtubeLink: string;
  name: string;
  timestamp: string;
}

const songLibrary = [
  {
    _id: "lib_1",
    youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    name: "Song 1",
  },
  {
    _id: "lib_2",
    youtubeLink: "https://www.youtube.com/watch?v=L_jWHffIx5E",
    name: "Song 2",
  },
  {
    _id: "lib_3",
    youtubeLink: "https://youtu.be/izGwDsrQ1eQ?si=3vGO28sU66GynBZt",
    name: "Song 3",
  },
  {
    _id: "lib_5",
    youtubeLink:
      "https://www.youtube.com/watch?v=kJQP7kiw5Fk&list=PL15B1E77BB5708555",
    name: "Song 5",
  },
  {
    _id: "lib_6",
    youtubeLink: "https://youtu.be/60ItHLz5WEA?si=a4Yi7N_THx0dvh9m",
    name: "Song 6",
  },
];

const LatestSongSevoke: React.FC = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(300);
  const youtubePlayerRef = useRef<YT.Player | null>(null);
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
      setCurrentSong(nextSong);
      setQueue((prevQueue) => prevQueue.slice(1));
      setLastPlayedLibrarySongId(null);
    } else {
      const newSong = getRandomSong();
      setCurrentSong({
        ...newSong,
        location: "Sevoke",
        timestamp: new Date().toISOString(),
      });
      setLastPlayedLibrarySongId(newSong._id);
    }
    setTimeRemaining(300);
  };

 useEffect(() => {
   const fetchLatestSong = async () => {
     try {
       const response = await fetch("/api/getLatest?location=Sevoke");
       if (response.status === 200) {
         const data: Song = await response.json();
         if (data.location === "Sevoke") {
           if (!currentSong) {
             if (isInitialLoad) {
               const randomSong = getRandomSong();
               setCurrentSong({
                 ...randomSong,
                 location: "Sevoke",
                 timestamp: new Date().toISOString(),
               });
               setLastPlayedLibrarySongId(randomSong._id);
               setIsInitialLoad(false);
             } else {
               setCurrentSong(data);
             }
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
 }, [currentSong, queue,isInitialLoad]);

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (event.data === YT.PlayerState.ENDED) {
      playNextSong();
    }
  };

  const getYouTubeVideoId = (url: string): string | null => {
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

  return (
    <div>
      {currentSong ? (
        <div>
          <h2>Current Song in Sevoke</h2>
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
            <strong>Last Updated:</strong> {currentSong.timestamp}
          </p>
          <p>
            <strong>Time until next song:</strong> {formatTime(timeRemaining)}
          </p>
          {getYouTubeVideoId(currentSong.youtubeLink) && (
            <YouTube
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
            />
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
      {queue.length > 0 && (
        <div>
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
  );
};

export default LatestSongSevoke;
