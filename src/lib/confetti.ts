/**
 * Day-completion confetti — SSR-safe via dynamic import.
 * Uses canvas-confetti (already in package.json).
 */

export async function fireDayCompleteConfetti() {
  const confetti = (await import("canvas-confetti")).default;

  // First burst — center
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.5, y: 0.6 },
    colors: ["#C4943A", "#D4A84E", "#F0EDE6", "#6AB282"],
    disableForReducedMotion: true,
  });

  // Second burst — slight offset, delayed
  setTimeout(() => {
    confetti({
      particleCount: 40,
      spread: 55,
      origin: { x: 0.45, y: 0.55 },
      colors: ["#C4943A", "#D4A84E", "#F0EDE6"],
      disableForReducedMotion: true,
    });
  }, 150);
}
