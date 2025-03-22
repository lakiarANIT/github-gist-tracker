// /app/layout.tsx
import Footer from "@components/ui/Footer";
import Navbar from "@components/ui/Navbar";
import { ReactNode } from "react";
import { Providers } from "./providers";
import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "GitHub Gist Tracker",
  description: "Track and manage your GitHub Gists",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-arp={Math.random()}>
      <body className="min-h-screen flex flex-col bg-gray-100">
        <Providers>
        <div className="fixed top-0 left-0 w-full z-20">
      <Navbar />
      </div>
          <main className="flex-1 container mt-auto px-4 sm:px-6 py-8 pt-16 sm:pt-20">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}