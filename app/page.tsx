"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  location: string;
  youtubeLink: string;
  name: string;
}

const Home: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [displayLocation, setDisplayLocation] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [youtubeLink, setYoutubeLink] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [showValidation, setShowValidation] = useState<boolean>(false);
  const [duplicateError, setDuplicateError] = useState<string>("");
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const router = useRouter();

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setDisplayLocation(location === "Sevoke" ? "Sevoke Road" : location);
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  const isValidYoutubeLink = (url: string): boolean => {
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = async () => {
    setShowValidation(true);
    setDuplicateError("");

    if (
      selectedLocation &&
      youtubeLink.trim() &&
      name &&
      isValidYoutubeLink(youtubeLink)
    ) {
      const formData: FormData = {
        location: selectedLocation,
        youtubeLink,
        name,
      };

      try {
        const response = await fetch("/api/submitForm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 400) {
            if (errorData.error === "duplicate_song") {
              setDuplicateError(
                "This song is already in the queue for the selected location. Please choose a different song."
              );
            } else {
              setDuplicateError(
                "An error occurred while submitting the form. Please try again."
              );
            }
          } else {
            throw new Error("Failed to submit data");
          }
        } else {
          console.log(await response.json());
          setSuccessMessage(
            `Your song has been played at Chai Mine ${displayLocation}`
          );
          setSelectedLocation("");
          setDisplayLocation("");
          setYoutubeLink("");
          setName("");
          setShowValidation(false);
          setDuplicateError(""); // Clear any previous error messages
        }
      } catch (error) {
        console.error("Error:", error);
        setDuplicateError(
          "An unexpected error occurred. Please try again later."
        );
      }
    }
  };

  const allFieldsFilled = selectedLocation && youtubeLink.trim() && name;
  const isYoutubeLinkValid = isValidYoutubeLink(youtubeLink);

  return (
    <main className=" p-4 space-y-4">
      <p>
        Go To YouTube
        <br />
        Play Your Music
        <br />
        Press Share Button & Copy Link
        <br />
        Paste The Link Below👇
      </p>
      <p className="text-lg  font-semibold">Select a location</p>
      <details className=" dropdown" ref={detailsRef}>
        <summary className="btn m-1 flex items-center">
          {displayLocation || "Select Location"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            className="ml-2 h-4 w-4"
            fill="currentColor"
          >
            <path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
          </svg>
        </summary>
        <ul className="menu dropdown-content  bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          <li>
            <button onClick={() => handleLocationSelect("Dagapur")}>
              Dagapur
            </button>
          </li>
          <li>
            <button onClick={() => handleLocationSelect("Sevoke")}>
              Sevoke Road
            </button>
          </li>
        </ul>
      </details>
      <p className="text-lg font-semibold">Paste your Youtube link</p>
      <input
        type="text"
        placeholder="Paste here"
        className="input w-full max-w-xs mb-2 p-2 border rounded"
        value={youtubeLink}
        onChange={(e) => setYoutubeLink(e.target.value)}
      />
      {showValidation && youtubeLink && !isYoutubeLinkValid && (
        <p className="text-red-500 text-sm">
          Please enter a valid YouTube link.
        </p>
      )}
      <p className="text-lg font-semibold">Your Name</p>
      <input
        type="text"
        placeholder="Enter your Name"
        className="input w-full max-w-xs mb-4 p-2 border rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {showValidation && !allFieldsFilled && (
        <p className="text-red-500 text-sm">
          Please fill in all fields before submitting.
        </p>
      )}
      {duplicateError && (
        <p className="text-red-500 text-sm">{duplicateError}</p>
      )}
      <button className="btn block" onClick={handleSubmit}>
        Submit
      </button>
      {successMessage && (
        <p className="text-green-500 mt-2">{successMessage}</p>
      )}
    </main>
  );
};

export default Home;
