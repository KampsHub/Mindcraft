import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basecamp — New Role Confidence",
  description:
    "30 days to get grounded before imposter syndrome takes over. Build real confidence, not the performed kind.",
  openGraph: {
    title: "Basecamp — New Role Confidence",
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
