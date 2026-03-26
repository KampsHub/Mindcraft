import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan & Progress",
  robots: { index: false, follow: false },
};

export default function GoalsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
