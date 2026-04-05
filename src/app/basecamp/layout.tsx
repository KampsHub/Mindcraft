import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basecamp — New Role Confidence | Mindcraft",
  description:
    "30 days to get grounded before imposter syndrome takes over. Build real confidence, not the performed kind. Evidence-based frameworks, AI-powered daily practice.",
  openGraph: {
    title: "Basecamp — New Role Confidence | Mindcraft",
    description:
      "30 days to get grounded before imposter syndrome takes over. Build real confidence, not the performed kind.",
    type: "website",
    url: "https://mindcraft.ing/basecamp",
    siteName: "Mindcraft",
  },
  twitter: {
    card: "summary_large_image",
    title: "Basecamp — New Role Confidence | Mindcraft",
    description:
      "30 days to get grounded before imposter syndrome takes over. Build real confidence, not the performed kind.",
  },
};

export default function BasecampLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
