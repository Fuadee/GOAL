import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'GOAL Mission Control',
  description: 'Premium mission control dashboard for life system execution'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="dark">
      <body className="mission-body">{children}</body>
    </html>
  );
}
