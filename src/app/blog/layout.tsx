import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Frameworks for Career Disruptions | Mindcraft",
  description:
    "Practical frameworks, patterns, and tools for navigating layoffs, PIPs, and new roles. Written for people in the middle of it.",
  openGraph: {
    title: "Blog — Frameworks for Career Disruptions | Mindcraft",
    description:
      "Practical frameworks, patterns, and tools for navigating layoffs, PIPs, and new roles.",
    type: "website",
    url: "https://mindcraft.ing/blog",
    siteName: "Mindcraft",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Frameworks for Career Disruptions | Mindcraft",
    description:
      "Practical frameworks, patterns, and tools for navigating layoffs, PIPs, and new roles.",
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
