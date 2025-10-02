import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "የአ/አ/ሳ/ቴ/ዪ/ግ/ጉ በገና",
  description:
    "Admin panel and backend API for managing students, sections, payments, announcements, and class schedules for Begena mini app.",
  keywords: [
    "Begena",
    "የአ/አ/ሳ/ቴ/ዪ/ግ/ጉ በገና",
    "Students",
    "Payments",
    "Sections",
    "Announcements",
    "Class Schedules",
    "Education Management",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" type="image/jpeg" href="/begena.jpg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster position="top-right" reverseOrder={false} />
        {children}
      </body>
    </html>
  );
}
