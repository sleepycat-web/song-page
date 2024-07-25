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
  const [youtubeLink, setYoutubeLink] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [showValidation, setShowValidation] = useState<boolean>(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const router = useRouter();

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
  };

  const handleSubmit = async () => {
    if (selectedLocation && youtubeLink.trim() && name) {
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
          throw new Error("Failed to submit data");
        }

        console.log(await response.json());
        setSelectedLocation("");
        setYoutubeLink("");
        setName("");
        setShowValidation(false);
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      setShowValidation(true);
    }
  };

  const allFieldsFilled = selectedLocation && youtubeLink.trim() && name;

  return (
    <main className="p-4 space-y-4">
      <p className="text-lg font-semibold">Select a location</p>

      <details className="dropdown" ref={detailsRef}>
        <summary className="btn m-1 flex items-center">
          {selectedLocation || "Select Location"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            className="ml-2 h-4 w-4"
            fill="currentColor"
          >
            <path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z" />
          </svg>
        </summary>
        <ul className="menu dropdown-content bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
          <li>
            <button onClick={() => handleLocationSelect("Dagapur")}>
              Dagapur
            </button>
          </li>
          <li>
            <button onClick={() => handleLocationSelect("Sevoke")}>
              Sevoke
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

      <button className="btn block" onClick={handleSubmit}>
        Submit
      </button>
    </main>
  );
};

export default Home;
