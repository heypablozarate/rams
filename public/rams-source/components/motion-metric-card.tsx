"use client";
import "./motion-fields.css";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, type TargetAndTransition, type Variants } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import { MotionSmall, MotionSwap } from "./motion-swap";
import { motionTokens } from "./motion-tokens";
import { AnimatedCounter } from "./motion-animated-counter";
import styles from "./motion-metric-card.module.css";
export interface MetricCardProps { label: string; value: number; suffix?: string; context: string; change?: string }

const cardMotion = motionTokens.keyframes.metricCard;
const changeInitial = { opacity: 0, scale: cardMotion.changeScale };
const changePresent = { opacity: 1, scale: 1, transition: motionTokens.spring.snappy };
const changeExit: TargetAndTransition = {
  opacity: 0,
  scale: cardMotion.changeScale,
  transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] },
};

/** Copy that holds a number enters from the side it moved toward: a larger value rises from below, a smaller one drops from above. */
const rise: Variants = { hidden: (direction: number) => ({ opacity: 0, y: `${cardMotion.textTravelEm * direction}em`, filter: `blur(${motionTokens.blur.soft}px)` }), shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } }, gone: (direction: number) => ({ opacity: 0, y: `${-cardMotion.textTravelEm * direction}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }) };
const fade: Variants = { hidden: { opacity: 0, y: 0, filter: "blur(0px)" }, shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } }, gone: { opacity: 0, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } } };
const amountIn = (text: string) => Number(text.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/)?.[0] ?? NaN);

/** New copy rises in while the old copy leaves; `morph` springs the wrapper to the new text's width instead of letting it snap. */
function Swap({ text, morph = false, block = false }: { text: string; morph?: boolean; block?: boolean }) {
  const reduceMotion = !!useReducedMotion();
  const sizer = useRef<HTMLSpanElement>(null);
  const width = useMotionValue<number | "auto">("auto");
  const [shown, setShown] = useState({ text, direction: 1 });
  if (shown.text !== text) setShown({ text, direction: amountIn(text) < amountIn(shown.text) ? -1 : 1 });
  useEffect(() => {
    const node = sizer.current;
    if (!node) return;
    if (reduceMotion) { width.jump("auto"); return; }
    if (typeof ResizeObserver === "undefined") return;
    let measured: string | null = null;
    // Layout size, not the transformed rect, so a scaling parent never leaves the text clipped. Only a new text springs; font loads jump.
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = entry.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth;
      if (next && measured !== null && measured !== node.textContent && !reduceMotion) animate(width, next, motionTokens.spring.morph);
      else width.jump(next || "auto");
      measured = next ? node.textContent : null;
    });
    observer.observe(node);
    return () => { observer.disconnect(); width.stop(); };
  }, [morph, reduceMotion, width]);
  return <motion.span className={block ? styles.swapBlock : styles.swap} style={morph ? { width } : undefined}>
    {morph && <span ref={sizer} className={styles.sizer} aria-hidden="true">{text}</span>}
    <AnimatePresence mode="popLayout" initial={false} custom={shown.direction}><MotionSwap key={text} className={styles.text} custom={shown.direction} variants={reduceMotion ? ({ hidden: { opacity: 0, y: 0, filter: "blur(0px)" }, shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.reduced.duration } }, gone: { opacity: 0, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.reduced.duration } } }) : rise} initial="hidden" animate="shown" exit="gone" transition={reduceMotion ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>{text}</MotionSwap></AnimatePresence>
  </motion.span>;
}

export function MetricCard({ label, value, suffix, context, change }: MetricCardProps) {
  return <article className={styles.card}>
    <div className={styles.top}><span><Swap text={label} block /></span><AnimatePresence initial={false}>{change && <MotionSmall key="change" className={styles.change} data-trend={/^[+]/.test(change) ? "up" : /^[-−]/.test(change) ? "down" : undefined} initial={changeInitial} animate={changePresent} exit={changeExit}><Swap text={change} morph /></MotionSmall>}</AnimatePresence></div>
    <AnimatedCounter value={value} suffix={suffix} animateOnView />
    <p><Swap text={context} block /></p>
  </article>;
}
