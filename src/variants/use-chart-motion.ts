import { useReducedMotion } from "./use-motion-preference";
import { motionTokens } from "./motion-tokens";
/** Recharts supports named easing rather than cubic-bezier tuples. */
export function useChartMotion() {
  const reduced = Boolean(useReducedMotion());
  return {
    isAnimationActive: !reduced,
    animationDuration: reduced ? motionTokens.reduced.duration : motionTokens.duration.data * 1000,
    animationEasing: motionTokens.keyframes.nativeChart.easing,
  };
}
