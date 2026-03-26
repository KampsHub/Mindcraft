import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insights",
  robots: { index: false, follow: false },
};

export default function WeeklyReviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
