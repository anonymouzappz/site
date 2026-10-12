import GoogleAdSense from "@/components/GoogleAdsense";
import Footer from "@/components/layout/Footer";
import StoreAnnouncement from "@/components/layout/StoreAnnouncement";
import Navbar from "@/components/layout/Navbar";
import MusicPlayer from "@/components/music/MusicPlayer";
import { AuthProvider } from "@/components/providers/AuthProvider";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: './fonts/geist-latin.woff2',
  weight: '100 900',
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: './fonts/geist-mono-latin.woff2',
  weight: '100 900',
  variable: "--font-geist-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffefdd" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://nurnrebel.com"),

  applicationName: "Nurnrebel aka XNX",
  category: "fashion",

  title: {
    default: "Nurnrebel aka XNX | Social Awareness Streetwear",
    template: "%s | Nurnrebel aka XNX",
  },

  description:
    "Shop Nurnrebel aka XNX, a social awareness streetwear clothing brand built for identity, rebellion, awareness, and self-expression. Wear your mindset and let the clothes speak.",

  keywords: [
    "Nurnrebel",
    "XNX",
    "Nurnrebel aka XNX",
    "social awareness clothing",
    "streetwear brand",
    "statement clothing",
    "graphic tees",
    "streetwear sets",
    "urban fashion",
    "wear your mindset",
    "rebellion clothing",
    "awareness fashion",
  ],

  authors: [{ name: "Nurnrebel aka XNX", url: "https://nurnrebel.com" }],
  creator: "Nurnrebel aka XNX",
  publisher: "Nurnrebel aka XNX",

  alternates: {
    canonical: "/",
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo-white.png", type: "image/png" },
    ],
    apple: [{ url: "/logo-white.png" }],
  },

  openGraph: {
    title: "Nurnrebel aka XNX | Wear Your Mindset",
    description:
      "Social awareness streetwear built for people who express identity, rebellion, awareness, and truth through fashion.",
    url: "https://nurnrebel.com",
    siteName: "Nurnrebel aka XNX",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-nurnrebel.png",
        width: 1200,
        height: 630,
        alt: "Nurnrebel aka XNX social awareness streetwear",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Nurnrebel aka XNX | Wear Your Mindset",
    description:
      "Statement streetwear for awareness, identity, rebellion, and expression.",
    images: ["/og-nurnrebel.png"],
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`dark ${geistSans.variable} ${geistMono.variable} scroll-smooth`}
    >
      <body className="min-h-screen overflow-x-hidden text-foreground antialiased selection:bg-accent selection:text-white">
        <GoogleAdSense />
        <AuthProvider>
          <div className="relative flex min-h-screen flex-col">
            <div className="fixed inset-0 -z-50 bg-background" />

            <div className="fixed inset-0 -z-40 opacity-100">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_14%,var(--spot),transparent_26rem),radial-gradient(circle_at_88%_78%,var(--accent-soft),transparent_34rem),linear-gradient(var(--grid)_1px,transparent_1px),linear-gradient(90deg,var(--grid)_1px,transparent_1px)] bg-[length:auto,auto,56px_56px,56px_56px]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.08)_100%)]" />
            </div>

            <Navbar />
          <StoreAnnouncement />

            <main className="relative z-10 flex-1">{children}</main>

            <Footer />

            <MusicPlayer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
