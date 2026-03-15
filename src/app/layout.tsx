import type { Metadata } from "next";
import { Space_Grotesk, Sora, DM_Sans } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Mindcraft — by All Minds on Deck",
  description: "Your coaching companion. Real frameworks. Real growth. Between sessions, every day.",
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
      </head>
      <body
        className={`${spaceGrotesk.variable} ${sora.variable} ${dmSans.variable} antialiased`}
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
