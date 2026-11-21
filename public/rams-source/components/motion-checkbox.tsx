"use client";
import "./motion-fields.css";

import { forwardRef, useId, useState } from "react";
import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { Checkbox as OwnCheckbox } from "./checkbox";
import { motion } from "motion/react";
import { motionTransition } from "./motion-policy";
import { useReducedMotion } from "./use-motion-preference";
import type { Transition } from "motion/react";
import { motionTokens } from "./motion-tokens";
import styles from "./motion-checkbox.module.css";

export interface CheckboxProps extends Omit<ComponentPropsWithoutRef<typeof OwnCheckbox>, "children" | "asChild"> {
  label?: string;
  description?: string;
}

/** Both marks share three points, so the check morphs into the dash and back instead of swapping. */
const checkPath = "M4.25 9.25 L7.25 12.25 L13.75 5.75";
const dashPath = "M4.75 9 L9 9 L13.25 9";
const selection = motionTransition("selection");

export const Checkbox = forwardRef<ElementRef<typeof OwnCheckbox>, CheckboxProps>(function Checkbox(
  { label, description, id, className, checked, defaultChecked, onCheckedChange, ...props }, ref,
) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const reduced = useReducedMotion();
  const [internal, setInternal] = useState<NonNullable<ComponentPropsWithoutRef<typeof OwnCheckbox>["checked"]>>(defaultChecked ?? false);
  const state = checked ?? internal;
  const on = state !== false;
  const change = (next: NonNullable<ComponentPropsWithoutRef<typeof OwnCheckbox>["checked"]>) => { if (checked === undefined) setInternal(next); onCheckedChange?.(next); };
  const fade: Transition = { duration: on ? motionTokens.duration.instant : motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };
  return <div className={styles.field}>
    <OwnCheckbox {...props} asChild={false} id={controlId} ref={ref} checked={state} onCheckedChange={change} className={[styles.box, className].filter(Boolean).join(" ")} aria-describedby={[props["aria-describedby"], description ? `${controlId}-description` : undefined].filter(Boolean).join(" ") || undefined} aria-label={props["aria-label"] ?? (label ? undefined : "Checkbox")}>
      <span key={reduced ? "reduced" : "animated"} className={styles.visual} aria-hidden="true">
        <motion.span className={styles.fill} initial={false} animate={{ opacity: on ? 1 : 0, scale: on ? 1 : motionTokens.keyframes.checkbox.fillEnterScale }} transition={reduced ? { duration: motionTokens.reduced.duration } : { scale: motionTokens.spring.snappy, opacity: fade }} />
        <svg className={styles.mark} viewBox="0 0 18 18" fill="none" focusable="false">
          <motion.path initial={false} animate={{ d: state === "indeterminate" ? dashPath : checkPath, pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={reduced ? { duration: motionTokens.reduced.duration } : { ...selection, opacity: fade }} stroke="currentColor" strokeWidth="var(--rams-detail-checkbox-indicator-stroke-width)" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </OwnCheckbox>
    {label || description ? <div className={styles.copy}>{label ? <label htmlFor={controlId}>{label}</label> : null}{description ? <span id={`${controlId}-description`}>{description}</span> : null}</div> : null}
  </div>;
});

Checkbox.displayName = "Checkbox";
