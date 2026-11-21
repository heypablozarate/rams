"use client";
import "./motion-fields.css";

import { isValidElement, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, type AnimationPlaybackControls, type TargetAndTransition, type Transition } from "motion/react";
import { MotionSwap as Swap } from "./motion-swap";
import { useReducedMotion } from "./use-motion-preference";
import { Folder } from "lucide-react";
import { motionTokens } from "./motion-tokens";
import { Empty as RamsEmpty, EmptyContent as RamsEmptyContent, EmptyDescription as RamsEmptyDescription, EmptyHeader as RamsEmptyHeader, EmptyMedia as RamsEmptyMedia, EmptyTitle as RamsEmptyTitle } from "./empty";
import styles from "./motion-empty-state.module.css";

export interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
  /** Optional accessible label for the state region. */
  label?: string;
}

const exitFast: Transition = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };
const textIn: TargetAndTransition = { opacity: 0, y: `${motionTokens.keyframes.statusSwap.textOffsetEm}em`, filter: `blur(${motionTokens.blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: `-${motionTokens.keyframes.statusSwap.textOffsetEm}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: exitFast };
const iconIn: TargetAndTransition = { opacity: 0, scale: motionTokens.keyframes.statusSwap.iconEnterScale, filter: `blur(${motionTokens.blur.subtle}px)` };
const shown: TargetAndTransition = { opacity: 1, y: "0em", scale: 1, filter: "blur(0px)" };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionTokens.duration.instant } };

/** A new icon component crossfades in; re-rendering the same icon stays still. */
function iconKey(icon: ReactNode) {
  if (!isValidElement(icon)) return "icon";
  const type = icon.type as string | { displayName?: string; name?: string };
  return typeof type === "string" ? type : type.displayName ?? type.name ?? "icon";
}

/** Follows its content height. After `morphKey` changes, the height springs from the old size to the new one and then returns to auto, so passive reflows (a resize, a font swap) follow instantly. It clips only while moving, so focus rings stay visible at rest. */
function HeightFrame({ reduce, morphKey, children }: { reduce: boolean | null; morphKey: string; children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const height = useMotionValue<number | "auto">("auto");
  const changedAt = useRef(0);
  const controls = useRef<AnimationPlaybackControls | undefined>(undefined);
  useLayoutEffect(() => { changedAt.current = performance.now(); }, [morphKey]);
  useLayoutEffect(() => {
    if (!reduce) return;
    controls.current?.stop();
    height.jump("auto");
    if (frame.current) Object.assign(frame.current.style, { overflow: "", height: "auto" });
  }, [height, reduce]);
  useEffect(() => {
    const node = content.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let last: number | undefined;
    const settle = () => { height.jump("auto"); if (frame.current) Object.assign(frame.current.style, { overflow: "", height: "auto" }); };
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight;
      const current = height.get();
      const from = typeof current === "number" ? current : last;
      last = next;
      controls.current?.stop();
      if (reduce || from === undefined || from === next || performance.now() - changedAt.current > 120) return settle();
      // Pin the old height before this frame paints, then spring to the new one.
      if (frame.current) Object.assign(frame.current.style, { overflow: "hidden", height: `${from}px` });
      controls.current = animate(height, [from, next], { ...motionTokens.spring.smooth, onComplete: settle });
    });
    observer.observe(node);
    return () => { observer.disconnect(); controls.current?.stop(); };
  }, [height, reduce]);
  return <motion.div ref={frame} className={styles.frame} style={{ height }}>
    <div ref={content} className={styles.copy}>{children}</div>
  </motion.div>;
}

export function EmptyState({ title, description, action, icon, className, label }: EmptyStateProps) {
  const reduce = useReducedMotion();
  const glyph = icon ?? <Folder style={{ width: "var(--rams-detail-empty-icon-size)", height: "var(--rams-detail-empty-icon-size)", strokeWidth: "var(--rams-detail-empty-icon-stroke)" }} />;
  const enter: Transition = reduce ? { duration: motionTokens.reduced.duration } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] };
  const swap = { initial: reduce ? { opacity: 0 } : textIn, animate: shown, exit: reduce ? ({ opacity: 0, transition: { duration: motionTokens.reduced.duration } }) : textOut, transition: enter };
  // The result of an action morphs in place: the icon crossfades and the copy rises in while the old copy leaves.
  return <RamsEmpty role={label ? "region" : undefined} aria-label={label} className={[styles.root, className].filter(Boolean).join(" ")}>
    <RamsEmptyHeader>
      <RamsEmptyMedia variant="icon" className={styles.icon} aria-hidden="true"><AnimatePresence mode="popLayout" initial={false}><Swap key={iconKey(glyph)} className={styles.glyph} initial={reduce ? { opacity: 0 } : iconIn} animate={shown} exit={reduce ? ({ opacity: 0, transition: { duration: motionTokens.reduced.duration } }) : { ...iconIn, transition: exitFast }} transition={reduce ? enter : motionTokens.spring.snappy}>{glyph}</Swap></AnimatePresence></RamsEmptyMedia>
      <HeightFrame reduce={reduce} morphKey={`${title}\n${description}`}>
        <RamsEmptyTitle asChild><h3><AnimatePresence mode="popLayout" initial={false}><Swap key={title} className={styles.line} {...swap}>{title}</Swap></AnimatePresence></h3></RamsEmptyTitle>
        <RamsEmptyDescription className={styles.line}><AnimatePresence mode="popLayout" initial={false}><Swap key={description} className={styles.line} {...swap}>{description}</Swap></AnimatePresence></RamsEmptyDescription>
      </HeightFrame>
    </RamsEmptyHeader>
    {action && <RamsEmptyContent className={styles.action}>{action}</RamsEmptyContent>}
  </RamsEmpty>;
}

export default EmptyState;
