"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import styles from "./HeroTypewriter.module.css";

type HeroTypewriterProps = {
  phrases: string[];
  className?: string;
};

const typingDelay = 78;
const pauseDelay = 1900;
const deleteDelay = 42;
const nextDelay = 360;

function splitGraphemes(input: string) {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("ar", { granularity: "grapheme" });
    return Array.from(segmenter.segment(input), (segment) => segment.segment);
  }

  return Array.from(input);
}

export function HeroTypewriter({ phrases, className }: HeroTypewriterProps) {
  const prefersReducedMotion = useReducedMotion();
  const segmentedPhrases = useMemo(() => phrases.map(splitGraphemes), [phrases]);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(1);
  const [phase, setPhase] = useState<"typing" | "pausing" | "deleting">("typing");

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const currentPhrase = segmentedPhrases[phraseIndex] ?? [];
    let timer: number | undefined;

    if (phase === "typing") {
      if (charIndex < currentPhrase.length) {
        timer = window.setTimeout(() => {
          setCharIndex((value) => value + 1);
        }, typingDelay);
      } else {
        timer = window.setTimeout(() => {
          setPhase("pausing");
        }, pauseDelay);
      }
    } else if (phase === "pausing") {
      timer = window.setTimeout(() => {
        setPhase("deleting");
      }, nextDelay);
    } else if (phase === "deleting") {
      if (charIndex > 0) {
        timer = window.setTimeout(() => {
          setCharIndex((value) => value - 1);
        }, deleteDelay);
      } else {
        timer = window.setTimeout(() => {
          setPhraseIndex((value) => (value + 1) % segmentedPhrases.length);
          setCharIndex(1);
          setPhase("typing");
        }, nextDelay);
      }
    }

    return () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [charIndex, phase, phraseIndex, prefersReducedMotion, segmentedPhrases]);

  const activePhrase = phrases[phraseIndex] ?? "";
  const visibleText = prefersReducedMotion
    ? phrases[0] ?? ""
    : segmentedPhrases[phraseIndex]?.slice(0, charIndex).join("") ?? "";

  return (
    <span className={[styles.shell, className].filter(Boolean).join(" ")} dir="rtl" aria-hidden="true">
      <span className={styles.line}>
        <span className={styles.text}>{visibleText || "\u00A0"}</span>
        {!prefersReducedMotion ? <span className={styles.caret} aria-hidden="true" /> : null}
      </span>
      <span className={styles.srOnly}>{activePhrase}</span>
    </span>
  );
}
