"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useTransform, type MotionValue, type Variants } from "motion/react";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { MotionSwap } from "@/variants/motion-swap";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import styles from "./animated-counter.module.css";

export interface AnimatedCounterProps {
  value: number; label?: string; prefix?: string; suffix?: string; decimals?: number;
  /** Roll every digit up from zero the first time the counter scrolls into view. */
  animateOnView?: boolean;
  /** Formatting locale. Fixed by default so server and client render the same digits. */
  locale?: string;
}

type Part = { key: string; digit: number; order: number } | { key: string; text: string };

const { animatedCounter: counterMotion } = motionTokens.keyframes;
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const rise: Variants = { hidden: { opacity: 0, y: `${counterMotion.labelTravelEm}em`, filter: `blur(${motionTokens.blur.soft}px)` }, shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } }, gone: { opacity: 0, y: `${-counterMotion.labelTravelEm}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } } };
const fade: Variants = { hidden: { opacity: 0, y: 0, filter: "blur(0px)" }, shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } }, gone: { opacity: 0, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } } };
const reveal = { ...motionTokens.spring.smooth, visualDuration: motionTokens.duration.considered };

/** Split a formatted number into columns keyed by place value, so 999 → 1,000 keeps the ones column the ones column. */
function partsFor(value: number, decimals: number, locale: string): Part[] {
  const parts = new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals, numberingSystem: "latn" }).formatToParts(value);
  let place = parts.reduce((count, part) => count + (part.type === "integer" ? part.value.length : 0), 0);
  let fraction = 0;
  let order = 0;
  return parts.flatMap((part, index): Part[] => {
    if (part.type === "integer") return [...part.value].map(char => ({ key: `i${--place}`, digit: Number(char), order: order++ }));
    if (part.type === "fraction") return [...part.value].map(char => ({ key: `f${fraction++}`, digit: Number(char), order: order++ }));
    return [{ key: part.type === "group" ? `g${place}` : part.type === "decimal" ? "d" : `${part.type}${index}`, text: part.value }];
  });
}

/** One digit on the wheel. Its offset from the wheel position decides where it sits and how visible it is. */
function Glyph({ position, digit }: { position: MotionValue<number>; digit: number }) {
  const offset = useTransform(position, current => ((((digit - current) % 10) + 15) % 10) - 5);
  const y = useTransform(offset, current => `${current}em`);
  const opacity = useTransform(offset, current => Math.max(0, 1 - Math.abs(current)));
  const visibility = useTransform(offset, current => Math.abs(current) >= 1 ? "hidden" : "visible");
  const filter = useTransform(offset, current => Math.abs(current) < motionTokens.keyframes.rollingDigit.blurStartOffsetEm || Math.abs(current) >= 1 ? "none" : `blur(${(Math.abs(current) * motionTokens.blur.subtle).toFixed(2)}px)`);
  return <motion.span className={styles.glyph} style={{ y, opacity, filter, visibility }}>{digit}</motion.span>;
}

const presence = { initial: { width: 0, opacity: 0 }, animate: { width: "auto", opacity: 1 }, exit: { width: 0, opacity: 0 } };

/** A digit wheel. It always turns in the direction the whole number moved, wrapping 9 → 0 like an odometer. */
function Column({ digit, direction, armed, delay, reduceMotion }: { digit: number; direction: number; armed: boolean; delay: number; reduceMotion: boolean }) {
  const position = useMotionValue(armed ? 0 : digit);
  const wheel = useRef({ digit: armed ? 0 : digit, target: armed ? 0 : digit, revealed: !armed });
  useEffect(() => {
    const state = wheel.current;
    if (armed) return;
    if (state.digit !== digit) {
      state.target += direction < 0 && state.revealed ? -((state.digit - digit + 10) % 10) : (digit - state.digit + 10) % 10;
      state.digit = digit;
    }
    // A direction/preference change cleans up the prior controller. Unchanged digits
    // must resume their existing target from the current position as well.
    if (position.get() === state.target) { state.revealed = true; return; }
    if (reduceMotion) position.jump(state.target);
    const controls = reduceMotion ? undefined : animate(position, state.target, state.revealed ? motionTokens.spring.smooth : { ...reveal, delay });
    state.revealed = true;
    return () => controls?.stop();
  }, [armed, delay, digit, direction, position, reduceMotion]);
  return <motion.span className={styles.column} {...presence} transition={reduceMotion ? { duration: motionTokens.reduced.duration } : motionTokens.spring.morph}>
    <span className={styles.sizer}>0</span>
    {DIGITS.map(item => <Glyph key={item} position={position} digit={item} />)}
  </motion.span>;
}

export function AnimatedCounter({ value, label, prefix = "", suffix = "", decimals = 0, animateOnView = false, locale = "en-US" }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: counterMotion.viewportShare });
  const reduceMotion = !!useReducedMotion();
  const [previous, setPrevious] = useState(value);
  const [direction, setDirection] = useState(1);
  if (value !== previous) { setPrevious(value); setDirection(value > previous ? 1 : -1); }
  const parts = partsFor(value, decimals, locale);
  const text = `${prefix}${parts.map(part => "text" in part ? part.text : part.digit).join("")}${suffix}`;
  const armed = animateOnView && !inView && !reduceMotion;
  // A preference change retires the whole presence tree, including every in-flight exit.
  // The replacement starts at the latest value (initial=false); data and focus owners stay mounted.
  return <span ref={ref} className={styles.counter}>
    {label && <span className={styles.label}><span className={styles.labelSwap}><AnimatePresence key={reduceMotion ? "reduced" : "motion"} mode="popLayout" initial={false}><MotionSwap key={label} className={styles.labelText} variants={reduceMotion ? ({ hidden: { opacity: 0, y: 0, filter: "blur(0px)" }, shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.reduced.duration } }, gone: { opacity: 0, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.reduced.duration } } }) : rise} initial="hidden" animate="shown" exit="gone" transition={reduceMotion ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>{label}</MotionSwap></AnimatePresence></span><span className={styles.reducedLabel}>{label}</span></span>}
    <span className={styles.srOnly}>{text}</span>
    <span className={`${styles.value} ${styles.motionValue}`} aria-hidden="true">
      {prefix && <span className={styles.symbol}>{prefix}</span>}
      <span className={styles.digitGroup}><AnimatePresence key={reduceMotion ? "reduced" : "motion"} initial={false}>
        {parts.map(part => "digit" in part
          ? <Column key={part.key} digit={part.digit} direction={direction} armed={armed} delay={reduceMotion ? motionTokens.reduced.stagger : Math.min(part.order * motionTokens.stagger.item, motionTokens.sequence.maxStagger)} reduceMotion={reduceMotion} />
          : <motion.span key={part.key} className={styles.symbol} {...presence} transition={reduceMotion ? { duration: motionTokens.reduced.duration } : motionTokens.spring.morph}>{part.text}</motion.span>)}
      </AnimatePresence></span>
      {suffix && <span className={styles.symbol}>{suffix}</span>}
    </span>
    <span className={[styles.value, styles.reducedValue].join(" ")} aria-hidden="true">
      {prefix && <span className={styles.symbol}>{prefix}</span>}
      <span className={styles.digitGroup}>
        {parts.map(part => "digit" in part
          ? <span key={part.key} className={styles.column}><span className={styles.sizer}>0</span><span className={styles.glyph}>{part.digit}</span></span>
          : <span key={part.key} className={styles.symbol}>{part.text}</span>)}
      </span>
      {suffix && <span className={styles.symbol}>{suffix}</span>}
    </span>
  </span>;
}

export default AnimatedCounter;
