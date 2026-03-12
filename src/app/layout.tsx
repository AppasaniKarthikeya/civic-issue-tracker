import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CivicTrack - Civic Issue Reporting & Monitoring',
  description:
    'Report and track civic issues like potholes, garbage, water supply, streetlight failures and more.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={`${inter.className} antialiased bg-gray-50 dark:bg-gray-900 dark:text-gray-100 min-h-screen flex flex-col transition-colors duration-300`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
