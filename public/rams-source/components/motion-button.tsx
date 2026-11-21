"use client";
import "./motion-fields.css";

import { useComposedRefs } from "@radix-ui/react-compose-refs";

import {
  forwardRef,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import type { ButtonHTMLAttributes, ReactNode, Ref, RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import { MotionSwap } from "./motion-swap";
import type { TargetAndTransition, Variants } from "motion/react";
import { motionTokens } from "./motion-tokens";
import { Button as OwnButton } from "./button";
import type { ButtonSize, ButtonVariant } from "./button";
export type { ButtonSize, ButtonVariant } from "./button";
import styles from "./motion-button.module.css";

const MotionButton = motion.create(OwnButton);
const { button: buttonMotion, buttonGroup: labelMotion, actionButton: { press } } = motionTokens.keyframes;



export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragEnd" | "onDragStart" | "onAnimationStart"
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

/** Icon buttons press a little deeper, wide buttons a little less, so every size reads as the same push. */
function pressScale(button: RefObject<HTMLButtonElement | null>) {
  const width = button.current?.offsetWidth ?? 0;
  if (width > press.wideButtonPx) return press.wideScale;
  return width && width <= buttonMotion.compactButtonPx ? buttonMotion.compactPressScale : press.regularScale;
}

const pressVariants: Variants = {
  pressed: (button: RefObject<HTMLButtonElement | null>) => {
    return {
      scale: pressScale(button),
      transition: {
        duration: motionTokens.duration.instant,
        ease: [...motionTokens.ease.standard],
      },
    };
  },
};

const rest: TargetAndTransition = {
  opacity: 1,
  y: 0,
  scale: 1,
  filter: "blur(0px)",
};
/** Text rises about .3em out of a soft blur; the outgoing label lifts away a little faster. */
const textIn: TargetAndTransition = {
  opacity: 0,
  y: labelMotion.labelEnterOffsetPx,
  filter: `blur(${motionTokens.blur.soft}px)`,
};
const textOut: TargetAndTransition = {
  opacity: 0,
  y: labelMotion.labelExitOffsetPx,
  filter: `blur(${motionTokens.blur.soft}px)`,
  transition: {
    duration: motionTokens.duration.fast,
    ease: [...motionTokens.ease.standard],
  },
};
const iconIn: TargetAndTransition = {
  opacity: 0,
  scale: buttonMotion.iconEnterExitScale,
  filter: `blur(${motionTokens.blur.subtle}px)`,
};
const iconOut: TargetAndTransition = {
  opacity: 0,
  scale: buttonMotion.iconEnterExitScale,
  filter: `blur(${motionTokens.blur.subtle}px)`,
  transition: {
    duration: motionTokens.duration.fast,
    ease: [...motionTokens.ease.standard],
  },
};
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 };
const fadeOut: TargetAndTransition = {
  opacity: 0,
  transition: { duration: motionTokens.duration.instant },
};
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

/** A key for the label content: text plus element names, so a new label or icon crossfades while prop-only updates stay in place. */
function labelKey(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (
    typeof node === "string" ||
    typeof node === "number" ||
    typeof node === "bigint"
  )
    return String(node);
  if (Array.isArray(node)) return node.map(labelKey).join("");
  if (!isValidElement(node)) return "";
  const type = node.type as string | { displayName?: string; name?: string };
  return `<${typeof type === "string" ? type : (type?.displayName ?? type?.name ?? "")}>${labelKey((node.props as { children?: ReactNode }).children)}`;
}

/** Springs the slot to the natural width of the incoming label when it changes, so a new label never snaps the button's size.
 *  The outgoing label is popped out of flow at once, so it never holds the old width. Other resizes (a late web font, a parent reflow) jump straight to the new width, so nothing wobbles on first paint. */
function useMorphWidth(
  content: RefObject<HTMLElement | null>,
  key: string,
  reduced: boolean,
) {
  const width = useMotionValue<number | "auto">("auto");
  const lastKey = useRef(key),
    armedUntil = useRef(0);
  const measureCurrent = useRef<(() => void) | null>(null);
  const reducedCurrent = useRef(reduced);
  useLayoutEffect(() => {
    reducedCurrent.current = reduced;
    if (lastKey.current === key) return;
    lastKey.current = key;
    armedUntil.current = performance.now() + labelMotion.widthMorphWindowMs;
    // Resolve the incoming layout before paint, using the same width owner.
    measureCurrent.current?.();
  }, [key, reduced]);
  useLayoutEffect(() => {
    if (!reduced) return;
    width.jump("auto");
    const slot = content.current?.parentElement;
    if (slot) {
      slot.style.width = "auto";
      delete slot.dataset.morphing;
    }
  }, [content, reduced, width]);
  useEffect(() => {
    const node = content.current,
      slot = node?.parentElement,
      button = slot?.parentElement;
    if (!node || !slot || !button || typeof ResizeObserver === "undefined")
      return;
    let target = 0,
      generation = 0;
    let playback: { stop: () => void } | undefined;
    const read = () => {
      // Let the existing button constraints resolve the incoming natural width.
      // The text then keeps that layout while its visual slot springs to it.
      const previous = slot.style.width;
      const previousContentCap = node.style.maxInlineSize;
      const previousFloor = button.style.minBlockSize;
      let next: number;
      try {
        // Measuring a wrapped label must not briefly collapse the page's height.
        button.style.minBlockSize = `${button.offsetHeight}px`;
        node.style.maxInlineSize = "none";
        slot.style.width = "max-content";
        const style = getComputedStyle(button);
        // clientWidth rounds away fractional layout units at a wrap boundary.
        // Used CSS widths remain independent of press transforms.
        const usedWidth = parseFloat(style.width);
        const padding = (parseFloat(style.paddingLeft) || 0)
          + (parseFloat(style.paddingRight) || 0);
        const border = (parseFloat(style.borderLeftWidth) || 0)
          + (parseFloat(style.borderRightWidth) || 0);
        const contentWidth = Number.isFinite(usedWidth)
          ? usedWidth - (style.boxSizing === "border-box" ? padding + border : 0)
          : button.clientWidth - padding;
        const available = Math.max(0, Math.ceil(contentWidth));
        node.style.setProperty("--rams-detail-button-label-available", `${available}px`);
        node.style.maxInlineSize = previousContentCap;
        // Round upward rather than losing a fractional CSS layout unit.
        next = Math.ceil(parseFloat(getComputedStyle(node).width) || node.offsetWidth);
      } finally {
        node.style.maxInlineSize = previousContentCap;
        slot.style.width = previous;
        button.style.minBlockSize = previousFloor;
      }
      // Button resize notifications also arrive on spring frames. An unchanged
      // destination must not restart its own animation.
      if (Math.abs(next - target) < 0.1) return;
      const initial = !target;
      target = next;
      generation += 1;
      const current = generation;
      playback?.stop();
      if (
        !next ||
        initial ||
        reducedCurrent.current ||
        performance.now() > armedUntil.current
      ) {
        width.jump(next || "auto");
        delete slot.dataset.morphing;
        return;
      }
      slot.dataset.morphing = "";
      playback = animate(width, next, {
        ...motionTokens.spring.morph,
        onComplete: () => {
          if (generation === current) delete slot.dataset.morphing;
        },
      });
    };
    measureCurrent.current = read;
    const observer = new ResizeObserver(read);
    observer.observe(node);
    observer.observe(button);
    // A capped slot can keep the button itself unchanged when its container
    // grows. Observe available space as well, so it can regain natural width.
    if (button.parentElement) observer.observe(button.parentElement);
    return () => {
      generation += 1;
      playback?.stop();
      observer.disconnect();
      if (measureCurrent.current === read) measureCurrent.current = null;
    };
  }, [content, reduced, width]);
  return width;
}

function LabelPhase({
  children,
  icon,
  reduced,
  ref,
}: {
  children: ReactNode;
  icon: boolean;
  reduced: boolean;
  ref?: Ref<HTMLSpanElement>;
}) {
  return (
    <MotionSwap
      ref={ref}
      className={styles.labelPhase}
      initial={reduced ? fadeIn : icon ? iconIn : textIn}
      animate={rest}
      exit={
        reduced
          ? {
              opacity: 0,
              transition: { duration: motionTokens.reduced.duration },
            }
          : icon
            ? iconOut
            : textOut
      }
      transition={
        reduced
          ? { duration: motionTokens.reduced.duration }
          : icon
            ? iconEnter
            : {
                duration: motionTokens.duration.standard,
                ease: [...motionTokens.ease.enter],
              }
      }
    >
      {children}
    </MotionSwap>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "default",
      size = "default",
      loading = false,
      disabled,
      children,
      onClick,
      ...props
    },
    ref,
  ) {
    const reduceMotion = useReducedMotion() ?? false;
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const contentRef = useRef<HTMLSpanElement>(null);
    const key = labelKey(children);
    const width = useMorphWidth(contentRef, key, reduceMotion);
    const setRefs = useComposedRefs(buttonRef, ref);
    // A trigger that anchors a menu, popover, or dialog keeps its rect still while pressed, so the layer never measures a scaled anchor.
    // Radix triggers (asChild) pass aria-haspopup or data-state through; the stylesheet repeats the guard.
    const popup = props["aria-haspopup"];
    const anchorsLayer =
      (popup !== undefined && popup !== false && popup !== "false") ||
      props.role === "combobox" ||
      (props as Record<string, unknown>)["data-state"] !== undefined;
    const inert =
      disabled ||
      loading ||
      props["aria-disabled"] === true ||
      props["aria-disabled"] === "true";
    const classes = [styles.button, className]
      .filter(Boolean)
      .join(" ");

    return (
      <MotionButton
        ref={setRefs}
        tabIndex={props.tabIndex ?? 0}
        className={classes}
        disabled={disabled}
        variant={variant}
        size={size}
        aria-busy={loading || undefined}
        custom={buttonRef}
        variants={
          reduceMotion
            ? {
                pressed: (button: RefObject<HTMLButtonElement | null>) => {
                  return {
                    scale: pressScale(button),
                    transition: {
                      duration: motionTokens.reduced.duration,
                      ease: [...motionTokens.ease.standard],
                    },
                  };
                },
              }
            : pressVariants
        }
        whileTap={reduceMotion || anchorsLayer || inert ? undefined : "pressed"}
        transition={
          reduceMotion
            ? {
                duration: motionTokens.reduced.duration,
                delay: motionTokens.reduced.stagger,
              }
            : motionTokens.spring.snappy
        }
        {...props}
        type={props.type ?? "button"}
        // Loading keeps the button focusable (a disabled button would drop keyboard focus mid-action) and swallows presses instead.
        aria-disabled={loading || props["aria-disabled"] || undefined}
        onClick={
          inert
            ? (event) => {
                event.preventDefault();
                event.stopPropagation();
              }
            : onClick
        }
      >
        <AnimatePresence initial={false}>
          {loading ? (
            <MotionSwap
              key="loader"
              className={styles.loader}
              aria-hidden="true"
              initial={
                reduceMotion ? { opacity: 0 } : { opacity: 0, scale: buttonMotion.loaderEnterScale }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={
                reduceMotion
                  ? {
                      opacity: 0,
                      transition: { duration: motionTokens.reduced.duration },
                    }
                  : { ...iconOut, scale: buttonMotion.loaderExitScale }
              }
              transition={
                reduceMotion
                  ? { duration: motionTokens.reduced.duration }
                  : iconEnter
              }
            >
              <span className={styles.spinner} />
            </MotionSwap>
          ) : null}
        </AnimatePresence>
        <motion.span
          className={[styles.labelSlot, loading ? styles.loadingLabel : ""]
            .filter(Boolean)
            .join(" ")}
          style={{ width }}
        >
          <span ref={contentRef} className={styles.labelContent}>
            <AnimatePresence mode="popLayout" initial={false}>
              <LabelPhase
                key={key}
                icon={!/\S/.test(key.replace(/<[^>]*>/g, ""))}
                reduced={reduceMotion}
              >
                {children}
              </LabelPhase>
            </AnimatePresence>
          </span>
        </motion.span>
      </MotionButton>
    );
  },
);

Button.displayName = "Button";

export default Button;
