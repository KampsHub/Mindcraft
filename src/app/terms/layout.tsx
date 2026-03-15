import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Mindcraft terms of service. Usage terms for our AI-powered coaching programs.",
  openGraph: {
    title: "Terms & Conditions",
    description: "Mindcraft terms of service. Usage terms for our AI-powered coaching programs.",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
