import React, { useState, useEffect } from "react";

const Profile: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    // Check if an end time is already stored
    let endTime = localStorage.getItem("profileEndTime");

    if (!endTime) {
      // If not, set a new end time 72 hours from now
      const newEndTime = Date.now() + 72 * 60 * 60 * 1000;
      localStorage.setItem("profileEndTime", newEndTime.toString());
      endTime = newEndTime.toString();
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = parseInt(endTime!) - now;

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft("Expired");
        localStorage.removeItem("profileEndTime"); // Clear the stored end time
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor(
          (remaining % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 rounded-lg shadow-md text-center">
      <p className="text-lg font-bold mb-4">
        This profile is valid till 31 July 2024
      </p>
    </div>
  );
};

export default Profile;
