"use client";
import { forwardRef, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { AnimatePresence, animate, motion, useInView, useIsPresent, useMotionValue, usePageInView, useTransform } from "motion/react";
import { useReducedMotion } from "@/variants/use-motion-preference";
import type { AnimationPlaybackControls, MotionValue } from "motion/react";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import styles from "./text-shimmer.module.css";
const subscribeHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
/** Half width of the highlight band in em, and a bell shaped falloff as [offset, strength] stops. */
const band = motionTokens.keyframes.textShimmer.bandHalfWidthEm;
const falloff = motionTokens.keyframes.textShimmer.bandFalloff;
const percent = (value: number) => `${(value * 100).toFixed(1)}%`;

/** Paints the band at sweep position `t` (0 sits left of the text, 1 right of it) over a base that is `settle` of the way to solid. */
function shimmerImage(t: number, settle: number) {
  const base = `color-mix(in oklab, var(--rams-detail-ts-highlight) ${percent(settle)}, var(--rams-detail-ts-base))`;
  const stops = falloff.map(([offset, strength]) => `color-mix(in oklab, var(--rams-detail-ts-highlight) ${percent(strength)}, ${base}) calc(${(t * 100).toFixed(2)}% + ${((2 * t - 1 + offset) * band).toFixed(3)}em)`);
  return `linear-gradient(90deg, ${base}, ${stops.join(", ")}, ${base})`;
}

/**
 * A calm light sweep across a short status line, such as "Thinking" or "Generating summary", to show that work is ongoing.
 * The band uses the current text color over a muted base. When `active` turns false the band glides off and the text settles to solid.
 * A changed label rises in place while the line springs to its new width. The component sets `aria-busy`; announce completion from your own live region.
 */
export interface TextShimmerProps {
  /** The status text. Keep it to one short line. */
  children: string;
  /** Enable the visual sweep. Reduced motion and visibility can keep it still. Defaults to true. */
  active?: boolean;
  /** Seconds for one sweep across the text. Defaults to the shared breathing duration. */
  duration?: number;
  as?: "span" | "p" | "div" | "h2" | "h3" | "h4";
  className?: string;
  id?: string;
}
const ShimmerLabel = forwardRef<HTMLSpanElement, { children: string; reduced: boolean; backgroundImage: MotionValue<string> }>(
  function ShimmerLabel({ children, reduced, backgroundImage }, ref) {
  const isPresent = useIsPresent();
  return <motion.span ref={ref} data-exiting={isPresent ? undefined : ""} className={styles.label} style={{ backgroundImage }}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: `${motionTokens.keyframes.textShimmer.labelEnterOffsetEm}em`, filter: `blur(${motionTokens.blur.soft}px)` }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: "0em", filter: "blur(0px)" }}
          exit={reduced ? { opacity: 0, transition: { duration: motionTokens.reduced.duration } } : { opacity: 0, y: `${motionTokens.keyframes.textShimmer.labelExitOffsetEm}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }}
          transition={{ duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>{children}</motion.span>;
  }
);

export function TextShimmer({ children, active = true, duration = motionTokens.roleDuration.breathing, as = "span", className, id }: TextShimmerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReduced = useReducedMotion();
  const hydrated = useSyncExternalStore(subscribeHydration, clientSnapshot, serverSnapshot);
  const reduced = Boolean(hydrated && prefersReduced);
  const inView = useInView(ref, { margin: `${motionTokens.keyframes.textShimmer.viewportMarginPx}px` });
  const pageVisible = usePageInView();
  const sweep = useMotionValue(0);
  const settle = useMotionValue(active ? 0 : 1);
  const backgroundImage = useTransform(() => shimmerImage(sweep.get(), settle.get()));
  const running = active && !reduced && inView && pageVisible;
  const restWidth = useRef(0);
  const Tag = as;

  // Loop the sweep only while work is ongoing, visible, and motion is allowed. A paused band resumes where it stopped.
  useEffect(() => {
    if (reduced) sweep.jump(0);
    if (!running) return;
    let controls: AnimationPlaybackControls | undefined;
    const pass = (delay: number) => {
      if (sweep.get() >= 1) sweep.jump(0);
      controls = animate(sweep, 1, { duration: duration * (1 - sweep.get()), delay, ease: "linear", onComplete: () => pass(duration * motionTokens.keyframes.textShimmer.interSweepDelayRatio) });
    };
    pass(sweep.get() > 0 ? 0 : motionTokens.keyframes.textShimmer.initialDelaySeconds);
    return () => controls?.stop();
  }, [running, reduced, duration, sweep]);

  // Finishing lets a band in flight glide off while the base resolves to solid, so the text never hard cuts.
  useEffect(() => {
    if (active) {
      const dim = animate(settle, 0, { duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.standard, ease: [...motionTokens.ease.standard] });
      return () => dim.stop();
    }
    const t = sweep.get();
    const glide = !reduced && t > 0 && t < 1 ? animate(sweep, 1, { duration: Math.min(motionTokens.duration.considered, duration * (1 - t) * motionTokens.keyframes.textShimmer.finishGlideRatio), ease: [...motionTokens.ease.enter] }) : undefined;
    const solid = animate(settle, 1, { duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.considered, ease: [...motionTokens.ease.standard] });
    return () => { glide?.stop(); solid.stop(); };
  }, [active, reduced, duration, sweep, settle]);

  // A new label springs the line to its width instead of resizing in one frame, so text after it never jumps.
  useLayoutEffect(() => {
    const stage = ref.current;
    if (!stage) return;
    const sizing = Boolean(stage.style.width);
    const current = stage.getBoundingClientRect().width;
    stage.style.width = "";
    const next = stage.getBoundingClientRect().width;
    const from = sizing ? current : restWidth.current;
    restWidth.current = next;
    if (reduced || !from || Math.abs(from - next) < motionTokens.keyframes.textShimmer.widthChangeTolerancePx) { delete stage.dataset.sizing; return; }
    stage.dataset.sizing = "";
    const controls = animate(stage, { width: [from, next] }, { ...motionTokens.spring.morph, onComplete: () => { stage.style.width = ""; delete stage.dataset.sizing; } });
    return () => controls.stop();
  }, [children, reduced]);

  // Keep the resting width current when fonts load or the container resizes.
  useEffect(() => {
    const stage = ref.current;
    if (!stage || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => { if (!stage.style.width) restWidth.current = stage.getBoundingClientRect().width; });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  return <Tag id={id} className={[styles.shimmer, className].filter(Boolean).join(" ")} data-state={active ? "active" : "idle"} aria-busy={active || undefined}>
    <span ref={ref} className={styles.stage}>
      <AnimatePresence mode="popLayout" initial={false}>
        <ShimmerLabel key={children} reduced={reduced} backgroundImage={backgroundImage}>{children}</ShimmerLabel>
      </AnimatePresence>
    </span>
  </Tag>;
}

export default TextShimmer;
