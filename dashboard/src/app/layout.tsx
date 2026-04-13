import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "All Star Dashboard",
  description: "Competition, leads, and reorder call list for All Star Turlock.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
