"use client";

import { forwardRef, useId, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { AnimatePresence } from "motion/react";
import type { Variants } from "motion/react";
import { MotionSwap } from "@/variants/motion-swap";
import { Label } from "@/primitives/label";
import { Select as RamsSelect, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/primitives/select";
import { floatingPlacement } from "@/primitives/floating-placement";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import styles from "./select.module.css";

export interface SelectProps extends Omit<ComponentPropsWithoutRef<typeof RamsSelect>, "children"> {
  label: string;
  description?: string;
  placeholder?: string;
  id?: string;
  className?: string;
  options: { value: string; label: string; disabled?: boolean }[];
}

/** The shown value rolls in the direction of the list: a later option rises from below, an earlier one drops from above. */
const valueRoll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * motionTokens.keyframes.menuValueSwap.selectValueEnterTravelEm}em`, filter: `blur(${motionTokens.blur.soft}px)` }),
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } },
  exit: (direction: number) => ({ opacity: 0, y: `${direction * -motionTokens.keyframes.menuValueSwap.exitTravelEm}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }),
};
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  { label, description, placeholder = "Select an option", options, id, className, disabled, onValueChange, ...rootProps },
  ref,
) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = description ? `${controlId}-description` : undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(rootProps.defaultValue ?? "");
  const currentValue = rootProps.value ?? uncontrolledValue;
  const index = options.findIndex((option) => option.value === currentValue);
  const shown = currentValue ? options[index]?.label ?? "" : placeholder;
  const [previousIndex, setPreviousIndex] = useState(index);
  const [direction, setDirection] = useState(1);
  if (previousIndex !== index) { setPreviousIndex(index); setDirection(index > previousIndex ? 1 : -1); }

  return (
    <div className={styles.field}>
      <Label htmlFor={controlId}>{label}</Label>
      <RamsSelect {...rootProps} disabled={disabled} onValueChange={(next) => { setUncontrolledValue(next); onValueChange?.(next); }}>
        <SelectTrigger ref={ref} id={controlId} aria-describedby={hintId} className={[styles.trigger, "w-full", className].filter(Boolean).join(" ")}>
          {/* The canonical value owns accessible selection; animated copy is presentation only. */}
          <span className={styles.srOnly}><SelectValue placeholder={placeholder} /></span>
          <span className={styles.valueText} aria-hidden="true">
            <AnimatePresence initial={false} custom={direction}>
              <MotionSwap key={currentValue ? `value-${currentValue}` : "placeholder"} data-placeholder={currentValue ? undefined : ""} custom={direction} variants={valueRoll} initial="enter" animate="center" exit="exit">{shown}</MotionSwap>
            </AnimatePresence>
          </span>
        </SelectTrigger>
        <SelectContent className={styles.content} position="popper" sideOffset={floatingPlacement.motionSelect.anchorGapPx} collisionPadding={floatingPlacement.motionSelect.collisionInsetPx}>
          {options.map(option => <SelectItem key={option.value} value={option.value} disabled={option.disabled}>{option.label}</SelectItem>)}
        </SelectContent>
      </RamsSelect>
      {description && <span id={hintId} className={styles.hint}>{description}</span>}
    </div>
  );
});
