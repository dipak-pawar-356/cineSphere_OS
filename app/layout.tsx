import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { GlobalProviders } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const viewport: Viewport = {
  themeColor: "#070B12",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: "CineSphere OS Architecture Team" }],
  creator: "CineSphere OS",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@cinesphere_os",
  },
  icons: {
    icon: "/logos/cinesphere-logo.svg",
    shortcut: "/logos/cinesphere-logo.svg",
    apple: "/logos/cinesphere-logo.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col bg-[#070B12] text-[#F9FAFB] selection:bg-amber-400 selection:text-black">
        <GlobalProviders>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </GlobalProviders>
      </body>
    </html>
  );
}
