import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GOAL Foundation',
  description: 'Clean premium foundation with responsive navbar'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
