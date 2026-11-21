"use client";

import { useEffect } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type TargetAndTransition, type Transition } from "motion/react";
import { MotionSwap } from '@/variants/motion-swap';
import { useReducedMotion } from "@/variants/use-motion-preference";
import { Check } from "rams-icons";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import styles from "./progress.module.css";
import { Progress as RamsProgress } from '@/primitives/progress';

export interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  value?: number;
  max?: number;
  label?: string;
  showValue?: boolean;
}

const exitFast: Transition = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };
const swapOffset = `${motionTokens.keyframes.statusSwap.textOffsetEm}em`;
const textIn: TargetAndTransition = { opacity: 0, y: swapOffset, filter: `blur(${motionTokens.blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: `-${swapOffset}`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: exitFast };
const iconIn: TargetAndTransition = { opacity: 0, scale: motionTokens.keyframes.statusSwap.iconEnterScale, filter: `blur(${motionTokens.blur.subtle}px)` };
const shown: TargetAndTransition = { opacity: 1, y: "0em", scale: 1, filter: "blur(0px)" };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionTokens.duration.instant } };

function percentLabel(percentage: number, complete: boolean) {
  return `${Math.min(Math.round(Math.max(percentage, 0)), complete ? 100 : 99)}%`;
}

export function Progress({ value = 0, max = 100, label, showValue = false, className, ...props }: ProgressProps) {
  const reduce = useReducedMotion();
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = Number.isFinite(value) ? Math.min(Math.max(value, 0), safeMax) : 0;
  const percentage = (safeValue / safeMax) * 100;
  const complete = safeValue === safeMax;
  // One spring drives both the fill and the counted label, so the number always matches the bar.
  const progress = useMotionValue(percentage);
  // The fill slides in from the left instead of scaling, so its rounded end keeps its shape at every value.
  const x = useTransform(progress, latest => `${Math.min(Math.max(latest, 0), 100) - 100}%`);
  const counted = useTransform(progress, latest => percentLabel(latest, complete));
  useEffect(() => {
    if (reduce) { progress.jump(percentage); return; }
    const controls = animate(progress, percentage, motionTokens.spring.smooth);
    return () => controls.stop();
  }, [percentage, progress, reduce]);
  const enter: Transition = reduce ? { duration: motionTokens.reduced.duration } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] };
  const classes = [styles.progress, className].filter(Boolean).join(" ");
  return <div {...props} className={classes} data-complete={complete ? "" : undefined} role={undefined} aria-label={undefined} aria-valuemin={undefined} aria-valuemax={undefined} aria-valuenow={undefined} aria-valuetext={undefined}>
    <RamsProgress className={styles.semantic} value={safeValue} max={safeMax} aria-label={label ?? "Progress"} aria-valuetext={percentLabel(percentage, complete)} aria-describedby={props['aria-describedby']} aria-labelledby={props['aria-labelledby']} />
    {(label || showValue) ? <div className={styles.meta}>
      {label ? <span className={styles.label}><AnimatePresence mode="popLayout" initial={false}><MotionSwap key={label} className={styles.line} initial={reduce ? { opacity: 0 } : textIn} animate={shown} exit={reduce ? ({ opacity: 0, transition: { duration: motionTokens.reduced.duration } }) : textOut} transition={enter}>{label}</MotionSwap></AnimatePresence></span> : <span />}
      {showValue ? <span className={styles.value}>
        {/* Completion lands as the fill arrives: a check settles in beside the final count. */}
        <AnimatePresence initial={false}>{complete && <MotionSwap key="done" className={styles.done} initial={reduce ? { opacity: 0 } : iconIn} animate={shown} exit={reduce ? ({ opacity: 0, transition: { duration: motionTokens.reduced.duration } }) : { ...iconIn, transition: exitFast }} transition={reduce ? enter : { ...motionTokens.spring.snappy, delay: motionTokens.sequence.settle }}><Check aria-hidden="true" /></MotionSwap>}</AnimatePresence>
        <motion.span className={styles.count}>{counted}</motion.span>
      </span> : null}
    </div> : null}
    <div className={styles.track} aria-hidden="true"><motion.span className={styles.fill} style={{ x }} /></div>
  </div>;
}

export default Progress;
