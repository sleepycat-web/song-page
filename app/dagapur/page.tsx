"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Profile from "./profile";
import SubPage from "@/components/subpage";

const Page: React.FC = () => {
  const pathname = usePathname();

  // Add fallback with empty string or default value
  const location = (pathname || "")
    .slice(1)
    .split("/")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

  
  return <SubPage location={location} Profile={Profile} />;
};

export default Page;
