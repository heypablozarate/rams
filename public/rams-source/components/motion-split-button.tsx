"use client";
import "./motion-fields.css";

import {
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import { ButtonBase as OwnButton } from "./button";
import { ButtonGroup as OwnButtonGroup } from "./button-group";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./dropdown-menu";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { MotionSwap } from "./motion-swap";
import { useReducedMotion } from "./use-motion-preference";
import type { TargetAndTransition, Transition } from "motion/react";
import { ChevronDown } from "lucide-react";
import { motionTokens } from "./motion-tokens";
import { buttonSizeClass } from "./button";
import { floatingPlacement } from "./floating-placement";
import type { ButtonTextSize } from "./button";
import styles from "./motion-split-button.module.css";

export interface SplitButtonAction {
  label: string;
  onSelect?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  icon?: ReactNode;
}
export interface SplitButtonProps {
  label: string;
  actions: SplitButtonAction[];
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  variant?: "default" | "outline";
  size?: ButtonTextSize;
}

const rest: TargetAndTransition = {
  opacity: 1,
  y: 0,
  scale: 1,
  filter: "blur(0px)",
};
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 };
const fadeOut: TargetAndTransition = {
  opacity: 0,
  transition: { duration: motionTokens.duration.instant },
};
const glyphIn: TargetAndTransition = {
  opacity: 0,
  y: motionTokens.keyframes.splitButton.glyphEnterPx,
  filter: `blur(${motionTokens.blur.soft}px)`,
};
const glyphOut: TargetAndTransition = {
  opacity: 0,
  y: motionTokens.keyframes.splitButton.glyphExitPx,
  filter: `blur(${motionTokens.blur.subtle}px)`,
  transition: {
    duration: motionTokens.duration.fast,
    ease: [...motionTokens.ease.standard],
  },
};
const iconIn: TargetAndTransition = {
  opacity: 0,
  scale: motionTokens.keyframes.splitButton.iconEnterScale,
  filter: `blur(${motionTokens.blur.subtle}px)`,
};
const iconOut: TargetAndTransition = {
  ...iconIn,
  transition: {
    duration: motionTokens.duration.fast,
    ease: [...motionTokens.ease.standard],
  },
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

/** Names the icon element, so swapping Copy for Check morphs while a re-render of the same icon stays still. */
function iconKey(node: ReactNode): string {
  if (!isValidElement(node))
    return node == null || typeof node === "boolean" ? "" : String(node);
  const type = node.type as string | { displayName?: string; name?: string };
  return typeof type === "string"
    ? type
    : (type?.displayName ?? type?.name ?? "icon");
}

/** Springs the slot to the natural width of its content when the label changes; other resizes (a late web font) jump. */
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
    armedUntil.current = performance.now() + motionTokens.layoutMeasurement.contentChangeWindowMs;
    // A shorter label can leave every observed outer box unchanged.
    // Reuse the same reader/controller after the new glyphs commit.
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
      // The text lays out at the real available measure; the slot only reveals
      // that layout as it springs. Its intermediate width must not rewrap words.
      const group = button.parentElement;
      if (!group) return;
      const previous = slot.style.width;
      const previousGroupSize = group.style.inlineSize;
      let next: number;
      try {
        // Resolve the existing containing block's constraints synchronously,
        // then restore both temporary sizes before a frame can paint them.
        group.style.inlineSize = "100%";
        slot.style.width = "0px";
        const buttonStyle = getComputedStyle(button);
        const inlineSize = parseFloat(buttonStyle.inlineSize);
        if (!Number.isFinite(inlineSize)) return;
        const borderBox = buttonStyle.boxSizing === "border-box";
        const inlineInset = borderBox
          ? parseFloat(buttonStyle.paddingInlineStart) + parseFloat(buttonStyle.paddingInlineEnd)
            + parseFloat(buttonStyle.borderInlineStartWidth) + parseFloat(buttonStyle.borderInlineEndWidth)
          : 0;
        const inset = (side: "::before" | "::after") =>
          parseFloat(getComputedStyle(button, side).inlineSize) || 0;
        // Use the same fractional layout units for the button and its insets.
        const available = Math.max(0, inlineSize - inlineInset
          - inset("::before") - inset("::after"));
        node.style.setProperty("--rams-detail-split-available", `${available}px`);
        slot.style.width = "max-content";
        next = parseFloat(getComputedStyle(node).inlineSize);
      } finally {
        group.style.inlineSize = previousGroupSize;
        slot.style.width = previous;
      }
      // Button resize notifications also arrive on spring frames. An unchanged
      // destination must not restart its own animation.
      if (Math.abs(next - target) < motionTokens.keyframes.splitButton.labelMeasureTolerancePx) return;
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
    if (button.parentElement?.parentElement)
      observer.observe(button.parentElement.parentElement);
    return () => {
      generation += 1;
      playback?.stop();
      observer.disconnect();
      if (measureCurrent.current === read) measureCurrent.current = null;
    };
  }, [content, reduced, width]);
  return width;
}

type Glyph = { id: string; char: string; order: number };
const toGlyphs = (chars: string[], seq: number): Glyph[] =>
  chars.map((char, order) => ({ id: `${seq}:${order}`, char, order }));

/** Shared leading and trailing characters keep their identity, so "Copy page" to "Copied" only replaces the changed letters. */
function useGlyphs(text: string) {
  const [state, setState] = useState(() => ({
    text,
    seq: 0,
    glyphs: toGlyphs([...text], 0),
  }));
  if (state.text === text) return state.glyphs;
  const prev = [...state.text],
    next = [...text];
  let start = 0,
    end = 0;
  while (
    start < prev.length &&
    start < next.length &&
    prev[start] === next[start]
  )
    start++;
  while (
    end < prev.length - start &&
    end < next.length - start &&
    prev[prev.length - 1 - end] === next[next.length - 1 - end]
  )
    end++;
  if (start < motionTokens.keyframes.splitButton.preservedGlyphMinimum) start = 0;
  if (end < motionTokens.keyframes.splitButton.preservedGlyphMinimum) end = 0;
  const seq = state.seq + 1;
  const glyphs = [
    ...state.glyphs.slice(0, start),
    ...toGlyphs(next.slice(start, next.length - end), seq),
    ...state.glyphs.slice(state.glyphs.length - end),
  ];
  setState({ text, seq, glyphs });
  return glyphs;
}

function MorphText({ text, reduced }: { text: string; reduced: boolean }) {
  const glyphs = useGlyphs(text),
    groups: { glyphs: Glyph[]; space?: Glyph }[] = [];
  let word: Glyph[] = [];
  for (const glyph of glyphs) {
    if (glyph.char === " ") {
      groups.push({ glyphs: word, space: glyph });
      word = [];
    } else word.push(glyph);
  }
  if (word.length) groups.push({ glyphs: word });
  const transition: Transition = reduced
    ? { duration: motionTokens.reduced.duration }
    : {
        duration: motionTokens.duration.fast,
        ease: [...motionTokens.ease.standard],
      };
  return (
    <span className={styles.glyphs}>
      <AnimatePresence mode="popLayout" initial={false}>
        {groups.flatMap((group, index) => [
          group.glyphs.length ? (
            <MotionSwap
              key={"word:" + index}
              className={styles.word}
              initial={fadeIn}
              animate={rest}
              exit={fadeOut}
              transition={transition}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {group.glyphs.map((glyph) => (
                  <MotionSwap
                    key={glyph.id}
                    className={styles.glyph}
                    layout={reduced ? false : "position"}
                    layoutDependency={text}
                    initial={reduced ? fadeIn : glyphIn}
                    animate={rest}
                    exit={
                      reduced
                        ? {
                            opacity: 0,
                            transition: {
                              duration: motionTokens.reduced.duration,
                            },
                          }
                        : glyphOut
                    }
                    transition={
                      reduced
                        ? { duration: motionTokens.reduced.duration }
                        : {
                            duration: motionTokens.duration.standard,
                            ease: [...motionTokens.ease.enter],
                            delay: Math.min(
                              glyph.order * motionTokens.stagger.char,
                              motionTokens.sequence.maxStagger,
                            ),
                            layout: motionTokens.spring.morph,
                          }
                    }
                  >
                    {glyph.char}
                  </MotionSwap>
                ))}
              </AnimatePresence>
            </MotionSwap>
          ) : null,
          group.space ? (
            <MotionSwap
              key={"space:" + group.space.id}
              className={styles.wordSpace}
              initial={fadeIn}
              animate={rest}
              exit={fadeOut}
              transition={transition}
            >
              {group.space.char}
            </MotionSwap>
          ) : null,
        ])}
      </AnimatePresence>
    </span>
  );
}

/** The main action morphs its icon and label in place while its width follows on a spring; the menu half never scales, so the menu opens from a still anchor. */
export function SplitButton({
  label,
  actions,
  onClick,
  disabled,
  icon,
  variant = "default",
  size = "default",
}: SplitButtonProps) {
  const reduced = useReducedMotion() ?? false;
  const contentRef = useRef<HTMLSpanElement>(null);
  const glyph = iconKey(icon);
  const width = useMorphWidth(contentRef, `${glyph}|${label}`, reduced);
  return (
    <DropdownMenu>
      <OwnButtonGroup
        aria-label={`${label} actions`}
        className={[
          styles.group,
          buttonSizeClass(size),
          variant === "outline" ? styles.secondary : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <OwnButton
          variant={variant === "default" ? "default" : "outline"}
          className={styles.primary}
          type="button"
          onClick={onClick}
          disabled={disabled}
        >
          <motion.span
            className={styles.primarySlot}
            style={{ width }}
            aria-hidden="true"
          >
            <span ref={contentRef} className={styles.primaryContent}>
              {icon ? (
                <span className={styles.mainIcon}>
                  <AnimatePresence initial={false}>
                    <MotionSwap
                      key={glyph}
                      className={styles.iconPhase}
                      initial={reduced ? fadeIn : iconIn}
                      animate={rest}
                      exit={
                        reduced
                          ? {
                              opacity: 0,
                              transition: {
                                duration: motionTokens.reduced.duration,
                              },
                            }
                          : iconOut
                      }
                      transition={
                        reduced
                          ? { duration: motionTokens.reduced.duration }
                          : iconEnter
                      }
                    >
                      {icon}
                    </MotionSwap>
                  </AnimatePresence>
                </span>
              ) : null}
              <MorphText text={label} reduced={reduced} />
            </span>
          </motion.span>
          <span className={styles.srOnly} aria-live="polite">
            {label}
          </span>
        </OwnButton>
        <DropdownMenuTrigger asChild>
          <OwnButton
            variant="ghost"
            className={styles.trigger}
            type="button"
            aria-label={`${label} more actions`}
            disabled={disabled}
          >
            <ChevronDown
              className={styles.chevron}
              size="var(--rams-detail-split-chevron-size)"
              strokeWidth="var(--rams-detail-motion-button-glyph-stroke)"
              aria-hidden="true"
            />
          </OwnButton>
        </DropdownMenuTrigger>
      </OwnButtonGroup>
      <DropdownMenuContent
        className={styles.menu}
        sideOffset={floatingPlacement.motionSplitButton.anchorGapPx}
        align="end"
        collisionPadding={floatingPlacement.motionSplitButton.collisionInsetPx}
        loop
      >
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={action.label}
            className={[
              styles.item,
              action.destructive ? styles.destructive : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ "--rams-detail-i": index } as CSSProperties}
            disabled={action.disabled}
            onSelect={action.onSelect}
          >
            {action.icon ? (
              <span className={styles.icon} aria-hidden="true">
                {action.icon}
              </span>
            ) : null}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SplitButton;
