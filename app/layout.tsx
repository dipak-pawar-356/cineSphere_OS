import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const viewport: Viewport = {
  themeColor: "#070B12",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "CineSphere OS — The Operating System for Modern Cinemas",
  description:
    "An enterprise platform to orchestrate cinema chains, 3D hall acoustics, automated scheduling, and omnichannel ticketing.",
  keywords: [
    "Cinema Management",
    "Multiplex OS",
    "Ticketing System",
    "Movie Scheduling",
    "Theatre Operations",
    "Dolby Atmos",
    "IMAX",
  ],
  authors: [{ name: "CineSphere OS Architectural Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col bg-[#070B12] text-[#F9FAFB] selection:bg-amber-400 selection:text-black">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
