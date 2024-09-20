

// layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import ClientLayout from "./clientlayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sevoke Song",
  description: "",
  manifest: "manifest-sevoke.json",
  themeColor: [{ color: "#fff" }],
  viewport:
    "width=device-width, initial-scale=1 minimum-scale=1, shrink-to-fit=no, viewport-fit=cover",
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

