import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Mindcraft privacy policy. How we handle your data, journaling content, and coaching interactions.",
  openGraph: {
    title: "Privacy Policy",
    description: "Mindcraft privacy policy. How we handle your data, journaling content, and coaching interactions.",
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
