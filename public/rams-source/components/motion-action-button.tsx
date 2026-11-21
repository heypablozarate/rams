"use client";
import "./motion-fields.css";

import { useComposedRefs } from "@radix-ui/react-compose-refs";

import {
  forwardRef,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ButtonHTMLAttributes, MouseEvent, RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { MotionSwap } from "./motion-swap";
import { useReducedMotion } from "./use-motion-preference";
import type { TargetAndTransition, Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import { motionTokens } from "./motion-tokens";
import { Button as OwnButton } from "./button";
import type { ButtonTextSize, ButtonVariant } from "./button";
import styles from "./motion-action-button.module.css";

const MotionButton = motion.create(OwnButton);
const actionMotion = motionTokens.keyframes.actionButton;

export interface ActionButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "onDrag" | "onDragEnd" | "onDragStart" | "onAnimationStart"
> {
  label: string;
  size?: ButtonTextSize;
  variant?: ButtonVariant;
  successLabel?: string;
  pendingLabel?: string;
  onAction: () => void | Promise<void>;
  resetAfterMs?: number;
  onActionError?: (error: unknown) => void;
}

const pressVariants: Variants = {
  pressed: (button: RefObject<HTMLButtonElement | null>) => ({
    scale: (button.current?.offsetWidth ?? 0) > actionMotion.press.wideButtonPx
      ? actionMotion.press.wideScale
      : actionMotion.press.regularScale,
    transition: {
      duration: motionTokens.duration.instant,
      ease: [...motionTokens.ease.standard],
    },
  }),
};
const rest: TargetAndTransition = {
  opacity: 1,
  y: 0,
  scale: 1,
  filter: "blur(0px)",
};
const labelIn = {
  duration: motionTokens.duration.fast,
  ease: [...motionTokens.ease.enter],
} as const;
const labelOut: TargetAndTransition = {
  opacity: 0,
  transition: {
    duration: motionTokens.duration.instant,
    ease: [...motionTokens.ease.standard],
  },
};
const iconIn: TargetAndTransition = {
  opacity: 0,
  scale: actionMotion.statusEnterScale,
  filter: `blur(${motionTokens.blur.subtle}px)`,
};
const iconOut: TargetAndTransition = {
  ...iconIn,
  transition: {
    duration: motionTokens.duration.fast,
    ease: [...motionTokens.ease.standard],
  },
};
/** The arrow leaves in the direction of the action and returns from behind once the button resets. */
const arrowIn: TargetAndTransition = {
  opacity: 0,
  x: actionMotion.arrowEnterOffsetPx,
  filter: `blur(${motionTokens.blur.subtle}px)`,
};
const arrowOut: TargetAndTransition = {
  opacity: 0,
  x: actionMotion.arrowExitOffsetPx,
  filter: `blur(${motionTokens.blur.subtle}px)`,
  transition: {
    duration: motionTokens.duration.fast,
    ease: [...motionTokens.ease.standard],
  },
};
const iconRest: TargetAndTransition = { ...rest, x: 0 };
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 };
/** Scale rides the spring; opacity and blur tween so blur never overshoots below zero. */
const iconEnter = {
  ...motionTokens.spring.snappy,
  opacity: {
    duration: motionTokens.duration.fast,
    ease: [...motionTokens.ease.enter],
  },
  filter: {
    duration: motionTokens.duration.fast,
    ease: [...motionTokens.ease.enter],
  },
} as const;

/** Springs the wrapper to the natural width of its content when the text changes, so new text never snaps the layout.
 *  Other resizes (a late web font, a parent reflow) jump straight to the new width, so nothing wobbles on first paint. */
function useMorphWidth(
  content: RefObject<HTMLElement | null>,
  key: string,
  reduced: boolean,
) {
  const width = useMotionValue<number | "auto">("auto");
  const measureCurrent = useRef<((animateChange: boolean, finishImmediately?: boolean) => void) | null>(null);
  const lastKey = useRef(key);
  useLayoutEffect(() => {
    const node = content.current,
      slot = node?.parentElement;
    if (!node || !slot || typeof ResizeObserver === "undefined") return;
    const button = slot.closest("button");
    if (!button) return;
    let target: number | undefined, generation = 0;
    let playback: { stop: () => void } | undefined;
    const read = (animateChange: boolean, finishImmediately = false) => {
      const previousSlotWidth = slot.style.width;
      const previousSlotShrink = slot.style.flexShrink;
      let next: number;
      try {
        // Let flex layout allocate the label slot after the icon and gap.
        // Used sizes retain subpixels and are unaffected by press transforms.
        slot.style.width = "max-content";
        slot.style.flexShrink = "1";
        slot.style.setProperty("--rams-detail-action-label-available", "none");
        const available = parseFloat(getComputedStyle(slot).inlineSize) || 0;
        const intrinsic = parseFloat(getComputedStyle(node).inlineSize) || 0;
        if (available < intrinsic) {
          slot.style.setProperty("--rams-detail-action-label-available", `${available}px`);
        }
        next = Math.min(available, intrinsic);
      } finally {
        slot.style.width = previousSlotWidth;
        slot.style.flexShrink = previousSlotShrink;
      }
      if (target === next && !finishImmediately) return;
      const initial = target === undefined;
      target = next;
      const current = ++generation;
      playback?.stop();
      if (!next || initial || !animateChange) {
        width.jump(next || "auto");
        delete slot.dataset.morphing;
        return;
      }
      slot.dataset.morphing = "";
      playback = animate(width, next, {
        ...motionTokens.spring.snappy,
        onComplete: () => { if (generation === current) delete slot.dataset.morphing; },
      });
    };
    measureCurrent.current = read;
    read(false);
    const observer = new ResizeObserver(() => read(false));
    observer.observe(node);
    observer.observe(button);
    if (button.parentElement) observer.observe(button.parentElement);
    return () => {
      generation += 1;
      playback?.stop(); observer.disconnect(); width.stop();
      if (measureCurrent.current === read) measureCurrent.current = null;
      delete slot.dataset.morphing;
    };
  }, [content, width]);
  useLayoutEffect(() => {
    const changed = lastKey.current !== key;
    lastKey.current = key;
    measureCurrent.current?.(changed && !reduced, reduced);
  }, [key, reduced]);
  return width;
}

/** The success tick draws itself from its short stroke, the way a hand would write it. */
function DrawnCheck({ reduced }: { reduced: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="var(--rams-detail-action-confirmation-check-stroke)"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {reduced ? (
        <path d="M4 12l5 5L20 6" />
      ) : (
        <motion.path
          d="M4 12l5 5L20 6"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: {
              duration: motionTokens.duration.standard,
              ease: [...motionTokens.ease.enter],
              delay: motionTokens.stagger.word,
            },
            opacity: {
              duration: motionTokens.duration.instant,
              delay: motionTokens.stagger.word,
            },
          }}
        />
      )}
    </svg>
  );
}

/** Swaps one label for the next with a single crossfade: the old text fades out fast, the new one fades in, and the width follows without overshoot. */
function SwapText({ text, reduced }: { text: string; reduced: boolean }) {
  const sizerRef = useRef<HTMLSpanElement>(null);
  const width = useMorphWidth(sizerRef, text, reduced);
  return (
    <motion.span className={styles.morph} style={{ width }} aria-hidden="true">
      <span ref={sizerRef} className={styles.sizer}>
        {text}
      </span>
      <AnimatePresence initial={false}>
        <MotionSwap
          key={text}
          className={styles.label}
          initial={reduced ? false : { opacity: 0, y: actionMotion.labelEnterOffsetPx }}
          animate={{ opacity: 1, y: 0 }}
          exit={
            reduced
              ? {
                  opacity: 0,
                  transition: { duration: motionTokens.reduced.duration },
                }
              : labelOut
          }
          transition={
            reduced
              ? {
                  duration: motionTokens.reduced.duration,
                  delay: motionTokens.reduced.stagger,
                }
              : labelIn
          }
        >
          {text}
        </MotionSwap>
      </AnimatePresence>
    </motion.span>
  );
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  function ActionButton(
    {
      label,
      successLabel = "Saved",
      pendingLabel = "Saving",
      onAction,
      resetAfterMs = 2400,
      onActionError,
      className,
      size = "default",
      variant = "default",
      disabled,
      ...props
    },
    ref,
  ) {
    const [state, setState] = useState<"idle" | "pending" | "success">("idle");
    const running = useRef(false);
    const mounted = useRef(true);
    const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const reduceMotion = useReducedMotion() ?? false;
    const text =
      state === "pending"
        ? pendingLabel
        : state === "success"
          ? successLabel
          : label;

    const setRefs = useComposedRefs(buttonRef, ref);
    useLayoutEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
        if (resetTimer.current) clearTimeout(resetTimer.current);
      };
    }, []);

    async function run(event: MouseEvent<HTMLButtonElement>) {
      if (
        running.current ||
        disabled ||
        props["aria-disabled"] === true ||
        props["aria-disabled"] === "true"
      ) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      running.current = true;
      if (resetTimer.current) clearTimeout(resetTimer.current);
      setState("pending");
      try {
        await onAction();
        if (!mounted.current) return;
        setState("success");
        if (resetAfterMs > 0)
          resetTimer.current = setTimeout(() => setState("idle"), resetAfterMs);
      } catch (error) {
        if (!mounted.current) return;
        setState("idle");
        onActionError?.(error);
      } finally {
        running.current = false;
      }
    }

    const pending = state === "pending";
    const arrow = state === "idle";
    const unavailable = disabled || pending || props["aria-disabled"] === true || props["aria-disabled"] === "true";

    // Pending stays focusable (aria-disabled instead of disabled), so a keyboard user keeps focus through the whole save.
    return (
      <MotionButton
        {...props}
        ref={setRefs}
        tabIndex={props.tabIndex ?? 0}
        type={props.type ?? "button"}
        className={[styles.button, className].filter(Boolean).join(" ")}
        disabled={disabled}
        size={size}
        variant={variant}
        aria-label={props["aria-label"] ?? label}
        aria-disabled={pending ? true : props["aria-disabled"]}
        aria-busy={pending}
        data-state={state}
        onClick={run}
        custom={buttonRef}
        variants={pressVariants}
        whileTap={reduceMotion || unavailable ? undefined : "pressed"}
        transition={
          reduceMotion
            ? {
                duration: motionTokens.reduced.duration,
                delay: motionTokens.reduced.stagger,
              }
            : motionTokens.spring.snappy
        }
      >
        <span className={styles.content} aria-hidden="true">
          <SwapText text={text} reduced={reduceMotion} />
          <span className={styles.iconSlot}>
            <AnimatePresence initial={false}>
              <MotionSwap
                key={state}
                className={styles.phase}
                initial={reduceMotion ? fadeIn : arrow ? arrowIn : iconIn}
                animate={iconRest}
                exit={
                  reduceMotion
                    ? {
                        opacity: 0,
                        transition: { duration: motionTokens.reduced.duration },
                      }
                    : arrow
                      ? arrowOut
                      : iconOut
                }
                transition={
                  reduceMotion
                    ? { duration: motionTokens.reduced.duration }
                    : iconEnter
                }
              >
                {pending ? (
                  <span className={styles.spinner} />
                ) : state === "success" ? (
                  <DrawnCheck reduced={reduceMotion} />
                ) : (
                  <ArrowRight />
                )}
              </MotionSwap>
            </AnimatePresence>
          </span>
        </span>
        <span className={styles.visuallyHidden} role="status">
          {state === "pending"
            ? pendingLabel
            : state === "success"
              ? successLabel
              : ""}
        </span>
      </MotionButton>
    );
  },
);

export default ActionButton;
