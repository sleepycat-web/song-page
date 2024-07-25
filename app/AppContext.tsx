"use client"
import React, { createContext, useState, useContext } from "react";

interface AppContextType {
  youtubeLink: string;
  setYoutubeLink: (link: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [youtubeLink, setYoutubeLink] = useState("");

  return (
    <AppContext.Provider value={{ youtubeLink, setYoutubeLink }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
