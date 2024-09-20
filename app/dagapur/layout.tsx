import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import ClientLayout from "./clientlayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dagapur Song",
  description: "A standalone app for the Dagapur song",
  manifest: "/dagapur/manifest.json",
  themeColor: [{ color: "#000000" }],
  viewport:
    "width=device-width, initial-scale=1, minimum-scale=1, shrink-to-fit=no, viewport-fit=cover",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
};

export default RootLayout;
