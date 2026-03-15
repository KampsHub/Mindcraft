import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jetstream — Navigate Your PIP",
  description:
    "30 days to separate panic from the actual problem. Sort real feedback from fear, build a concrete plan.",
  openGraph: {
    title: "Jetstream — Navigate Your PIP",
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
