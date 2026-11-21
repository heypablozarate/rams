"use client";
import "./motion-fields.css";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { AnimatePresence, animate, motion, useAnimationControls, useIsPresent, useMotionValue, usePresence, type AnimationPlaybackControls, type HTMLMotionProps, type MotionProps, type TargetAndTransition, type Transition } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import { CircleCheck as Check, Info as InfoCircle, TriangleAlert as WarningTriangle, CircleAlert as XmarkCircle, X } from "lucide-react";
import { motionTokens } from "./motion-tokens";
import styles from "./motion-alert.module.css";
import { Alert as RamsAlert, AlertTitle as RamsAlertTitle, AlertDescription as RamsAlertDescription } from "./alert";

const MotionAlertDescription = motion.create(RamsAlertDescription);

export type AlertTone = "info" | "success" | "warning" | "danger";
export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
  title: string;
  children?: ReactNode;
  /** Controls presence. Hiding the alert collapses its height and fades it out. */
  open?: boolean;
  /** Shows a dismiss button. An uncontrolled alert collapses first, then calls this. */
  onDismiss?: () => void;
}
type AlertBoxProps = Omit<AlertProps, "open"> & { reduce: boolean | null; animateIcon?: boolean };

const icons = { info: InfoCircle, success: Check, warning: WarningTriangle, danger: XmarkCircle };
const exitFast: Transition = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };
const textIn: TargetAndTransition = { opacity: 0, y: `${motionTokens.keyframes.statusSwap.textOffsetEm}em`, filter: `blur(${motionTokens.blur.soft}px)` };
const textOut: TargetAndTransition = { opacity: 0, y: `-${motionTokens.keyframes.statusSwap.textOffsetEm}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: exitFast };
const iconIn: TargetAndTransition = { opacity: 0, scale: motionTokens.keyframes.statusSwap.iconEnterScale, filter: `blur(${motionTokens.blur.subtle}px)` };
const shown: TargetAndTransition = { opacity: 1, y: "0em", scale: 1, filter: "blur(0px)" };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionTokens.duration.instant } };

/** Outgoing copies are hidden from assistive tech while they fade, so the live region reads only the current text. */
function Swap(props: HTMLMotionProps<"span">) {
  const present = useIsPresent();
  return <motion.span {...props} aria-hidden={present ? props["aria-hidden"] : true} />;
}

/** Follows its content height. After `morphKey` changes, the height springs from the old size to the new one and then returns to auto, so passive reflows (a resize, a font swap) follow instantly. It clips only while moving, so focus rings stay visible at rest. */
function HeightFrame({ className, reduce, morphKey, children }: { className?: string; reduce: boolean | null; morphKey: string; children: ReactNode }) {
  const frame = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const height = useMotionValue<number | "auto">("auto");
  const changedAt = useRef(0);
  useLayoutEffect(() => { changedAt.current = performance.now(); }, [morphKey]);
  useEffect(() => {
    const node = content.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let last: number | undefined;
    let controls: AnimationPlaybackControls | undefined;
    const settle = () => { height.jump("auto"); if (frame.current) Object.assign(frame.current.style, { overflow: "", height: "auto" }); };
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight;
      const current = height.get();
      const from = typeof current === "number" ? current : last;
      last = next;
      controls?.stop();
      if (reduce || from === undefined || from === next || performance.now() - changedAt.current > 120) return settle();
      // Pin the old height before this frame paints, then spring to the new one.
      if (frame.current) Object.assign(frame.current.style, { overflow: "hidden", height: `${from}px` });
      controls = animate(height, [from, next], { ...motionTokens.spring.smooth, onComplete: settle });
    });
    observer.observe(node);
    return () => { observer.disconnect(); controls?.stop(); };
  }, [height, reduce]);
  return <motion.div ref={frame} className={className} style={{ height }}>
    <div ref={content} className={styles.content}>{children}</div>
  </motion.div>;
}

function AlertBox({ tone = "info", title, children, className, reduce, onDismiss, animateIcon = false, ...props }: AlertBoxProps) {
  const Icon = icons[tone];
  const text = typeof children === "string" || typeof children === "number" ? String(children) : null;
  const hasDetails = children !== undefined && children !== null && children !== false && children !== "";
  const enter: Transition = reduce ? { duration: motionTokens.reduced.duration } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] };
  const swap: MotionProps = { initial: reduce ? { opacity: 0 } : textIn, animate: shown, exit: reduce ? ({ opacity: 0, transition: { duration: motionTokens.reduced.duration } }) : textOut, transition: enter };
  return <RamsAlert {...props} variant={tone === "danger" ? "destructive" : "default"} className={[styles.alert, styles[tone], className].filter(Boolean).join(" ")} role={tone === "danger" ? "alert" : "status"}>
    {/* A new tone morphs its icon in place; a newly shown alert gives the icon a small settle. */}
    <motion.span className={styles.icon} initial={animateIcon && !reduce ? iconIn : false} animate={shown} transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : motionTokens.spring.snappy}>
      <AnimatePresence mode="popLayout" initial={false}><Swap key={tone} className={styles.glyph} initial={reduce ? { opacity: 0 } : iconIn} animate={shown} exit={reduce ? ({ opacity: 0, transition: { duration: motionTokens.reduced.duration } }) : { ...iconIn, transition: exitFast }} transition={reduce ? enter : motionTokens.spring.snappy}><Icon aria-hidden="true"/></Swap></AnimatePresence>
    </motion.span>
    {/* The copy column follows its content height, so longer or shorter messages never snap the alert. */}
    <HeightFrame className={styles.copy} reduce={reduce} morphKey={`${title}\n${hasDetails}\n${text ?? ""}`}>
      <RamsAlertTitle className={styles.title}><AnimatePresence mode="popLayout" initial={false}><Swap key={title} className={styles.line} {...swap}>{title}</Swap></AnimatePresence></RamsAlertTitle>
      <AnimatePresence mode="popLayout" initial={false}>{hasDetails && <MotionAlertDescription key="details" className={styles.description} {...swap}>
        {text === null ? children : <AnimatePresence mode="popLayout" initial={false}><Swap key={text} className={styles.line} {...swap}>{text}</Swap></AnimatePresence>}
      </MotionAlertDescription>}</AnimatePresence>
    </HeightFrame>
    {onDismiss && <button type="button" className={styles.dismiss} aria-label={`Dismiss: ${title}`} onClick={onDismiss}><X aria-hidden="true"/></button>}
  </RamsAlert>;
}

const presenceEnter: TargetAndTransition = {
  height: "auto", opacity: 1,
  transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } },
};
const presenceExit: TargetAndTransition = {
  height: 0, opacity: 0,
  transition: { height: motionTokens.spring.smooth, opacity: exitFast },
};

// The retained child owns playback and reads live preferences after its parent stops rendering it.
function AlertPresence(props: Omit<AlertBoxProps, "reduce">) {
  const reduce = useReducedMotion();
  const [present, safeToRemove] = usePresence();
  const controls = useAnimationControls();
  const shell = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const node = shell.current;
    if (!node) return;
    controls.stop();
    if (reduce) {
      controls.set(present ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 });
      node.style.overflow = "";
      return;
    }
    let current = true;
    node.style.overflow = "hidden";
    void controls.start(present ? presenceEnter : presenceExit).then(() => {
      if (!current) return;
      node.style.overflow = "";
      if (!present) safeToRemove?.();
    });
    return () => { current = false; controls.stop(); };
  }, [controls, present, reduce, safeToRemove]);

  // Register the retained child in AnimatePresence before completing an immediate exit.
  useEffect(() => { if (reduce && !present) safeToRemove?.(); }, [present, reduce, safeToRemove]);
  return <motion.div ref={shell} className={styles.presence} initial={reduce ? false : { height: 0, opacity: 0 }} animate={controls}
    inert={!present} aria-hidden={!present || undefined}>
    <AlertBox {...props} reduce={reduce} animateIcon/>
  </motion.div>;
}

export function Alert({ open, onDismiss, ...props }: AlertProps) {
  const reduce = useReducedMotion();
  const [dismissed, setDismissed] = useState(false);
  if (open === undefined && !onDismiss) return <AlertBox {...props} reduce={reduce}/>;
  const isOpen = open ?? !dismissed;
  const dismiss = onDismiss && (() => open === undefined ? setDismissed(true) : onDismiss());
  return <AnimatePresence initial={false} onExitComplete={() => { if (open === undefined) onDismiss?.(); }}>
    {isOpen && <AlertPresence key="alert" {...props} onDismiss={dismiss}/>}
  </AnimatePresence>;
}

export default Alert;
