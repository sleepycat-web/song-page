import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chai Mine",
  description: "",
  manifest: "manifest.json",
  themeColor: [{ color: "#fff" }],
  viewport:
    "width=device-width, initial-scale=1 minimum-scale=1, shrink-to-fit=no, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="bg-black" lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
