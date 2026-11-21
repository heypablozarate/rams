"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { MotionSwap } from "@/variants/motion-swap";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import styles from "./stepper.module.css";

export type StepperOrientation = "horizontal" | "vertical";
export type StepperStatus = "complete" | "current" | "upcoming" | "error";

export interface StepperStep {
  /** Stable key, so each step keeps its own motion when the list changes. */
  id: string;
  label: string;
  /** A short hint under the label. */
  description?: string;
  /** Marks the step as failed: the marker morphs into an alert and this message replaces the description. */
  error?: string;
}

/**
 * A steps indicator for onboarding, checkout, and setup flows. Place it above (horizontal) or beside (vertical) the step
 * content and drive it with `current`; set `current` to `steps.length` once every step is done. Pass `onStepSelect` to let
 * people return to completed steps by click or keyboard. For a multi-step form that owns its own content, use MultiStepForm.
 */
export interface StepperProps {
  steps: StepperStep[];
  /** Index of the step in progress. `steps.length` marks the whole flow complete. */
  current: number;
  orientation?: StepperOrientation;
  /** Called with the index of a completed step when it is chosen. Without it the stepper is a read-only indicator. */
  onStepSelect?: (index: number) => void;
  /** `current` shows only the active step's description, for tight spaces. Errors always show. */
  details?: "all" | "current";
  /** Markers only; labels stay available to assistive tech. Horizontal steppers switch to this below 30rem on their own
   *  and show the current step's label underneath. The compact marker row scrolls when its targets need more space. */
  compact?: boolean;
  /** Accessible name for the stepper. */
  label?: string;
  /** Announced, and shown in the compact caption, once every step is complete. */
  completeLabel?: string;
  className?: string;
}

type GlyphKind = "number" | "check" | "error";

const stepperMotion = motionTokens.keyframes.stepper;
const textTravel = stepperMotion.textTravelEm;
const blur = (radius: number) => `blur(${radius}px)`;
const leave = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } as const;
const settle = { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } as const;
const textFrom = { opacity: 0, y: `${textTravel}em`, filter: blur(motionTokens.blur.soft) };
const textRest = { opacity: 1, y: 0, filter: blur(0) };
const textGone = { opacity: 0, y: `${-textTravel}em`, filter: blur(motionTokens.blur.subtle) };
const glyphFrom = { opacity: 0, scale: stepperMotion.glyphEnterScale, filter: blur(motionTokens.blur.subtle) };
const glyphRest = { opacity: 1, scale: 1, filter: blur(0) };

/** Reserve the label's measure so a short horizontal step does not move its siblings. */
function SwapText({ text, className, reduced, reserve = [] }: { text?: string; className?: string; reduced: boolean; reserve?: (string | undefined)[] }) {
  const innerClass = [styles.slotInner, reserve.length ? styles.slotReserved : ""].filter(Boolean).join(" ");
  const reserved = [...new Set(reserve.filter((candidate): candidate is string => Boolean(candidate)))].map(candidate =>
    <span key={candidate} aria-hidden="true" className={[className, styles.reserve].filter(Boolean).join(" ")}>{candidate}</span>);
  if (reduced) return <span className={styles.slot}><span className={innerClass}>
    {reserved}{text ? <span className={className}>{text}</span> : null}
  </span></span>;
  return <AnimatedText text={text} className={className} innerClass={innerClass} reserved={reserved} />;
}

/** Ease a message-driven height change. Unrelated resizes follow the measured box immediately. */
function AnimatedText({ text, className, innerClass, reserved }: { text?: string; className?: string; innerClass: string; reserved: ReactNode }) {
  const inner = useRef<HTMLSpanElement>(null);
  const armedUntil = useRef(0);
  const height = useMotionValue<number | "auto">("auto");
  // Keep enough time for ResizeObserver to attribute a changed box to the text commit.
  useLayoutEffect(() => { armedUntil.current = performance.now() + motionTokens.layoutMeasurement.contentChangeWindowMs; }, [text]);
  useEffect(() => {
    const node = inner.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let measured = false;
    const observer = new ResizeObserver(() => {
      const next = node.offsetHeight;
      if (!measured || performance.now() > armedUntil.current) { measured = true; height.jump(next); return; }
      animate(height, next, motionTokens.spring.smooth);
    });
    observer.observe(node);
    return () => { observer.disconnect(); height.stop(); };
  }, [height]);
  return <motion.span className={styles.slot} style={{ height }}>
    <span ref={inner} className={innerClass}>
      {reserved}
      <AnimatePresence mode="popLayout" initial={false}>
        {text ? <MotionSwap key={`${className}:${text}`} className={className} initial={textFrom}
          animate={textRest} exit={{ ...textGone, transition: leave }} transition={settle}>{text}</MotionSwap> : null}
      </AnimatePresence>
    </span>
  </motion.span>;
}

/** The number, check, and alert share one spot. Reduced glyphs render at their final shape. */
function Glyph({ kind, number, delay, reduced }: { kind: GlyphKind; number: number; delay: number; reduced: boolean }) {
  const pop = { scale: { ...motionTokens.spring.snappy, delay }, opacity: { duration: motionTokens.duration.fast, delay }, filter: { duration: motionTokens.duration.fast, delay } };
  const exit = { ...glyphFrom, transition: leave };
  if (kind === "number") return reduced
    ? <span className={styles.glyph}>{number}</span>
    : <motion.span className={styles.glyph} initial={glyphFrom} animate={glyphRest} exit={exit} transition={pop}>{number}</motion.span>;

  const path = kind === "check" ? "M5.5 12.5l4.25 4.25L18.5 8" : "M12 6.75v6.5";
  const icon = { className: `${styles.glyph} ${styles.icon}`, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "var(--rams-detail-stepper-glyph-stroke)" } as const;
  const dot = { cx: 12, cy: 17.4, r: 1.4, fill: "currentColor", stroke: "none" } as const;
  if (reduced) return <svg {...icon}><path d={path} />{kind === "error" ? <circle {...dot} /> : null}</svg>;

  const boundedStart = (offset: number) => Math.min(motionTokens.sequence.maxStagger, delay + offset);
  const draw = { duration: motionTokens.duration.standard, ease: motionTokens.ease.enter, delay: boundedStart(motionTokens.stagger.word) };
  return <motion.svg {...icon} initial={glyphFrom} animate={glyphRest} exit={exit} transition={pop}>
    <motion.path d={path} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={draw} />
    {kind === "error" ? <motion.circle {...dot} initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ ...motionTokens.spring.snappy, delay: boundedStart(motionTokens.sequence.handoff) }} /> : null}
  </motion.svg>;
}

/** The ring grows out from behind the disc after progress reaches the new step. */
function Marker({ number, kind, current, glyphDelay, ringDelay, reduced }: { number: number; kind: GlyphKind; current: boolean; glyphDelay: number; ringDelay: number; reduced: boolean }) {
  return <span className={styles.marker} aria-hidden="true">
    {reduced ? current && <span className={styles.ring} /> : <AnimatePresence initial={false}>
      {current ? <motion.span key="ring" className={styles.ring} initial={{ opacity: 0, scale: stepperMotion.ringEnterScale }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: stepperMotion.ringEnterScale, transition: leave }}
        transition={{ scale: { ...motionTokens.spring.snappy, delay: ringDelay }, opacity: { duration: motionTokens.duration.fast, delay: ringDelay } }} /> : null}
    </AnimatePresence>}
    <span className={styles.disc}>
      {reduced ? <Glyph kind={kind} number={number} delay={0} reduced /> :
        <AnimatePresence initial={false}><Glyph key={kind} kind={kind} number={number} delay={glyphDelay} reduced={false} /></AnimatePresence>}
    </span>
  </span>;
}

const statusText: Record<StepperStatus, string> = { complete: "Completed", current: "", upcoming: "Not started", error: "Error" };

export function Stepper({ steps, current, orientation = "horizontal", onStepSelect, details = "all", compact = false, label = "Progress", completeLabel = "All steps complete", className }: StepperProps) {
  const reduced = useReducedMotion() ?? false;
  const count = steps.length;
  const active = Math.min(Math.max(Math.round(current), 0), count);
  // Remember where progress came from, so a jump across several steps fills or drains its connectors one after another.
  const [travel, setTravel] = useState({ to: active, from: active });
  if (travel.to !== active) setTravel({ to: active, from: travel.to });
  const from = travel.from;
  const hops = Math.max(0, Math.abs(active - from) - 1);
  const { maxStagger, settle: ringHandoff, handoff } = motionTokens.sequence;
  const glyphHandoff = Math.min(maxStagger, Math.max(handoff, motionTokens.stagger.word));
  const gap = Math.min(motionTokens.stagger.line, (maxStagger - glyphHandoff) / Math.max(1, hops));
  const delayAt = (index: number) => {
    if (reduced) return 0;
    if (active > from) return index >= from && index < active ? (index - from) * gap : 0;
    return index >= active && index < from ? (from - 1 - index) * gap : 0;
  };
  const ringDelay = reduced ? 0 : Math.min(maxStagger, hops * gap + ringHandoff);
  const interactive = Boolean(onStepSelect);
  const vertical = orientation === "vertical";
  const done = active >= count;
  const now = done ? undefined : steps[active];
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  useLayoutEffect(() => {
    const viewport = viewportRef.current, list = listRef.current;
    if (!viewport || !list) return;
    const update = () => setCanScroll(viewport.scrollWidth > viewport.clientWidth);
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    observer.observe(list);
    return () => observer.disconnect();
  }, [vertical, count, compact]);

  const horizontalStyle = {
    gridTemplateColumns: count > 1 ? `repeat(${count - 1}, minmax(0, 1fr)) auto` : "auto",
  };
  const stepCountStyle = { "--rams-detail-stepper-count": Math.max(1, count) } as CSSProperties;

  /** Arrow keys move between the steps you can reach; Home and End jump to the first and the current one. */
  function onKeyDown(event: KeyboardEvent<HTMLOListElement>) {
    const rtl = !vertical && getComputedStyle(event.currentTarget).direction === "rtl";
    const back = ["ArrowUp", rtl ? "ArrowRight" : "ArrowLeft"], ahead = ["ArrowDown", rtl ? "ArrowLeft" : "ArrowRight"];
    if (![...back, ...ahead, "Home", "End"].includes(event.key)) return;
    const targets = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-reachable]"));
    const at = targets.indexOf(event.target as HTMLButtonElement);
    if (at < 0) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? targets.length - 1 : back.includes(event.key) ? Math.max(0, at - 1) : Math.min(targets.length - 1, at + 1);
    targets[next]?.focus();
  }

  const Root = interactive ? "nav" : "div";
  const classes = [styles.root, vertical ? styles.vertical : styles.horizontal, compact ? styles.compact : "", className].filter(Boolean).join(" ");
  const list = <ol ref={listRef} className={styles.list} style={vertical ? undefined : horizontalStyle} onKeyDown={interactive ? onKeyDown : undefined}>
      {steps.map((step, index) => {
        const isCurrent = index === active;
        const status: StepperStatus = step.error ? "error" : index < active ? "complete" : isCurrent ? "current" : "upcoming";
        const clickable = interactive && index < active;
        const detail = step.error ?? (details === "all" || isCurrent ? step.description : undefined);
        const kind: GlyphKind = step.error ? "error" : index < active ? "check" : "number";
        const content: ReactNode = <>
          <Marker number={index + 1} kind={kind} current={isCurrent} glyphDelay={delayAt(index)} ringDelay={ringDelay} reduced={reduced} />
          <span className={styles.text}>
            <span className={styles.label}>{step.label}</span>
            {statusText[status] ? <span className={styles.srOnly}>, {statusText[status]}</span> : null}
            <SwapText text={detail} className={step.error ? styles.error : styles.description} reduced={reduced} reserve={vertical ? undefined : [step.description, step.error]} />
          </span>
        </>;
        return <li key={step.id} className={styles.item} data-status={status}>
          {index < count - 1 ? <span className={styles.connector} aria-hidden="true">
            {reduced ? <span className={styles.fill} style={{ transform: vertical ? `scaleY(${index < active ? 1 : 0})` : `scaleX(${index < active ? 1 : 0})` }} /> :
              <motion.span key={orientation} className={styles.fill} initial={false}
                animate={vertical ? { scaleY: index < active ? 1 : 0 } : { scaleX: index < active ? 1 : 0 }}
                transition={{ ...motionTokens.spring.smooth, delay: delayAt(index) }} />}
          </span> : null}
          {interactive
            ? <button type="button" className={styles.head} data-clickable={clickable || undefined} data-reachable={index <= active || undefined} aria-current={isCurrent ? "step" : undefined} aria-disabled={clickable ? undefined : true} tabIndex={clickable ? undefined : -1} onClick={clickable ? () => onStepSelect?.(index) : undefined}>{content}</button>
            : <span className={styles.head} aria-current={isCurrent ? "step" : undefined}>{content}</span>}
        </li>;
      })}
    </ol>;
  return <Root className={classes} aria-label={label} role={interactive ? undefined : "group"}>
    {vertical ? list : <div ref={viewportRef} className={styles.viewport} style={stepCountStyle}
      role={canScroll ? "group" : undefined} aria-label={canScroll ? label : undefined}
      tabIndex={canScroll ? 0 : undefined}>{list}</div>}
    {vertical ? null : <span className={styles.caption} aria-hidden="true">
      {/* Measure complete states together, rather than combining unrelated longest lines. */}
      {steps.map(step => <span key={step.id} className={`${styles.captionCopy} ${styles.reserve}`}>
        <span className={styles.captionLabel}>{step.label}</span>
        {step.error ?? step.description ? <span className={step.error ? styles.error : styles.description}>{step.error ?? step.description}</span> : null}
      </span>)}
      <span className={`${styles.captionCopy} ${styles.reserve}`}><span className={styles.captionLabel}>{completeLabel}</span></span>
      <span className={styles.captionCopy}>
        <SwapText text={now?.label ?? completeLabel} className={styles.captionLabel} reduced={reduced} />
        <SwapText text={now?.error ?? now?.description} className={now?.error ? styles.error : styles.description} reduced={reduced} />
      </span>
    </span>}
    <span className={styles.srOnly} aria-live="polite">{now ? `Step ${active + 1} of ${count}: ${now.label}` : completeLabel}</span>
  </Root>;
}

export default Stepper;
