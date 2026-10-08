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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
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
  openGraph: {
    type: "website",
    siteName: "የአ/አ/ሳ/ቴ/ዪ የበገና ንዑስ ክፍል",
    title: "የአ/አ/ሳ/ቴ/ዪ የበገና ንዑስ ክፍል",
    description:
      "የትምህርት ክፍለ-ጊዜዎን፣ ወርሃዊ ክፍያዎን እና የክትትል ሁኔታዎን በአንድ ቦታ ይከታተሉ።",
  },
  twitter: {
    card: "summary_large_image",
  },
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
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            className: "",
            style: {
              fontSize: "10px",
              padding: "6px 10px",
              maxWidth: "90%",
              borderRadius: "10px",
            },
          }}
        />

        {children}
      </body>
    </html>
  );
}
