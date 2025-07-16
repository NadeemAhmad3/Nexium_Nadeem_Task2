import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Sets up the primary sans-serif font
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Sets up the secondary monospaced font
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Updated metadata for your specific project
export const metadata: Metadata = {
  title: "Blog Summariser | AI-Powered Insights",
  description: "An aesthetic web app to scrape, summarize, and translate blog posts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The critical fix: "dark" class is added here to enable the dark theme
    <html lang="en" className="dark">
      <body
        // This line correctly applies both fonts and an anti-aliasing class for smoother text
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}