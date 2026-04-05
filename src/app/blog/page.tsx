"use client";

import { motion } from "framer-motion";
import { colors, fonts } from "@/lib/theme";
import Logo from "@/components/Logo";
import FadeIn from "@/components/FadeIn";
import EmailNurtureSignup from "@/components/EmailNurtureSignup";

const display = fonts.display;
const body = fonts.bodyAlt;

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  comingSoon?: boolean;
}

const POSTS: BlogPost[] = [
  {
    slug: "seven-disruptions-job-loss",
    title: "The 7 things that break when you lose a job (and what to do about each one)",
    excerpt: "Job loss disrupts more than your income. It hits your identity, your routine, your sense of belonging. Here is the full map of what shifts and where to start.",
    category: "Layoff",
    readTime: "8 min",
    date: "Coming soon",
    comingSoon: true,
  },
  {
    slug: "pip-not-a-death-sentence",
    title: "A PIP is not a death sentence. Here is how to think clearly through one.",
    excerpt: "The panic is louder than the feedback. Separating signal from noise is the first skill you need. Here is how to do it without spiraling.",
    category: "PIP",
    readTime: "6 min",
    date: "Coming soon",
    comingSoon: true,
  },
  {
    slug: "imposter-syndrome-new-role",
    title: "You got the promotion. Why does it feel like a mistake?",
    excerpt: "Imposter syndrome in a new role is not a character flaw. It is a predictable response to unfamiliarity. Understanding the mechanism helps you work with it.",
    category: "New Role",
    readTime: "7 min",
    date: "Coming soon",
    comingSoon: true,
  },
  {
    slug: "saboteur-patterns",
    title: "The voice in your head that sounds like you but is not helping",
    excerpt: "Shirzad Chamine calls them saboteurs. IFS calls them protectors. Whatever you call the inner critic, learning to spot it changes everything.",
    category: "Framework",
    readTime: "9 min",
    date: "Coming soon",
    comingSoon: true,
  },
  {
    slug: "grief-vs-depression-job-loss",
    title: "When is job loss grief and when is it something else?",
    excerpt: "Sadness after losing a job is not depression. But sometimes it becomes depression. Here is how to tell the difference and what to do about each.",
    category: "Layoff",
    readTime: "7 min",
    date: "Coming soon",
    comingSoon: true,
  },
  {
    slug: "window-of-tolerance",
    title: "Why you cannot think clearly under stress (and the neuroscience of getting back)",
    excerpt: "Dan Siegel's window of tolerance explains why your brain goes offline when you need it most. Understanding the mechanism is the first step to widening it.",
    category: "Framework",
    readTime: "6 min",
    date: "Coming soon",
    comingSoon: true,
  },
  {
    slug: "values-under-pressure",
    title: "Your values do not change under pressure. Your behavior does.",
    excerpt: "When stress hits, we default to survival mode. The gap between what you value and what you actually do under threat is where the real work is.",
    category: "Framework",
    readTime: "8 min",
    date: "Coming soon",
    comingSoon: true,
  },
  {
    slug: "managing-up-during-pip",
    title: "How to manage your manager when they are managing you out",
    excerpt: "The PIP changed the power dynamic. Here is how to take back agency without being adversarial, using structured check-ins and documentation.",
    category: "PIP",
    readTime: "7 min",
    date: "Coming soon",
    comingSoon: true,
  },
  {
    slug: "first-90-days",
    title: "The first 90 days: a framework for landing in a new role without burning out",
    excerpt: "Michael Watkins' research shows the first 90 days determine long-term success. Here is what to prioritize and what to let go of.",
    category: "New Role",
    readTime: "8 min",
    date: "Coming soon",
    comingSoon: true,
  },
];

const categoryColors: Record<string, string> = {
  Layoff: "#818cf8",
  PIP: "#fbbf24",
  "New Role": "#34d399",
  Framework: "#60a5fa",
};

export default function BlogPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bgDeep, color: colors.textPrimary }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 24px 40px" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <Logo size={28} />
          </a>
        </div>

        <FadeIn preset="slide-up">
          <h1
            style={{
              fontFamily: display,
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              marginBottom: 12,
            }}
          >
            The Mindcraft Blog
          </h1>
          <p
            style={{
              fontFamily: body,
              fontSize: 16,
              color: colors.textSecondary,
              lineHeight: 1.7,
              marginBottom: 48,
              maxWidth: 560,
            }}
          >
            Frameworks, patterns, and practical tools for navigating career disruptions.
            Written for people in the middle of it.
          </p>
        </FadeIn>

        {/* Posts grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 64 }}>
          {POSTS.map((post, i) => (
            <FadeIn key={post.slug} preset="slide-up" delay={0.05 * i}>
              <motion.div
                whileHover={post.comingSoon ? {} : { y: -2, borderColor: "rgba(224,149,133,0.3)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                style={{
                  padding: 24,
                  backgroundColor: colors.bgSurface,
                  borderRadius: 14,
                  border: `1px solid ${colors.borderDefault}`,
                  cursor: post.comingSoon ? "default" : "pointer",
                  opacity: post.comingSoon ? 0.7 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span
                    style={{
                      fontFamily: body,
                      fontSize: 11,
                      fontWeight: 600,
                      color: categoryColors[post.category] || colors.textMuted,
                      backgroundColor: `${categoryColors[post.category] || colors.textMuted}18`,
                      padding: "3px 10px",
                      borderRadius: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {post.category}
                  </span>
                  <span style={{ fontFamily: body, fontSize: 12, color: colors.textMuted }}>
                    {post.readTime}
                  </span>
                  {post.comingSoon && (
                    <span
                      style={{
                        fontFamily: body,
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#1a1a1a",
                        backgroundColor: "#fbbf24",
                        padding: "2px 8px",
                        borderRadius: 8,
                        marginLeft: "auto",
                      }}
                    >
                      COMING SOON
                    </span>
                  )}
                </div>

                <h2
                  style={{
                    fontFamily: display,
                    fontSize: 18,
                    fontWeight: 600,
                    lineHeight: 1.35,
                    marginBottom: 8,
                    color: colors.textPrimary,
                  }}
                >
                  {post.title}
                </h2>

                <p
                  style={{
                    fontFamily: body,
                    fontSize: 14,
                    color: colors.textSecondary,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {post.excerpt}
                </p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Newsletter signup */}
      <EmailNurtureSignup />

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "32px 24px 48px" }}>
        <a
          href="/"
          style={{
            fontFamily: body,
            fontSize: 13,
            color: colors.textMuted,
            textDecoration: "none",
          }}
        >
          &larr; Back to Mindcraft
        </a>
      </div>
    </div>
  );
}
