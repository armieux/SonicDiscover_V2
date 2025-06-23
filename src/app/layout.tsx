import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { MusicProvider } from './context/MusicContext';
import MusicPlayer from './components/MusicPlayer/MusicPlayer';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SonicDiscover",
  description: "Découvrez et partagez votre musique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MusicProvider>
          {children}
          <MusicPlayer />
        </MusicProvider>
      </body>
    </html>
  );
}
