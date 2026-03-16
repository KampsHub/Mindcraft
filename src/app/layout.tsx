import type { Metadata } from "next";
import { Space_Grotesk, Sora, DM_Sans, Playfair_Display } from "next/font/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mindcraft.ninja"),
  title: {
    default: "Mindcraft — Cut Through Your Mind's Noise in 30 Days",
    template: "%s | Mindcraft",
  },
  description:
    "AI-powered coaching programs for career crises. Daily journaling, 250+ proven frameworks, pattern recognition. For layoffs, PIPs, and new roles.",
  keywords: [
    "coaching",
    "career coaching",
    "layoff support",
    "PIP coaching",
    "new role coaching",
    "AI coaching",
    "mental health",
    "professional development",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Mindcraft",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  themeColor: "#18181C",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mindcraft",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Mindcraft",
              description: "AI-powered coaching for career crises",
              applicationCategory: "HealthApplication",
              operatingSystem: "Web",
              url: "https://mindcraft.ninja",
              offers: {
                "@type": "Offer",
                price: "29.95",
                priceCurrency: "USD",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${sora.variable} ${dmSans.variable} ${playfair.variable} antialiased`}
        style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
      >
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
