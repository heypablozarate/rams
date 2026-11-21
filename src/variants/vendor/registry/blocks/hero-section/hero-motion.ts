import { heroRuntime } from "./hero-runtime";
import { useSyncExternalStore } from "react";
import { useReducedMotion } from "@/variants/use-motion-preference";
import type { Transition, Variants } from "motion/react";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";

export type Bezier = [number, number, number, number];
export const ease = {
  enter: [...motionTokens.ease.enter] as Bezier,
  standard: [...motionTokens.ease.standard] as Bezier,
  inOut: [...motionTokens.ease.inOut] as Bezier,
};

/** The entrance plays once, in reading order, with handoff included in the item budget. */
export function heroGroup(count: number, reduced = false): Variants {
  const { handoff, maxStagger } = motionTokens.sequence;
  const delayChildren = Math.min(handoff, maxStagger);
  const staggerChildren = count > 1
    ? Math.min(motionTokens.stagger.line, (maxStagger - delayChildren) / (count - 1))
    : 0;
  return {
    hidden: {},
    shown: { transition: {
      delayChildren: reduced ? motionTokens.reduced.stagger : delayChildren,
      staggerChildren: reduced ? motionTokens.reduced.stagger : staggerChildren,
    } },
  };
}
export const heroRise: Variants = {
  hidden: { opacity: 0, y: heroRuntime.entranceDistancePx, filter: `blur(${motionTokens.blur.subtle}px)` },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.roleDuration.displayReveal, ease: ease.enter } },
};
export const heroFade: Variants = { hidden: { opacity: 0, y: 0, filter: "none" }, shown: { opacity: 1, y: 0, filter: "none", transition: { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } } };

export const instant: Transition = { duration: motionTokens.reduced.duration };

const noop = () => () => {};
/**
 * Reduced motion, read only after hydration. The server cannot know the preference, so the first client render matches the
 * server's full motion markup and the reduced branch takes over on the next render, before anything has moved.
 */
export function useHeroReducedMotion() {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}
