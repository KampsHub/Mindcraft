import { useState, useCallback } from "react";

export function useProgressiveReveal(initialRevealed: string[] = []) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set(initialRevealed));

  const revealNext = useCallback((key: string) => {
    setRevealed((prev) => new Set([...prev, key]));
  }, []);

  const skipTo = useCallback((key: string) => {
    setRevealed((prev) => new Set([...prev, key]));
  }, []);

  const isRevealed = useCallback((key: string) => revealed.has(key), [revealed]);

  return { revealed, revealNext, skipTo, isRevealed };
}
