"use client";

import { MotionPresenceButton as MotionOwnButton } from "@/variants/presence-controls";
import { Input as OwnInput } from "@/primitives/input";
import { forwardRef, useId, useLayoutEffect, useRef } from "react";
import type { InputHTMLAttributes } from "react";
import { AnimatePresence, useAnimationControls, usePresence, type TargetAndTransition } from "motion/react";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { Search, X as Xmark } from "rams-icons";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import { useComposedRefs } from "@radix-ui/react-compose-refs";
import styles from "./search-field.module.css";

const { searchField } = motionTokens.keyframes;

const clearRest = { opacity: 1, scale: 1, filter: "blur(0px)" };
const clearHidden = { opacity: 0, scale: searchField.clearHiddenScale, filter: `blur(${motionTokens.blur.subtle}px)` };
const clearExit: TargetAndTransition = { ...clearHidden, transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } };

function ClearSearchButton({ disabled, onClick }: { disabled?: boolean; onClick: () => void }) {
  const controls = useAnimationControls();
  const reduced = useReducedMotion();
  const [isPresent, safeToRemove] = usePresence();

  useLayoutEffect(() => {
    if (isPresent && !reduced) return;
    controls.stop();
    if (reduced) {
      controls.set(isPresent ? clearRest : { opacity: 0, scale: 1, filter: "none" });
      if (!isPresent) safeToRemove?.();
      return;
    }

    let retired = false;
    void controls.start(clearExit).then(() => { if (!retired) safeToRemove?.(); });
    return () => {
      retired = true;
      controls.stop();
    };
  }, [controls, isPresent, reduced, safeToRemove]);

  return <MotionOwnButton type="button" disabled={disabled} tabIndex={0} onClick={onClick} aria-label="Clear search"
    initial={reduced ? false : clearHidden}
    animate={reduced || !isPresent ? controls : clearRest}
    whileTap={reduced ? undefined : { scale: searchField.clearPressScale, transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } }}
    transition={reduced ? { duration: motionTokens.reduced.duration } : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast }, filter: { duration: motionTokens.duration.fast } }}>
    <Xmark aria-hidden="true" />
  </MotionOwnButton>;
}

export interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> { label: string; value: string; onValueChange: (value: string) => void }
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField({ label, value, onValueChange, id, className, disabled, readOnly, onChange, ...props }, ref) {
  const generated = useId(); const controlId = id ?? generated; const inputRef = useRef<HTMLInputElement | null>(null);
  const setRefs = useComposedRefs(inputRef, ref);
  // Clearing returns focus to the field, since the clear button unmounts under the pointer.
  function clear() { if (disabled || readOnly) return; onValueChange(""); inputRef.current?.focus(); }
  return <div className={styles.field}><label htmlFor={controlId}>{label}</label><div className={styles.shell} data-filled={value ? "true" : undefined}>
    <Search aria-hidden="true"/><OwnInput {...props} ref={setRefs} id={controlId} type="search" value={value} disabled={disabled} readOnly={readOnly} onChange={event => { onChange?.(event); if (!event.defaultPrevented) onValueChange(event.target.value); }} className={[styles.input, className].filter(Boolean).join(" ")} />
    {/* The clear button has a reserved slot, so the field never changes width when it appears or leaves. */}
    <span className={styles.clearSlot}><AnimatePresence initial={false}>{value ? <ClearSearchButton
      key="clear" disabled={disabled || readOnly} onClick={clear} /> : null}</AnimatePresence></span>
  </div></div>;
});
