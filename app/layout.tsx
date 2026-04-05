import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GOAL",
  description: "Starter layout with a modern main navbar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
