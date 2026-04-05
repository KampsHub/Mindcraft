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
  emoji: string;
  gradient: string;
  comingSoon?: boolean;
}

const POSTS: BlogPost[] = [
  {
    slug: "seven-disruptions-job-loss",
    title: "The 7 things that break when you lose a job",
    excerpt: "Job loss disrupts more than your income. It hits your identity, your routine, your sense of belonging. Here is the full map of what shifts and where to start.",
    category: "Layoff",
    readTime: "8 min read",
    emoji: "🧭",
    gradient: "linear-gradient(135deg, #1a1a3e 0%, #2d1b4e 100%)",
    comingSoon: true,
  },
  {
    slug: "pip-not-a-death-sentence",
    title: "A PIP is not a death sentence",
    excerpt: "The panic is louder than the feedback. Separating signal from noise is the first skill you need. Here is how to do it without spiraling.",
    category: "PIP",
    readTime: "6 min read",
    emoji: "🎯",
    gradient: "linear-gradient(135deg, #2a1f0a 0%, #3d2b0a 100%)",
    comingSoon: true,
  },
  {
    slug: "imposter-syndrome-new-role",
    title: "You got the promotion. Why does it feel like a mistake?",
    excerpt: "Imposter syndrome in a new role is not a character flaw. It is a predictable response to unfamiliarity. Understanding the mechanism helps you work with it.",
    category: "New Role",
    readTime: "7 min read",
    emoji: "🪞",
    gradient: "linear-gradient(135deg, #0a2a1f 0%, #0a3d2b 100%)",
    comingSoon: true,
  },
  {
    slug: "saboteur-patterns",
    title: "The voice in your head that sounds like you but is not helping",
    excerpt: "Shirzad Chamine calls them saboteurs. IFS calls them protectors. Whatever you call the inner critic, learning to spot it changes everything.",
    category: "Framework",
    readTime: "9 min read",
    emoji: "🎭",
    gradient: "linear-gradient(135deg, #1a2a3e 0%, #1b2d4e 100%)",
    comingSoon: true,
  },
  {
    slug: "grief-vs-depression-job-loss",
    title: "When is job loss grief and when is it something else?",
    excerpt: "Sadness after losing a job is not depression. But sometimes it becomes depression. Here is how to tell the difference and what to do about each.",
    category: "Layoff",
    readTime: "7 min read",
    emoji: "🌊",
    gradient: "linear-gradient(135deg, #1e1a3e 0%, #2e1b4e 100%)",
    comingSoon: true,
  },
  {
    slug: "window-of-tolerance",
    title: "Why you can\u2019t think clearly under stress",
    excerpt: "Dan Siegel\u2019s window of tolerance explains why your brain goes offline when you need it most. Understanding the mechanism is the first step to widening it.",
    category: "Framework",
    readTime: "6 min read",
    emoji: "🧠",
    gradient: "linear-gradient(135deg, #1a2a2a 0%, #1b3d3d 100%)",
    comingSoon: true,
  },
  {
    slug: "values-under-pressure",
    title: "Your values don\u2019t change under pressure. Your behavior does.",
    excerpt: "When stress hits, we default to survival mode. The gap between what you value and what you actually do under threat is where the real work is.",
    category: "Framework",
    readTime: "8 min read",
    emoji: "⚖️",
    gradient: "linear-gradient(135deg, #2a1a1a 0%, #3d1b1b 100%)",
    comingSoon: true,
  },
  {
    slug: "managing-up-during-pip",
    title: "How to manage your manager when they\u2019re managing you out",
    excerpt: "The PIP changed the power dynamic. Here is how to take back agency without being adversarial, using structured check-ins and documentation.",
    category: "PIP",
    readTime: "7 min read",
    emoji: "♟️",
    gradient: "linear-gradient(135deg, #2a200a 0%, #3d300a 100%)",
    comingSoon: true,
  },
  {
    slug: "first-90-days",
    title: "The first 90 days: landing without burning out",
    excerpt: "Michael Watkins\u2019 research shows the first 90 days determine long-term success. Here is what to prioritize and what to let go of.",
    category: "New Role",
    readTime: "8 min read",
    emoji: "🚀",
    gradient: "linear-gradient(135deg, #0a2a20 0%, #0a3d30 100%)",
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
      {/* Hero header */}
      <div
        style={{
          padding: "60px 24px 64px",
          textAlign: "center",
          borderBottom: `1px solid ${colors.borderSubtle}`,
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <a href="/" style={{ textDecoration: "none" }}>
            <Logo size={28} />
          </a>
        </div>

        <FadeIn preset="slide-up">
          <h1
            style={{
              fontFamily: display,
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              marginBottom: 16,
            }}
          >
            The Blog
          </h1>
          <p
            style={{
              fontFamily: body,
              fontSize: 17,
              color: colors.textSecondary,
              lineHeight: 1.7,
              maxWidth: 500,
              margin: "0 auto",
            }}
          >
            Frameworks, patterns, and practical tools for navigating career disruptions.
            Written for people in the middle of it.
          </p>
        </FadeIn>
      </div>

      {/* Posts grid — 2 columns on desktop */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 64px" }}>
        <div
          className="blog-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
            gap: 24,
          }}
        >
          {POSTS.map((post, i) => (
            <FadeIn key={post.slug} preset="slide-up" delay={0.06 * i}>
              <motion.div
                whileHover={{ y: -4, boxShadow: "0 16px 40px rgba(0,0,0,0.3)" }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  border: `1px solid ${colors.borderDefault}`,
                  cursor: post.comingSoon ? "default" : "pointer",
                  backgroundColor: colors.bgSurface,
                }}
              >
                {/* Image area with gradient + emoji */}
                <div
                  style={{
                    background: post.gradient,
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <span style={{ fontSize: 64, filter: "grayscale(0.2)" }}>{post.emoji}</span>

                  {/* Coming soon badge */}
                  {post.comingSoon && (
                    <span
                      style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        fontFamily: display,
                        fontSize: 10,
                        fontWeight: 600,
                        color: colors.bgDeep,
                        backgroundColor: colors.coral,
                        padding: "4px 10px",
                        borderRadius: 6,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      Coming soon
                    </span>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: "20px 24px 24px" }}>
                  {/* Category + read time */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <span
                      style={{
                        fontFamily: body,
                        fontSize: 11,
                        fontWeight: 600,
                        color: categoryColors[post.category] || colors.textMuted,
                        backgroundColor: `${categoryColors[post.category] || colors.textMuted}15`,
                        padding: "4px 10px",
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
                  </div>

                  {/* Title */}
                  <h2
                    style={{
                      fontFamily: display,
                      fontSize: 20,
                      fontWeight: 700,
                      lineHeight: 1.3,
                      marginBottom: 10,
                      color: colors.textPrimary,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p
                    style={{
                      fontFamily: body,
                      fontSize: 14,
                      color: colors.textSecondary,
                      lineHeight: 1.65,
                      margin: "0 0 16px",
                    }}
                  >
                    {post.excerpt}
                  </p>

                  {/* Author line */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        backgroundColor: `${colors.coral}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: display,
                        fontSize: 12,
                        fontWeight: 700,
                        color: colors.coral,
                      }}
                    >
                      SK
                    </div>
                    <span style={{ fontFamily: body, fontSize: 13, color: colors.textMuted }}>
                      Stefanie Kamps
                    </span>
                  </div>
                </div>
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

      <style>{`
        @media (max-width: 520px) {
          .blog-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
