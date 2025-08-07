// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
// No longer importing createServerSupabaseClient here for Header's initial state

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NutricionPro",
  description: "Web para agendar consultas con una nutricionista",
};

export default function RootLayout({
  // Make it synchronous again
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // No longer fetching user session here for Header's initial state
  // The Header component will manage its own auth state on the client

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header /> {/* No longer passing initialIsLoggedIn prop */}
        <main>
          {children}
          <Toaster theme="light" />
        </main>
      </body>
    </html>
  );
}
