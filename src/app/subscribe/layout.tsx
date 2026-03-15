import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Your Program",
  description:
    "Choose your 30-day coaching program. Real frameworks, daily exercises, pattern recognition. Cancel anytime.",
  openGraph: {
    title: "Start Your Program",
    description:
      "Choose your 30-day coaching program. Real frameworks, daily exercises, pattern recognition. Cancel anytime.",
  },
};

export default function SubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
