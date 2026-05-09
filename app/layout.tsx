import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'GOAL Personal Operating Space',
  description: 'Calm discipline dashboard for daily life execution'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="mission-body">{children}</body>
    </html>
  );
}
