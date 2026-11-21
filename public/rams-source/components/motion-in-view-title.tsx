"use client";
import "./motion-fields.css";
import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useInView, type Transition } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import { motionTokens } from "./motion-tokens";
import styles from "./motion-in-view-title.module.css";

export type InViewTitleVariant = "word" | "line" | "blur" | "tracking" | "wipe";
/**
 * A section title that reveals itself once it scrolls into view. `blur` sharpens word by word and suits most headings; `word` and `line` rise out of a clip for editorial pages;
 * `tracking` opens tight letter spacing; `wipe` uncovers the title from left to right through a soft edge. Pass `lines` to set the breaks for `line`, and `once={false}` to replay on every entry.
 * Titles that are already above the viewport show immediately, and server rendered titles appear on their own if scripts are slow.
 */
export interface InViewTitleProps { text: string; variant?: InViewTitleVariant; as?: "h1" | "h2" | "h3"; lines?: string[]; className?: string; id?: string; once?: boolean }
const subscribeHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
/** Matches the delay of the stylesheet fallback: when scripts arrive later than this, the fallback has already shown the title, so it stays put instead of animating again. */
const FALLBACK_MS = motionTokens.sequence.hydrationFallback * 1000;
const lateBoot = typeof window !== "undefined" && performance.now() > FALLBACK_MS;
const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
/** Horizontal distance each letter travels per step from its word's center in the tracking variant. */
const titleMotion = motionTokens.keyframes.inViewTitle;

/** Transform settles longest, blur clears sooner, and opacity leads, so text is readable before it has fully arrived. Hiding is a quick fade with no stagger. */
function reveal(instant: boolean, visible: boolean, delay: number, settle: number = titleMotion.settleSeconds): Transition {
  if (instant) return { duration: motionTokens.reduced.duration };
  if (!visible) return { duration: motionTokens.duration.exit, ease: standard };
  const track = (duration: number, ease = enter) => ({ duration, delay, ease });
  return { y: track(settle), x: track(settle), "--rams-detail-wipe": track(settle, standard), filter: track(settle * titleMotion.blurDurationRatio), opacity: track(settle * titleMotion.opacityDurationRatio, standard) };
}

export function InViewTitle({ text, variant = "blur", as = "h2", lines, className, id, once = true }: InViewTitleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, amount: titleMotion.intersectionShare });
  const [passed, setPassed] = useState(false);
  useEffect(() => {
    if (!once || inView || passed) return;
    const revealPassedTitle = () => {
      if (ref.current && ref.current.getBoundingClientRect().top < 0) setPassed(true);
    };
    revealPassedTitle();
    window.addEventListener("scroll", revealPassedTitle, { passive: true });
    return () => window.removeEventListener("scroll", revealPassedTitle);
  }, [once, inView, passed]);
  const prefersReduced = useReducedMotion();
  const hydrated = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
  const [serverRendered] = useState(!hydrated);
  const reduced = hydrated && prefersReduced;
  const late = hydrated && serverRendered && lateBoot;
  const visible = reduced || late || inView || (once && passed);
  const instant = Boolean(reduced || late);
  const Tag = as;
  const wrapperClass = [styles.wrap, hydrated ? "" : styles.pending, className].filter(Boolean).join(" ");
  const words = text.split(" ").filter(Boolean);
  // Preserve the nominal cadence when it fits and spread longer sequences across the start budget.
  const step = Math.min(motionTokens.stagger.word * titleMotion.wordStaggerMultiplier, motionTokens.sequence.textBudget / Math.max(words.length - 1, 1));

  if (variant === "word") return <div ref={ref} className={wrapperClass}><Tag id={id} aria-label={text}>{words.map((word, index) => <Fragment key={`${word}-${index}`}><span className={styles.clip} aria-hidden="true"><motion.span className={styles.part} initial={false} animate={visible ? { y: "0em", opacity: 1 } : { y: `${titleMotion.wordOffsetEm}em`, opacity: 0 }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : reveal(instant, visible, index * step)}>{word}</motion.span></span>{index < words.length - 1 ? " " : null}</Fragment>)}</Tag></div>;
  if (variant === "line") {
    const titleLines = lines?.length ? lines : [text];
    const lineStep = Math.min(motionTokens.stagger.line, motionTokens.sequence.textBudget / Math.max(titleLines.length - 1, 1));
    return <div ref={ref} className={wrapperClass}><Tag id={id} aria-label={text}>{titleLines.map((line, index) => <span className={styles.lineClip} aria-hidden="true" key={`${line}-${index}`}><motion.span className={styles.part} initial={false} animate={visible ? { y: "0%", opacity: 1 } : { y: `${titleMotion.lineOffsetPercent}%`, opacity: 0 }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : reveal(instant, visible, index * lineStep, titleMotion.lineSettleSeconds)}>{line}</motion.span></span>)}</Tag></div>;
  }
  if (variant === "blur") return <div ref={ref} className={wrapperClass}><Tag id={id} aria-label={text}>{words.map((word, index) => <Fragment key={`${word}-${index}`}><motion.span className={`${styles.blurWord} ${styles.part}`} aria-hidden="true" initial={false} animate={visible ? { opacity: 1, y: "0em", filter: "blur(0px)" } : { opacity: 0, y: `${titleMotion.blurOffsetEm}em`, filter: `blur(${motionTokens.blur.text}px)` }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : reveal(instant, visible, index * step)}>{word}</motion.span>{index < words.length - 1 ? " " : null}</Fragment>)}</Tag></div>;
  if (variant === "tracking") return <div ref={ref} className={wrapperClass}><Tag id={id} aria-label={text}>{words.map((word, index) => {
    const letters = Array.from(word);
    const center = (letters.length - 1) / 2;
    const delay = Math.min(index * motionTokens.stagger.word, motionTokens.sequence.textBudget);
    return <Fragment key={`${word}-${index}`}><motion.span className={`${styles.trackWord} ${styles.part}`} aria-hidden="true" initial={false} animate={visible ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: `blur(${motionTokens.blur.soft}px)` }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : reveal(instant, visible, delay, titleMotion.trackingWordSettleSeconds)}>{letters.map((letter, letterIndex) => <motion.span key={letterIndex} className={styles.part} initial={false} animate={{ x: visible ? "0em" : `${(center - letterIndex) * titleMotion.trackingStepEm}em` }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : reveal(instant, visible, delay, titleMotion.trackingGlyphSettleSeconds)}>{letter}</motion.span>)}</motion.span>{index < words.length - 1 ? " " : null}</Fragment>;
  })}</Tag></div>;
  // A soft edged mask sweeps across the title instead of a hard clip, so no letter is ever cut mid stroke.
  return <div ref={ref} className={wrapperClass}><motion.div className={`${styles.wipe} ${styles.part}`} initial={false} animate={visible ? { "--rams-detail-wipe": "0%", x: "0em" } : { "--rams-detail-wipe": "100%", x: `${titleMotion.wipeOffsetEm}em` }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : reveal(instant, visible, 0, titleMotion.wipeSettleSeconds)}><Tag id={id}>{text}</Tag></motion.div></div>;
}

export default InViewTitle;
