import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parachute — Layoff Recovery Program | Mindcraft",
  description:
    "30 days of structured coaching to move past layoff shock. Process the emotions, find the patterns, rebuild clarity. Evidence-based frameworks, AI-powered daily practice.",
  openGraph: {
    title: "Parachute — Layoff Recovery Program | Mindcraft",
    description:
      "30 days of structured coaching to move past layoff shock. Process the emotions, find the patterns, rebuild clarity.",
    type: "website",
    url: "https://mindcraft.ing/parachute",
    siteName: "Mindcraft",
  },
  twitter: {
    card: "summary_large_image",
    title: "Parachute — Layoff Recovery Program | Mindcraft",
    description:
      "30 days of structured coaching to move past layoff shock. Process the emotions, find the patterns, rebuild clarity.",
  },
};

export default function ParachuteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
