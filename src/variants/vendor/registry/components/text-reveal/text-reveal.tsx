"use client";
import { Fragment, type CSSProperties } from "react";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import styles from "./text-reveal.module.css";

/**
 * Reveals a short headline or sentence once, as it mounts: each word rises out of its own clip while it sharpens from a soft blur.
 * The entrance runs in CSS, so it starts on first paint, never waits for hydration, and never leaves text hidden when scripts are slow.
 * Use `\n` in `text` for a deliberate line break and change the element's `key` to replay it.
 */
export interface TextRevealProps { text: string; as?: "h1" | "h2" | "h3" | "p"; className?: string; id?: string; /** Seconds to wait before the first word rises. Defaults to 0. */ delay?: number }
/** Total stagger stays under this many seconds, however long the text is. */
const MAX_STAGGER = motionTokens.sequence.textBudget;

export function TextReveal({ text, as = "h2", className, id, delay = motionTokens.reduced.stagger }: TextRevealProps) {
  const Tag = as;
  const lines = text.split("\n").map(line => line.split(" ").filter(Boolean));
  let count = 0;
  let intervals = 0;
  lines.forEach((words, lineIndex) => {
    count += words.length;
    // A deliberate line break adds a beat. Budget the last word and its line beat together.
    if (words.length) intervals = count - 1 + lineIndex;
  });
  const step = Math.min(motionTokens.stagger.word, MAX_STAGGER / Math.max(count, intervals, 1));
  const blur = as === "p" ? motionTokens.blur.soft : motionTokens.blur.text;
  let index = 0;
  const spoken = text.replace(/\n/g, " ");
  // Headings take their accessible name from aria-label, so the sentence appears once in the DOM. A paragraph cannot be named, so it keeps a visually hidden copy.
  const named = as !== "p";
  return <Tag id={id} aria-label={named ? spoken : undefined} className={[styles.reveal, className].filter(Boolean).join(" ")} style={{ "--rams-detail-reveal-blur": `${blur}px` } as CSSProperties}>
    {named ? null : <span className={styles.srOnly}>{spoken}</span>}
    {lines.map((words, lineIndex) => <Fragment key={lineIndex}><span className={styles.line} aria-hidden="true">{words.map((word, wordIndex) => {
      const position = index++;
      return <Fragment key={`${word}-${position}`}><span className={styles.clip}><span className={styles.word} style={{ "--rams-detail-reveal-delay": `${delay + position * step + lineIndex * step}s` } as CSSProperties}>{word}</span></span>{wordIndex < words.length - 1 ? " " : null}</Fragment>;
    })}</span>{lineIndex < lines.length - 1 ? " " : null}</Fragment>)}
  </Tag>;
}

export default TextReveal;
