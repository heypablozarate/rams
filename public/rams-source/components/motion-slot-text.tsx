"use client";
import "./motion-fields.css";

import { motionTokens } from "./motion-tokens";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, animate, motion, useMotionValue, usePresence, useTransform, useVelocity } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import styles from "./motion-slot-text.module.css";

/**
 * Text and numbers that spin into their new value like slot machine reels. Every character is a reel; digits count through
 * the wheel in the direction the number moved, letters shuffle through the alphabet, and reels stop one after another from
 * left to right with a soft, overshoot-free landing. Use it for prices, stats, and launch moments where a change deserves a beat.
 */
export interface SlotTextProps {
  /** The value to show. Numbers pass through format; strings render as they are. */
  value: string | number;
  /** Formats a number value. Defaults to en-US grouping, so 12480 reads 12,480. */
  format?: (value: number) => string;
  /** Seconds each reel spins. Later reels start after a bounded stagger. */
  duration?: number;
  /** Seconds between reel starts, left to right; total delay is bounded by the RAMS text sequence budget. */
  stagger?: number;
  /** Extra full turns a digit makes before it lands. 0 rolls straight to the new digit. */
  spins?: number;
  /** Which end reels are matched from when the length changes. Numbers default to end, so 999 to 1,000 grows on the left. */
  align?: "start" | "end";
  /** Announce new values politely to screen readers. */
  announce?: boolean;
  className?: string;
  style?: CSSProperties;
}

const DIGITS = "0123456789";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = LOWER.toUpperCase();
/** Fast out, long soft landing, never past the target. */
const LANDING = motionTokens.keyframes.slotText.landing;
const subscribe = () => () => {};

function useReducedFlag() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

const classOf = (char: string) => DIGITS.includes(char) ? DIGITS : LOWER.includes(char) ? LOWER : UPPER.includes(char) ? UPPER : null;

/** Deterministic shuffle so the same change always spins the same letters. */
function seeded(seed: number) {
  let state = seed >>> 0 || 1;
  return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
}

/** The reel's cells, from what is visible now to the target. */
function buildStrip(from: string, to: string, spins: number, rising: boolean, seed: number) {
  if (from === to) return [to];
  const set = classOf(to);
  if (!set) return [from, to];
  if (set === DIGITS && classOf(from) === DIGITS) {
    const a = Number(from), b = Number(to);
    const steps = spins * 10 + (rising ? (b - a + 10) % 10 : (a - b + 10) % 10);
    return Array.from({ length: steps + 1 }, (_, i) => String((a + (rising ? i : -i) + 100) % 10));
  }
  const random = seeded(seed);
  const fillers = Array.from({ length: Math.max(2, spins * 5 + 2) }, () => set[Math.floor(random() * set.length)]);
  return [from, ...fillers, to];
}

interface ReelProps {
  char: string;
  order: number;
  entering: boolean;
  rising: boolean;
  duration: number;
  stagger: number;
  spins: number;
}

function Reel({ char, order, entering, rising, duration, stagger, spins }: ReelProps) {
  const pos = useMotionValue(0);
  const width = useMotionValue<number | "auto">("auto");
  const sizer = useRef<HTMLSpanElement>(null);
  const [isPresent, safeToRemove] = usePresence();
  const reduced = useReducedFlag();
  const [reel, setReel] = useState(() => ({
    char,
    strip: entering && !reduced ? buildStrip("", char, spins, rising, char.charCodeAt(0) + order) : [char],
    from: 0,
    grow: entering,
    time: duration,
    delay: Math.min(Math.max(0, order * stagger), motionTokens.sequence.textBudget),
  }));

  // A new target restarts the reel from the cell that is on screen right now, keeping its sub-cell offset, so nothing jumps.
  if (reel.char !== char) {
    const current = pos.get();
    const index = Math.max(0, Math.min(reel.strip.length - 1, Math.round(current)));
    const visible = reel.strip[index]!;
    setReel({
      char,
      strip: reduced ? [char] : buildStrip(visible, char, spins, rising, char.charCodeAt(0) * 31 + visible.charCodeAt(0) * 7 + order + reel.strip.length),
      from: reduced ? 0 : current - index,
      grow: false,
      time: duration,
      delay: Math.min(Math.max(0, order * stagger), motionTokens.sequence.textBudget),
    });
  }

  const blur = useTransform(useVelocity(pos), velocity => {
    const amount = Math.min(Math.abs(velocity) * motionTokens.keyframes.slotText.blurVelocityFactor, motionTokens.keyframes.slotText.blurMaxPx);
    return amount < motionTokens.keyframes.slotText.blurThresholdPx ? "none" : `blur(${amount.toFixed(2)}px)`;
  });
  // Cells are taller than the line, so the neighbours of a landed glyph sit fully outside the window.
  const y = useTransform(pos, value => `translate3d(0, calc(var(--rams-detail-slot-text-cell-pitch) * ${(-value).toFixed(6)}), 0)`);

  useLayoutEffect(() => {
    const measured = sizer.current?.getBoundingClientRect().width ?? 0;
    const last = reel.strip.length - 1;
    if (reduced) {
      pos.jump(last);
      width.jump(measured);
      return;
    }
    pos.jump(reel.from);
    const spin = animate(pos, last, { duration: last === 0 ? motionTokens.duration.standard : reel.time, delay: reel.delay, ease: [...LANDING] });
    if (reel.grow) width.jump(0);
    if (width.get() === "auto") { width.jump(measured); return () => spin.stop(); }
    const size = animate(width, measured, { type: "spring", visualDuration: Math.min(reel.time, motionTokens.duration.considered), bounce: motionTokens.spring.smooth.bounce });
    return () => { spin.stop(); size.stop(); };
  }, [reel, pos, width, reduced]);

  // Follow font loading, density and user text-size changes without replaying a reel.
  // Observe the intrinsic sizer, not the animated slot, so width updates cannot feed back into this observer.
  useLayoutEffect(() => {
    const node = sizer.current;
    if (!node || !isPresent || typeof ResizeObserver === "undefined") return;
    let measured = node.getBoundingClientRect().width;
    const observer = new ResizeObserver(() => {
      const next = node.getBoundingClientRect().width;
      if (!Number.isFinite(next) || Math.abs(next - measured) < motionTokens.keyframes.slotText.glyphMeasureTolerancePx) return;
      measured = next;
      width.jump(next);
    });
    observer.observe(node);
    return () => observer.disconnect();
    // A new character is already measured by the reel effect above; reset the observer's baseline so its spring stays intact.
  }, [char, isPresent, width]);

  // Presence registers its exiting keys during layout. Complete retirement after that registration.
  useEffect(() => {
    if (isPresent) return;
    if (reduced) { safeToRemove(); return; }
    const exit = animate(width, 0, { type: "spring", visualDuration: motionTokens.spring.smooth.visualDuration, bounce: motionTokens.spring.smooth.bounce, onComplete: safeToRemove });
    return () => exit.stop();
  }, [isPresent, safeToRemove, width, reduced]);

  return <motion.span className={styles.slot} data-numeric={DIGITS.includes(char) ? "" : undefined} style={{ width }} data-exiting={isPresent ? undefined : ""}>
    <span ref={sizer} className={styles.sizer}>{char === " " ? "\u00a0" : char}</span>
    <span className={styles.window}>
      <motion.span className={styles.strip} style={{ transform: y, filter: blur, ...({ "--rams-detail-slot-text-reduced-target-index": 1 - reel.strip.length } as CSSProperties) }}>
        {reel.strip.map((cell, i) => <span key={i} className={styles.cell}>{cell === " " ? "\u00a0" : cell}</span>)}
      </motion.span>
    </span>
  </motion.span>;
}

export function SlotText({ value, format, duration = motionTokens.roleDuration.displayReveal, stagger = motionTokens.stagger.word, spins = motionTokens.keyframes.slotText.defaultSpins, align, announce = false, className, style }: SlotTextProps) {
  const text = typeof value === "number" ? (format ? format(value) : value.toLocaleString("en-US")) : value;
  const fromEnd = (align ?? (typeof value === "number" ? "end" : "start")) === "end";
  const chars = Array.from(text);
  // A leading run of symbols (a currency sign, a plus) is keyed from the start and never spins into a digit; the rest is
  // keyed from the aligned end, so separators and suffixes stay on their own reels when the number grows.
  const lead = fromEnd ? chars.findIndex(char => /[\p{L}\p{N}]/u.test(char)) : 0;
  const prefix = lead < 0 ? chars.length : lead;
  const keyOf = (i: number) => i < prefix ? `p${i}` : fromEnd ? `e${chars.length - 1 - i}` : `s${i}`;
  const [initialKeys] = useState(() => new Set(chars.map((_, i) => keyOf(i))));
  const [trend, setTrend] = useState({ value, rising: true });
  if (trend.value !== value) {
    setTrend({ value, rising: typeof value === "number" && typeof trend.value === "number" ? value >= trend.value : true });
  }

  return <span className={[styles.root, className].filter(Boolean).join(" ")} style={style}>
    <span className={styles.srOnly} aria-live={announce ? "polite" : undefined}>{text}</span>
    <span className={styles.reels} aria-hidden="true">
      <AnimatePresence initial={false}>
        {chars.map((char, i) => <Reel
          key={keyOf(i)}
          char={char}
          order={i}
          entering={!initialKeys.has(keyOf(i))}
          rising={trend.rising}
          duration={duration}
          stagger={stagger}
          spins={spins}
        />)}
      </AnimatePresence>
    </span>
  </span>;
}

export default SlotText;
