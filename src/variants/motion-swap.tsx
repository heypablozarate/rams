"use client";

import { forwardRef, useContext, useEffect, useLayoutEffect, useRef } from "react";
import { motion, PresenceContext, useAnimationControls, usePresence, usePresenceData } from "motion/react";
import type { HTMLMotionProps, TargetAndTransition, VariantLabels } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";

type PlaybackTargets = {
  animate?: TargetAndTransition | VariantLabels;
  exit?: TargetAndTransition | VariantLabels;
};
type PlaybackProps = PlaybackTargets & Pick<HTMLMotionProps<"span">, "initial" | "custom">;
type PresenceProps<Tag extends "span" | "div" | "button" | "small" | "section" | "li"> = Omit<HTMLMotionProps<Tag>, "animate" | "exit"> & PlaybackTargets;

/** One playback owner also completes retirement; no declarative exit is forwarded. */
function usePresencePlayback({ animate: enterTarget, exit: leaveTarget, initial, custom }: PlaybackProps) {
  const reduced = useReducedMotion();
  const [present, safeToRemove] = usePresence();
  const presence = useContext(PresenceContext);
  const firstLayout = useRef(true);
  const latestCustom = usePresenceData() ?? custom;
  const controls = useAnimationControls();
  const target = present ? enterTarget : leaveTarget;

  useLayoutEffect(() => {
    let current = true;
    const skipEntry = firstLayout.current && (initial === false || presence?.initial === false);
    firstLayout.current = false;
    controls.stop();
    if (reduced) {
      if (target !== undefined) controls.set(target);
      controls.set({ opacity: present ? 1 : 0, x: 0, y: 0, scale: 1, rotate: 0, filter: "blur(0px)" });
    } else if (skipEntry && present) {
      if (target !== undefined) controls.set(target);
    } else if (target !== undefined) {
      void controls.start(target).then(() => { if (current && !present) safeToRemove?.(); });
    } else if (!present) {
      controls.set({ opacity: 0 });
    }
    return () => { current = false; controls.stop(); };
  }, [controls, initial, latestCustom, presence?.initial, present, reduced, safeToRemove, target]);

  useEffect(() => {
    if (!present && (reduced || target === undefined)) safeToRemove?.();
  }, [present, reduced, safeToRemove, target]);

  return { controls, present, latestCustom };
}

/** Visual text/icon copy with cancellable playback and presence. */
export const MotionSwap = forwardRef<HTMLSpanElement, PresenceProps<"span">>(function MotionSwap({
  animate, exit, transition, custom, ...props
}, ref) {
  const { controls, present, latestCustom } = usePresencePlayback({ animate, exit, initial: props.initial, custom });
  return <motion.span {...props} ref={ref} custom={latestCustom} animate={controls}
    transition={transition} aria-hidden={present ? props["aria-hidden"] : true}
    data-rams-presence={present ? "present" : "exiting"} />;
});

/** Optional inline annotation with cancellable playback and presence. */
export const MotionSmall = forwardRef<HTMLElement, PresenceProps<"small">>(function MotionSmall({
  animate, exit, custom, ...props
}, ref) {
  const { controls, present, latestCustom } = usePresencePlayback({ animate, exit, initial: props.initial, custom });
  return <motion.small {...props} ref={ref} custom={latestCustom} animate={controls}
    aria-hidden={present ? props["aria-hidden"] : true} />;
});

export const MotionRegion = forwardRef<HTMLDivElement, PresenceProps<"div">>(function MotionRegion({
  animate, exit, custom, ...props
}, ref) {
  const { controls, present, latestCustom } = usePresencePlayback({ animate, exit, initial: props.initial, custom });
  return <motion.div {...props} ref={ref} custom={latestCustom} animate={controls}
    inert={present ? props.inert : true} aria-hidden={present ? props["aria-hidden"] : true}
    data-rams-presence={present ? "present" : "exiting"} />;
});

/** List row with cancellable playback and immediate semantic retirement. */
export const MotionListItem = forwardRef<HTMLLIElement, PresenceProps<"li">>(function MotionListItem({
  animate, exit, custom, ...props
}, ref) {
  const { controls, present, latestCustom } = usePresencePlayback({ animate, exit, initial: props.initial, custom });
  return <motion.li {...props} ref={ref} custom={latestCustom} animate={controls}
    inert={present ? props.inert : true} aria-hidden={present ? props["aria-hidden"] : true}
    data-rams-presence={present ? "present" : "exiting"} />;
});

/** Section whose exit immediately releases its layout when motion is reduced. */
export const MotionSection = forwardRef<HTMLElement, PresenceProps<"section">>(function MotionSection({
  animate, exit, custom, ...props
}, ref) {
  const { controls, present, latestCustom } = usePresencePlayback({ animate, exit, initial: props.initial, custom });
  return <motion.section {...props} ref={ref} custom={latestCustom} animate={controls}
    inert={present ? props.inert : true} aria-hidden={present ? props["aria-hidden"] : true}
    data-rams-presence={present ? "present" : "exiting"} />;
});

export const MotionAction = forwardRef<HTMLButtonElement, PresenceProps<"button">>(function MotionAction({
  animate, exit, custom, ...props
}, ref) {
  const { controls, present, latestCustom } = usePresencePlayback({ animate, exit, initial: props.initial, custom });
  return <motion.button {...props} ref={ref} custom={latestCustom} animate={controls}
    inert={present ? props.inert : true} aria-hidden={present ? props["aria-hidden"] : true}
    data-rams-presence={present ? "present" : "exiting"} />;
});
