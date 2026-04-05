import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jetstream — Navigate Your PIP | Mindcraft",
  description:
    "30 days to separate panic from the actual problem. Sort real feedback from fear, build a concrete plan. Evidence-based frameworks, AI-powered daily practice.",
  openGraph: {
    title: "Jetstream — Navigate Your PIP | Mindcraft",
    description:
      "30 days to separate panic from the actual problem. Sort real feedback from fear, build a concrete plan.",
    type: "website",
    url: "https://mindcraft.ing/jetstream",
    siteName: "Mindcraft",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jetstream — Navigate Your PIP | Mindcraft",
    description:
      "30 days to separate panic from the actual problem. Sort real feedback from fear, build a concrete plan.",
  },
};

export default function JetstreamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
