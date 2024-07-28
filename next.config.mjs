import dotenv from "dotenv";

dotenv.config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    REACT_APP_USERNAME: process.env.REACT_APP_USERNAME,
    REACT_APP_PASSWORD: process.env.REACT_APP_PASSWORD,
  },
};

export default nextConfig;
