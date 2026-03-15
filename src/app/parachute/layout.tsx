import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parachute — Layoff Recovery Program",
  description:
    "30 days of structured coaching to get past layoff shock. Process the emotions, find the patterns, rebuild clarity.",
  openGraph: {
    title: "Parachute — Layoff Recovery Program",
    description:
      "30 days of structured coaching to get past layoff shock. Process the emotions, find the patterns, rebuild clarity.",
  },
};

export default function ParachuteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
