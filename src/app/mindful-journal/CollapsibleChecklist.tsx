"use client";

import { motion, AnimatePresence } from "framer-motion";
import { colors, fonts } from "@/lib/theme";

const display = fonts.display;
const body = fonts.bodyAlt;

interface CollapsibleChecklistProps {
  title: string;
  categories: Record<string, string[]>;
  checkedItems: Set<string>;
  onToggle: (item: string) => void;
  accentColor: string;
  accentWash: string;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export default function CollapsibleChecklist({
  title,
  categories,
  checkedItems,
  onToggle,
  accentColor,
  accentWash,
  isOpen,
  onToggleOpen,
}: CollapsibleChecklistProps) {
  const count = checkedItems.size;

  return (
    <div style={{
      backgroundColor: colors.bgSurface,
      borderRadius: 14,
      border: `1px solid ${colors.borderDefault}`,
      overflow: "hidden",
    }}>
      {/* Header */}
      <button
        onClick={onToggleOpen}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span style={{
          fontFamily: display,
          fontSize: 14,
          fontWeight: 600,
          color: colors.textPrimary,
        }}>
          {title}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {count > 0 && (
            <span style={{
              fontFamily: display,
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 10px",
              borderRadius: 100,
              backgroundColor: accentWash,
              color: accentColor,
            }}>
              {count}
            </span>
          )}
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ fontSize: 14, color: colors.textMuted }}
          >
            ▾
          </motion.span>
        </span>
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              padding: "0 18px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}>
              {Object.entries(categories).map(([category, items]) => (
                <div key={category}>
                  <p style={{
                    fontFamily: display,
                    fontSize: 11,
                    fontWeight: 600,
                    color: colors.textMuted,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    margin: "0 0 8px 0",
                  }}>
                    {category}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {items.map((item) => {
                      const checked = checkedItems.has(item);
                      return (
                        <motion.button
                          key={item}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => onToggle(item)}
                          style={{
                            padding: "5px 14px",
                            borderRadius: 100,
                            fontSize: 12,
                            fontFamily: body,
                            fontWeight: 500,
                            cursor: "pointer",
                            border: checked
                              ? `1.5px solid ${accentColor}`
                              : `1px solid ${colors.borderDefault}`,
                            backgroundColor: checked ? accentWash : "transparent",
                            color: checked ? accentColor : colors.textSecondary,
                            transition: "all 0.15s",
                          }}
                        >
                          {item}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
