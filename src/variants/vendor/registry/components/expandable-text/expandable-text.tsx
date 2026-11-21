"use client";

import { Button } from "@/primitives/button";
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, FocusEvent, HTMLAttributes, ReactNode } from "react";
import { ChevronDown } from "rams-icons";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import type { AnimationPlaybackControls } from "motion/react";
import styles from "./expandable-text.module.css";

/**
 * Long text clamped to a few lines with a soft fade over the last one. Read more opens it to its full height with a calm ease out,
 * and Show less closes it again, bringing the start of the text back into view when it had scrolled away. The toggle only appears when the text
 * really overflows its lines, and stays correct as the width or font changes.
 */
export interface ExpandableTextProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** The text. Plain strings, paragraphs, and inline links all work; the whole text stays available to screen readers while clamped. */
  children: ReactNode;
  /** How many lines show while collapsed. */
  lines?: number;
  /** Controlled open state. */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Toggle label while collapsed. */
  moreLabel?: string;
  /** Toggle label while open. */
  lessLabel?: string;
}

const noop = () => () => {};
/** A soft ease out: it answers the click at once, then spends most of its time settling, so a long paragraph glides open instead of snapping. */
const motionSpec = motionTokens.keyframes.expandableText;
/** The duration grows with distance and is bounded independently for opening and closing. */
const openDuration = (distance: number) => motionSpec.openBaseSeconds + Math.min(distance / motionSpec.openPixelsPerSecond, motionSpec.openMaxExtraSeconds);
const closeDuration = (distance: number) => motionSpec.closeBaseSeconds + Math.min(distance / motionSpec.closePixelsPerSecond, motionSpec.closeMaxExtraSeconds);

/** Reduced motion only counts after hydration, so the server and the first client render agree. */
function useReduced() {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const reduced = useReducedMotion() ?? false;
  return hydrated && reduced;
}

export function ExpandableText({ children, lines, expanded: expandedProp, defaultExpanded = false, onExpandedChange, moreLabel = "Read more", lessLabel = "Show less", className, style, ...props }: ExpandableTextProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultExpanded);
  const expanded = expandedProp ?? uncontrolled;
  // Long text is the common case, so the server renders the toggle and the first measurement removes it when the text fits.
  const [overflowing, setOverflowing] = useState(true);
  const [animating, setAnimating] = useState(false);
  // The state the DOM has settled in. The clamp only changes once a move ends, so the height can be read before anything lifts.
  const [settled, setSettled] = useState(expanded);
  const reduced = useReduced();
  const contentId = useId();
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLSpanElement>(null);
  const hiddenFocusTarget = useRef<HTMLElement | null>(null);
  const clampHeight = useRef(0);
  const range = useRef({ from: 0, to: 0 });
  const running = useRef<AnimationPlaybackControls | null>(null);
  const lastExpanded = useRef(expanded);
  /** 0 is clamped, 1 is fully open. Height, the fade, and the chevron all follow this one value, so they always move in step. */
  const progress = useMotionValue(expanded ? 1 : 0);
  const height = useMotionValue<number | "auto">("auto");
  const rotate = useTransform(progress, [0, 1], [0, motionTokens.keyframes.disclosure.reverseDeg]);
  // The fade eases away as the text opens and only returns as it nears the clamp again. While the height moves, newly revealed lines
  // rise through the soft edge instead of being uncovered by a hard line.
  const maskImage = useTransform(progress, value => {
    const fade = Math.pow(1 - Math.min(Math.max(value, 0), 1), motionSpec.fadeExponent);
    return fade <= motionSpec.fadeStopThreshold ? "none" : `linear-gradient(to bottom, #000 calc(100% - var(--rams-detail-expandable-text-mask-depth)), rgb(0 0 0 / ${(1 - fade * motionSpec.fadeStrength).toFixed(3)}) 100%)`;
  });

  useEffect(() => progress.on("change", value => {
    if (!running.current) return;
    const { from, to } = range.current;
    height.set(from + (to - from) * value);
  }), [progress, height]);

  // The probe is exactly `lines` lines tall in the text's own line height, so fonts, sizes, and wrapping never need to be computed by hand.
  useLayoutEffect(() => {
    const probeNode = probe.current, innerNode = inner.current;
    if (!probeNode || !innerNode) return;
    const measure = () => {
      clampHeight.current = probeNode.getBoundingClientRect().height;
      setOverflowing(innerNode.getBoundingClientRect().height > clampHeight.current + motionSpec.overflowTolerancePx);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(probeNode);
    observer.observe(innerNode);
    return () => observer.disconnect();
  }, [lines]);

  // Animate whenever the open state changes, from the toggle or a controlled prop. A change mid-flight carries on from the current height.
  useLayoutEffect(() => {
    if (lastExpanded.current === expanded && !reduced) return;
    lastExpanded.current = expanded;
    const node = content.current, innerNode = inner.current;
    running.current?.stop();
    running.current = null;
    if (expanded && hiddenFocusTarget.current && node?.scrollTop) node.scrollTop = 0;
    if (!node || !innerNode || reduced) { progress.jump(expanded ? 1 : 0); height.set("auto"); setAnimating(false); setSettled(expanded); return; }
    const full = innerNode.getBoundingClientRect().height;
    const clamp = Math.min(clampHeight.current, full);
    const current = node.getBoundingClientRect().height;
    // Progress maps the clamp to 0 and the full height to 1; resync it to the real height in case the text reflowed since the last move.
    range.current = { from: clamp, to: full };
    const span = Math.max(full - clamp, 1);
    progress.jump(Math.min(Math.max((current - clamp) / span, 0), 1));
    // Pin the current height before the clamp lifts, so nothing jumps for a frame.
    node.style.height = `${current}px`;
    height.set(current);
    setAnimating(true);
    const target = expanded ? 1 : 0;
    const distance = Math.abs(target - progress.get()) * span;
    running.current = animate(progress, target, {
      duration: expanded ? openDuration(distance) : closeDuration(distance),
      ease: [...motionSpec.ease],
      onComplete: () => { running.current = null; height.set("auto"); setAnimating(false); setSettled(expanded); },
    });
  }, [expanded, reduced, progress, height]);

  useLayoutEffect(() => {
    if (!expanded || !settled || animating) return;
    const target = hiddenFocusTarget.current;
    hiddenFocusTarget.current = null;
    if (!target || target !== document.activeElement) return;
    const box = target.getBoundingClientRect();
    if (box.top < 0 || box.bottom > document.documentElement.clientHeight) {
      target.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
    }
  }, [expanded, settled, animating]);

  useEffect(() => () => running.current?.stop(), []);

  const setExpanded = (next: boolean) => {
    if (next === expanded) return;
    // Closing from far down the page would leave the reader below the text; bring its start back into view as it closes.
    const node = root.current;
    if (!next && node && node.getBoundingClientRect().top < 0) node.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
    if (expandedProp === undefined) setUncontrolled(next);
    onExpandedChange?.(next);
  };

  // A link or button hidden below the clamp opens the text when it receives keyboard focus.
  const onFocusCapture = (event: FocusEvent<HTMLDivElement>) => {
    props.onFocusCapture?.(event);
    const viewport = content.current;
    const target = event.target;
    if (expanded || !overflowing || !viewport || target === viewport || !viewport.contains(target)) return;
    const box = viewport.getBoundingClientRect();
    // The browser can scroll an overflow:hidden viewport before it dispatches focus.
    if (target.getBoundingClientRect().bottom + viewport.scrollTop > box.bottom + motionSpec.overflowTolerancePx) {
      hiddenFocusTarget.current = target;
      setExpanded(true);
    }
  };

  const clamped = !settled && !animating && overflowing;
  const masked = overflowing && (!settled || animating);
  return <div {...props} ref={root} onFocusCapture={onFocusCapture} className={[styles.root, className].filter(Boolean).join(" ")} style={{ ...style, "--rams-detail-expandable-text-lines": lines } as CSSProperties}>
    <motion.div
      ref={content}
      id={contentId}
      className={styles.content}
      data-clamped={clamped ? "" : undefined}
      data-expanded={expanded ? "" : undefined}
      data-overflowing={overflowing ? "" : undefined}
      style={{ height, WebkitMaskImage: masked ? maskImage : "none", maskImage: masked ? maskImage : "none" }}
    >
      <span ref={probe} className={styles.probe} aria-hidden="true" />
      <div ref={inner} className={styles.inner}>{children}</div>
    </motion.div>
    {overflowing && <Button variant="ghost" type="button" className={styles.toggle} aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded(!expanded)}>
      {/* Both labels share one grid cell, so the button keeps the wider width and the chevron never jumps as they crossfade. */}
      <span className={styles.labels}>
        <span className={styles.label} data-active={!expanded || undefined} aria-hidden={expanded || undefined}>{moreLabel}</span>
        <span className={styles.label} data-active={expanded || undefined} aria-hidden={!expanded || undefined}>{lessLabel}</span>
      </span>
      <motion.span className={styles.icon} aria-hidden="true" style={{ rotate }}>
        <ChevronDown width="var(--rams-detail-motion-button-glyph-size)" height="var(--rams-detail-motion-button-glyph-size)" />
      </motion.span>
    </Button>}
  </div>;
}

export default ExpandableText;
