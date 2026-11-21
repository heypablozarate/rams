"use client";
import "./motion-fields.css";

import { useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import { Moon, Sun } from "lucide-react";
import { motionTokens } from "./motion-tokens";
import { Button } from "./motion-button";
import styles from "./motion-theme-switch.module.css";

export type ThemeSwitchVariant = "reveal" | "eclipse" | "split" | "rise";
export type Theme = "light" | "dark";

export interface ThemeSwitchProps {
  theme: Theme;
  variant?: ThemeSwitchVariant;
  onThemeChange: (next: Theme, variant: ThemeSwitchVariant, trigger: HTMLElement) => void;
  label?: string;
  iconOnly?: boolean;
}

/** Rotation and scale ride the spring; opacity and blur tween so the blur never overshoots below zero. */
const iconSpring = { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] }, filter: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } } as const;
const iconExit = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } as const;
const iconMotion = motionTokens.keyframes.themeSwitch;
const blur = `blur(${motionTokens.blur.subtle}px)`;

/** A stored preference usually reaches the theme prop just after hydration. That correction swaps the icon in place;
 *  only changes after the first painted frames animate, so a page that loads in dark mode never spins its switches. */
function useSettled() {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => { second = requestAnimationFrame(() => setSettled(true)); });
    return () => { cancelAnimationFrame(first); cancelAnimationFrame(second); };
  }, []);
  return settled;
}

/** Both icons turn the same way (clockwise into dark, back out of it), so the swap reads as one rotation rather than two fades. */
function ThemeIcon({ theme, reduced, settled }: { theme: Theme; reduced: boolean; settled: boolean }) {
  const Icon = theme === "light" ? Sun : Moon;
  const angle = (theme === "light" ? 1 : -1) * iconMotion.iconTurnDeg;
  if (reduced) return (
    <span className={styles.icon} aria-hidden="true">
      <Icon size="var(--rams-detail-motion-button-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" />
    </span>
  );
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        key={theme}
        className={styles.icon}
        initial={!settled ? false : { opacity: 0, scale: iconMotion.iconHiddenScale, rotate: angle, filter: blur }}
        animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
        exit={!settled ? { opacity: 0, transition: { duration: motionTokens.reduced.duration } } : { opacity: 0, scale: iconMotion.iconHiddenScale, rotate: angle, filter: blur, transition: iconExit }}
        transition={iconSpring}
        aria-hidden="true"
      >
        <Icon size="var(--rams-detail-motion-button-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" />
      </motion.span>
    </AnimatePresence>
  );
}

export function ThemeSwitch({ theme, variant = "reveal", onThemeChange, label, iconOnly = false }: ThemeSwitchProps) {
  const reduced = useReducedMotion() ?? false;
  const settled = useSettled();
  const [reducedTheme, setReducedTheme] = useState<Theme | null>(null);
  useLayoutEffect(() => {
    if (reduced) setReducedTheme(theme);
    else if (theme !== reducedTheme) setReducedTheme(null);
  }, [reduced, theme, reducedTheme]);
  const staticIcon = reduced || reducedTheme === theme;
  const next = theme === "light" ? "dark" : "light";
  const classes = [styles.themeSwitch, styles[variant], iconOnly ? styles.iconOnly : "", settled ? styles.settled : "", staticIcon ? styles.staticIcon : ""].join(" ");

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className={classes}
      data-theme={theme}
      aria-label={label ?? `Switch to ${next} mode`}
      aria-pressed={theme === "dark"}
      onClick={event => onThemeChange(next, variant, event.currentTarget)}
    >
      <span className={styles.iconWrap}><ThemeIcon theme={theme} reduced={reduced} settled={settled} /></span>
      {!iconOnly && <span className={styles.label}>Switch theme</span>}
    </Button>
  );
}

export default ThemeSwitch;
