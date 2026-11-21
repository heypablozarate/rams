import { motionTokens } from "./motion-tokens";
import type { Transition } from "motion/react";
/** Portable semantic transitions. Reduced mode is explicit for imperative animations too. */
export function motionTransition(role: keyof typeof motionTokens.roles, reduced = false): Transition {
  if (reduced) return { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger };
  const spec = motionTokens.roles[role];
  if ("spring" in spec) return { ...motionTokens.spring[spec.spring] };
  return { duration: motionTokens.duration[spec.duration], ease: spec.ease === "linear" ? "linear" : [...motionTokens.ease[spec.ease]] };
}
export function motionDelay(index: number, reduced = false) {
  return reduced ? 0 : Math.min(Math.max(index, 0) * motionTokens.stagger.item, motionTokens.sequence.maxStagger);
}
/** A preference subscription for non-React consumers; reacts to changes during a transition. */
export function observeReducedMotion(onChange: (reduced: boolean) => void, view: Window = window) {
  const query = view.matchMedia("(prefers-reduced-motion: reduce)");
  const update = () => onChange(query.matches);
  update(); query.addEventListener("change", update);
  return () => query.removeEventListener("change", update);
}
/** Own imperative animations per interaction; old completion callbacks cannot commit stale state. */
export function createMotionTransaction() {
  let generation = 0;
  let stops: (() => void)[] = [];
  return {
    begin() { generation++; for (const stop of stops) stop(); stops = []; return generation; },
    track(stop: () => void) { stops.push(stop); },
    current(id: number) { return id === generation; },
    cancel() { generation++; for (const stop of stops) stop(); stops = []; },
  };
}
