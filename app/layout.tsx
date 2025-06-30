import type { Metadata } from "next";
import { Orbitron, Rajdhani, Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Signal Up",
  description: "Put your signal up. Unique flashing patterns to find your friends in any crowd. No app required.",
  keywords: ["signal", "friends", "finder", "crowd", "pattern", "flashing", "mobile", "webapp", "concert", "events"],
  authors: [{ name: "Signal Up" }],
  creator: "Signal Up",
  publisher: "Signal Up",
  openGraph: {
    title: "Signal Up",
    description: "Put your signal up. Unique flashing patterns to find your friends in any crowd. No app required.",
    url: defaultUrl,
    siteName: "Signal Up",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Signal Up - Put your signal up and find your friends",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Signal Up",
    description: "Put your signal up. Unique flashing patterns to find your friends in any crowd. No app required.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

// Signal Up Typography Stack
const orbitron = Orbitron({
  variable: "--font-display",
  weight: ["900"],
  display: "swap",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  variable: "--font-headline", 
  weight: ["600", "700"],
  display: "swap",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  weight: ["400", "700"],
  display: "swap",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  weight: ["400"],
  display: "swap", 
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${orbitron.variable} ${rajdhani.variable} ${inter.variable} ${jetbrainsMono.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
