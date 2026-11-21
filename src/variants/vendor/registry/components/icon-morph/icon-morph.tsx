"use client";

import { useId, useState, useSyncExternalStore } from "react";
import type { ReactNode, SVGProps } from "react";
import { motion } from "motion/react";
import { motionTransition } from "@/variants/motion-policy";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import styles from "./icon-morph.module.css";

export type IconMorphName = "menu" | "play" | "plus" | "copy" | "theme" | "chevron" | "bell" | "heart";

export interface IconMorphIconProps extends Omit<SVGProps<SVGSVGElement>, "ref" | "children"> {
  /**
   * The second state of the icon. menu: close, play: pause, plus: check, copy: check,
   * theme: moon, chevron: turned, bell: notifications on, heart: liked.
   */
  state?: boolean;
  /** Rendered size in px. When omitted, uses the Icon Morph default size role. */
  size?: number;
  /** Frame stroke in the 24-unit grid. When omitted, uses the Icon Morph default stroke role. Play/pause paths use their own optical stroke. */
  strokeWidth?: number;
}

/**
 * A family of icons that morph between two states instead of swapping. Lines rotate and slide into place, shapes interpolate
 * their outlines, and a few carry a small moment of their own: the bell rings when it turns on and the heart bursts when liked.
 * Shape changes follow the current state. Bell and heart add a timed effect when activated. Place these decorative icons
 * inside a button with an accessible name and `aria-pressed`.
 */
export interface IconMorphProps extends IconMorphIconProps {
  name: IconMorphName;
}

const iconMotion = motionTokens.keyframes.iconMorph;
const stateTransition = motionTransition("selection");
const feedbackTransition = motionTransition("feedback");
const immediate = motionTransition("feedback", true);
const subscribe = () => () => {};
function useReducedFlag() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}
function useIds() {
  return useId().replace(/[^a-zA-Z0-9-]/g, "");
}
/** Keys each new one-shot effect. Reducing motion retires pending effects and skips new ones until motion is restored. */
function useTurnOns(state: boolean, reduced: boolean) {
  const [previous, setPrevious] = useState(state);
  const [count, setCount] = useState(0);
  if (previous !== state) setPrevious(state);
  if (reduced) {
    if (count !== 0) setCount(0);
  } else if (state && previous !== state) {
    setCount(value => value + 1);
  }
  return count;
}

function Frame({ size = iconMotion.defaultSizePx, strokeWidth = iconMotion.defaultStrokePx, className, children, reduced, ...rest }: IconMorphIconProps & { children: ReactNode; reduced: boolean }) {
  // A preference change retires the decorative SVG playback, never its focused button.
  return <svg key={reduced ? "reduced" : "motion"} viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
    className={[styles.icon, className].filter(Boolean).join(" ")} {...rest}>{children}</svg>;
}

/** Menu to close: the outer lines slide to the middle as they rotate into an X, and the middle line folds away. */
export function MenuIcon({ state = false, ...props }: IconMorphIconProps) {
  const reduced = useReducedFlag();
  const transition = reduced ? immediate : stateTransition;
  return <Frame {...props} reduced={reduced}>
    <motion.path d="M4 6h16" initial={false} animate={state ? { y: iconMotion.menuOuterTravel, rotate: iconMotion.menuCrossTurnDeg } : { y: 0, rotate: 0 }} transition={transition} />
    <motion.path d="M4 12h16" initial={false} animate={state ? { opacity: 0, scaleX: iconMotion.menuMiddleScale } : { opacity: 1, scaleX: 1 }}
      transition={reduced ? immediate : { ...stateTransition, opacity: feedbackTransition }} />
    <motion.path d="M4 18h16" initial={false} animate={state ? { y: -iconMotion.menuOuterTravel, rotate: -iconMotion.menuCrossTurnDeg } : { y: 0, rotate: 0 }} transition={transition} />
  </Frame>;
}

// Play is split down the middle into two quads, so each half can become one pause bar.
const PLAY = ["M7 4.5 L12 7.42 L12 16.58 L7 19.5 Z", "M12 7.42 L19.5 11.8 L19.5 12.2 L12 16.58 Z"];
const PAUSE = ["M6.5 5 L10 5 L10 19 L6.5 19 Z", "M14 5 L17.5 5 L17.5 19 L14 19 Z"];

/** Play to pause: the triangle splits into two halves that straighten into bars. */
export function PlayPauseIcon({ state = false, ...props }: IconMorphIconProps) {
  const reduced = useReducedFlag();
  return <Frame {...props} reduced={reduced}>
    {PLAY.map((d, index) => <motion.path key={index} d={d} fill="currentColor" strokeWidth={iconMotion.playStrokePx} initial={false}
      animate={{ d: state ? PAUSE[index] : d }} transition={reduced ? immediate : stateTransition} />)}
  </Frame>;
}

/** Plus to check: each bar swings its ends to become one leg of the check. */
export function PlusCheckIcon({ state = false, ...props }: IconMorphIconProps) {
  const reduced = useReducedFlag();
  const transition = reduced ? immediate : stateTransition;
  return <Frame {...props} reduced={reduced}>
    <motion.path d="M12 5 L12 19" initial={false} animate={{ d: state ? "M20 6.5 L9.5 17" : "M12 5 L12 19" }} transition={transition} />
    <motion.path d="M5 12 L19 12" initial={false} animate={{ d: state ? "M4.5 12 L9.5 17" : "M5 12 L19 12" }} transition={transition} />
  </Frame>;
}

/** The sheets tuck away as the check draws in, giving the new state immediate feedback. */
export function CopyCheckIcon({ state = false, ...props }: IconMorphIconProps) {
  const reduced = useReducedFlag();
  const transition = reduced ? immediate : { ...stateTransition, opacity: feedbackTransition };
  return <Frame {...props} reduced={reduced}>
    <motion.path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" initial={false}
      animate={state ? { x: iconMotion.copySheetTravel, y: iconMotion.copySheetTravel, opacity: 0 } : { x: 0, y: 0, opacity: 1 }} transition={transition} />
    <motion.rect x="8" y="8" width="14" height="14" rx="2" initial={false}
      animate={state ? { scale: iconMotion.copySheetScale, opacity: 0 } : { scale: 1, opacity: 1 }} transition={transition} />
    <motion.path d="M5 12.5 L9.5 17 L19 7.5" initial={false}
      animate={state ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
      transition={transition} />
  </Frame>;
}

const RAYS = Array.from({ length: 8 }, (_, index) => {
  const angle = index * Math.PI / 4, c = Math.cos(angle), s = Math.sin(angle);
  const r = (value: number) => Math.round(value * 100) / 100;
  return `M${r(12 + c * 7.5)} ${r(12 + s * 7.5)} L${r(12 + c * 10)} ${r(12 + s * 10)}`;
});

/**
 * Sun to moon: the disc grows while a shadow slides across it from the corner, carving the crescent, and the rays turn and fold in.
 * The crescent is drawn as an outline: the disc's edge outside the shadow, and the shadow's edge inside the disc.
 */
export function SunMoonIcon({ state = false, ...props }: IconMorphIconProps) {
  const reduced = useReducedFlag();
  const id = useIds();
  const transition = reduced ? immediate : stateTransition;
  const disc = { r: state ? 8.5 : 4.5 };
  const shadow = state ? { cx: 18, cy: 6, r: 6.5 } : { cx: 30, cy: -6, r: 6.5 };
  return <Frame {...props} reduced={reduced}>
    <defs>
      <mask id={`${id}-bite`} maskUnits="userSpaceOnUse" x="-8" y="-8" width="40" height="40">
        <rect x="-8" y="-8" width="40" height="40" fill="white" stroke="none" />
        <motion.circle cx={30} cy={-6} r={6.5} fill="black" stroke="none" initial={false} animate={shadow} transition={transition} />
      </mask>
      <clipPath id={`${id}-disc`}>
        <motion.circle cx={12} cy={12} r={4.5} initial={false} animate={disc} transition={transition} />
      </clipPath>
    </defs>
    <motion.circle cx={12} cy={12} r={4.5} mask={`url(#${id}-bite)`} initial={false} animate={disc} transition={transition} />
    <motion.circle cx={30} cy={-6} r={6.5} clipPath={`url(#${id}-disc)`} initial={false} animate={shadow} transition={transition} />
    <motion.g initial={false} animate={state ? { rotate: iconMotion.sunRaysTurnDeg, scale: iconMotion.sunRaysScale, opacity: 0 } : { rotate: 0, scale: 1, opacity: 1 }}
      transition={reduced ? immediate : { ...stateTransition, opacity: feedbackTransition }}>
      {RAYS.map(d => <path key={d} d={d} />)}
    </motion.g>
  </Frame>;
}

export interface ChevronIconProps extends IconMorphIconProps {
  /** Degrees the chevron turns when `state` is true. 180 flips down to up; 90 turns right to down. */
  turn?: number;
  /** Where the chevron points at rest. */
  pointing?: "down" | "right";
}

/** A chevron that turns on a spring, for disclosure and sort controls. */
export function ChevronIcon({ state = false, turn = motionTokens.keyframes.disclosure.reverseDeg, pointing = "down", ...props }: ChevronIconProps) {
  const reduced = useReducedFlag();
  return <Frame {...props} reduced={reduced}>
    <motion.path d={pointing === "down" ? "M6 9 L12 15 L18 9" : "M9 6 L15 12 L9 18"} initial={false}
      animate={{ rotate: state ? turn : 0 }} style={{ transformOrigin: "center" }} transition={reduced ? immediate : stateTransition} />
  </Frame>;
}

const BELL = "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9";
const CLAPPER = "M10.3 21a1.94 1.94 0 0 0 3.4 0";

/** Notifications on and off: turning on rings the bell from its top, with the clapper lagging behind; turning off strikes it through. */
export function BellIcon({ state = false, ...props }: IconMorphIconProps) {
  const reduced = useReducedFlag();
  const id = useIds();
  const rings = useTurnOns(state, reduced);
  const ring = state && rings > 0 && !reduced;
  const emphasis = { duration: motionTokens.roleDuration.emphasis, ease: iconMotion.bellEase };
  const slash = reduced ? immediate : { ...stateTransition, opacity: feedbackTransition };
  const slashOn = { pathLength: state ? 0 : 1, opacity: state ? 0 : 1 };
  return <Frame {...props} reduced={reduced}>
    <defs>
      <mask id={`${id}-cut`} maskUnits="userSpaceOnUse" x="-4" y="-4" width="32" height="32">
        <rect x="-4" y="-4" width="32" height="32" fill="white" stroke="none" />
        <motion.path d="M3 3 L21 21" stroke="black" strokeWidth={5} initial={false} animate={slashOn} transition={slash} />
      </mask>
    </defs>
    {/* Leaving the active state unmounts both keyframes, including a delayed clapper. */}
    <g key={ring ? rings : "rest"} mask={`url(#${id}-cut)`}>
      <motion.g style={{ transformOrigin: "center top" }} initial={ring ? undefined : false}
        animate={ring ? { rotate: [...iconMotion.bellAngles] } : { rotate: 0 }} transition={ring ? emphasis : immediate}>
        <path d={BELL} />
      </motion.g>
      <motion.path d={CLAPPER} initial={ring ? undefined : false}
        animate={ring ? { x: [...iconMotion.bellClapperOffsets] } : { x: 0 }} transition={ring ? { ...emphasis, delay: motionTokens.stagger.word } : immediate} />
    </g>
    <motion.path d="M3 3 L21 21" initial={false} animate={slashOn} transition={slash} />
  </Frame>;
}

const HEART = "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z";
const SPARKS = Array.from({ length: iconMotion.heartSparkCount }, (_, index) => {
  const angle = -Math.PI / 2 + index * 2 * Math.PI / iconMotion.heartSparkCount;
  return { x: Math.cos(angle), y: Math.sin(angle), r: index % 2 ? iconMotion.heartSparkSmallRadius : iconMotion.heartSparkLargeRadius };
});

/** Like: the heart fills with a pop, and a ring and a few sparks burst out once. Unliking simply empties it. */
export function HeartIcon({ state = false, className, ...props }: IconMorphIconProps) {
  const reduced = useReducedFlag();
  const likes = useTurnOns(state, reduced);
  const burst = likes > 0 && state && !reduced;
  return <Frame {...props} reduced={reduced} className={[styles.heart, className].filter(Boolean).join(" ")} data-on={state ? "" : undefined} overflow="visible">
    {burst && <g key={`burst-${likes}`} stroke="none">
      <motion.circle cx={12} cy={12} fill="none" stroke="currentColor" initial={reduced ? false : { r: iconMotion.heartBurstStartRadius, strokeWidth: iconMotion.heartBurstStroke, opacity: iconMotion.heartBurstOpacity }}
        animate={{ r: iconMotion.heartBurstEndRadius, strokeWidth: 0, opacity: 0 }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : { duration: motionTokens.duration.considered, ease: [...motionTokens.ease.enter] }} />
      {SPARKS.map((spark, index) => <motion.circle key={index} cx={12} cy={12} r={spark.r} fill="currentColor"
        initial={reduced ? false : { x: spark.x * iconMotion.heartSparkStart, y: spark.y * iconMotion.heartSparkStart, opacity: 1, scale: 1 }}
        animate={{ x: spark.x * iconMotion.heartSparkEnd, y: spark.y * iconMotion.heartSparkEnd, opacity: 0, scale: iconMotion.heartSparkEndScale }}
        transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : { duration: motionTokens.roleDuration.emphasis, delay: motionTokens.stagger.word, ease: [...motionTokens.ease.enter] }} />)}
    </g>}
    <motion.g key={`heart-${likes}`} style={{ transformOrigin: "center" }}
      animate={burst ? { scale: [...iconMotion.heartScale] } : { scale: 1 }}
      transition={reduced ? immediate : burst ? { duration: motionTokens.roleDuration.emphasis, ease: [...motionTokens.ease.enter] } : stateTransition}>
      <motion.path d={HEART} initial={reduced ? false : { fillOpacity: state && !burst ? 1 : 0 }} animate={{ fillOpacity: state ? 1 : 0 }} fill="currentColor"
        transition={reduced ? immediate : feedbackTransition} />
    </motion.g>
  </Frame>;
}

const ICONS: Record<IconMorphName, (props: IconMorphIconProps) => ReactNode> = {
  menu: MenuIcon,
  play: PlayPauseIcon,
  plus: PlusCheckIcon,
  copy: CopyCheckIcon,
  theme: SunMoonIcon,
  chevron: ChevronIcon,
  bell: BellIcon,
  heart: HeartIcon,
};

/** One entry point for every morphing icon: pick it by `name` and drive it with `state`. */
export function IconMorph({ name, ...props }: IconMorphProps) {
  const Icon = ICONS[name];
  return <Icon {...props} />;
}

export default IconMorph;
