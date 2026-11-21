"use client";

import { Button } from "@/primitives/button";
import type { ButtonTextSize, ButtonVariant } from "@/primitives/button";
import { MotionSwap } from "@/variants/motion-swap";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { CircleAlert, Copy } from "rams-icons";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import { useCopyFeedback } from "@/variants/vendor/lib/use-copy-feedback";
import styles from "./copy-button.module.css";

export interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  iconOnly?: boolean;
  variant?: ButtonVariant;
  size?: ButtonTextSize;
  disabled?: boolean;
  onCopied?: () => void;
}

/** Copy feedback is quick and quiet: the old icon and word fade out fast while the new ones fade in, with no blur and no
 *  per-letter motion. The label cell reserves its widest state, so feedback keeps the available button width while longer labels wrap. */
const ease = [...motionTokens.ease.standard] as [number, number, number, number];
const show = { duration: motionTokens.duration.fast, ease } as const;
const hide = { duration: motionTokens.duration.instant, ease } as const;

/** The success tick draws itself in one short stroke. */
function DrawnCheck({ reduced }: { reduced: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    {reduced ? <path d="M4 12l5 5L20 6" /> : <motion.path d="M4 12l5 5L20 6" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: motionTokens.duration.standard, ease, delay: motionTokens.stagger.word }} />}
  </svg>;
}

export function CopyButton({ value, label = "Copy", className, iconOnly = false, variant = "outline", size = "default", disabled, onCopied }: CopyButtonProps) {
  const { state, copy } = useCopyFeedback();
  const reduced = useReducedMotion() ?? false;
  const text = state === "copied" ? "Copied" : state === "error" ? "Failed" : label;

  async function handleCopy() {
    if (await copy(value)) onCopied?.();
  }

  return <><Button variant={variant} size={iconOnly ? (size === "default" ? "icon" : `icon-${size}`) : size}
    type="button"
    className={[styles.button, iconOnly && styles.iconOnly, className].filter(Boolean).join(" ")}
    onClick={() => void handleCopy()}
    aria-label={label}
    data-copy-state={state}
    disabled={disabled}
  >
    <span className={styles.icon} aria-hidden="true">
      <AnimatePresence initial={false}>
        <MotionSwap key={state} className={styles.iconInner} data-state={state}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: motionTokens.keyframes.copyButton.iconEnterScale }} animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, transition: reduced ? ({ duration: motionTokens.reduced.duration } as const) : hide }} transition={reduced ? ({ duration: motionTokens.reduced.duration } as const) : show}>
          {state === "copied" ? <DrawnCheck reduced={reduced} /> : state === "error" ? <CircleAlert /> : <Copy />}
        </MotionSwap>
      </AnimatePresence>
    </span>
    {!iconOnly && <span className={styles.label} aria-hidden="true">
      <span className={styles.measure}>{label}</span><span className={styles.measure}>Copied</span><span className={styles.measure}>Failed</span>
      <AnimatePresence initial={false}>
        <MotionSwap key={text} className={styles.text} initial={reduced ? { opacity: 0 } : { opacity: 0, y: motionTokens.keyframes.copyButton.labelEnterTravelPx }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: reduced ? ({ duration: motionTokens.reduced.duration } as const) : hide }} transition={reduced ? ({ duration: motionTokens.reduced.duration } as const) : show}>{text}</MotionSwap>
      </AnimatePresence>
    </span>}
  </Button><span className={styles.srOnly} role="status" aria-live="polite">{state === "idle" ? "" : state === "error" ? `${label}: Could not copy` : `${label}: Copied`}</span></>;
}
