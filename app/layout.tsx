// app/layout.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProviderGate from "@/components/AuthProviderGate";
import { Footer, Navbar } from "./layoutItems";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Fatih Etlik — Web Developer & Network Specialist",
  description:
    "Portfolio of Fatih Etlik. Projects, about, and contact information.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <AuthProviderGate>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-stone-100 text-stone-900`}>
          <Navbar />
          <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Loading...</div>}>
          <main className="min-h-[60vh]">{children}</main>
          </Suspense>
          <Footer />
        </body>
      </AuthProviderGate>

    </html>
  );
}



