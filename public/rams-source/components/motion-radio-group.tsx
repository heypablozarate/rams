"use client";
import "./motion-fields.css";
import { useEffect, useId, useLayoutEffect, useRef } from "react";
import { animate, motion } from "motion/react";
import { motionTransition } from "./motion-policy";
import { useReducedMotion } from "./use-motion-preference";
import {
  RadioGroup as OwnRadioGroup,
  RadioGroupItem as OwnRadioGroupItem,
} from "./radio-group";
import { motionTokens } from "./motion-tokens";
import styles from "./motion-radio-group.module.css";
export interface RadioGroupProps {
  label: string;
  options: { value: string; label: string; description?: string }[];
  value: string;
  onValueChange: (value: string) => void;
  name?: string;
  /** Accent is the existing selection palette; neutral follows the theme ink and surface. */
  tone?: "accent" | "neutral";
}

/** Sizes the highlight to the chosen row. A new choice moves the active indicator; the first paint and resizes place it at once. */
function place(
  highlight: HTMLElement | null,
  row: HTMLElement | null | undefined,
  at: { current: string },
  playback: { current: { stop: () => void } | null },
  glide: boolean,
) {
  const next = row ? `${row.offsetTop} ${row.offsetHeight}` : "";
  if (!highlight || (glide && next === at.current)) return;
  playback.current?.stop();
  const visible = at.current !== "";
  at.current = next;
  if (!row) {
    highlight.style.opacity = "0";
    playback.current = null;
    return;
  }
  const target = { y: row.offsetTop, height: row.offsetHeight, opacity: 1 };
  if (glide && visible) {
    playback.current = animate(highlight, target, {
      ...motionTransition("selection"),
      opacity: { duration: motionTokens.reduced.duration },
    });
    return;
  }
  // Written to the element too, so the paint that drops the server fallback already shows the highlight in place.
  Object.assign(highlight.style, {
    transform: `translateY(${target.y}px)`,
    height: `${target.height}px`,
    opacity: "1",
  });
  playback.current = animate(highlight, target, { duration: motionTokens.reduced.duration });
}

/** One highlight travels to the chosen row while the new dot springs in and the old one shrinks away, so a change reads as a single physical move. Arrow keys take the same path. Rows and text never resize. */
export function RadioGroup({
  label,
  options,
  value,
  onValueChange,
  name,
  tone = "accent",
}: RadioGroupProps) {
  const id = useId();
  const reduced = useReducedMotion();
  const listRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const rows = useRef<(HTMLLabelElement | null)[]>([]);
  const shown = useRef<number | null>(null);
  const at = useRef("");
  const playback = useRef<{ stop: () => void } | null>(null);
  const selected = options.findIndex((option) => option.value === value);
  useLayoutEffect(() => {
    place(
      highlightRef.current,
      rows.current[selected],
      at,
      playback,
      shown.current !== null && shown.current !== selected && !reduced,
    );
    shown.current = selected;
    listRef.current?.setAttribute("data-ready", "");
    return () => playback.current?.stop();
  }, [selected, reduced]);
  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() =>
      place(
        highlightRef.current,
        rows.current[shown.current ?? -1],
        at,
        playback,
        false,
      ),
    );
    observer.observe(list);
    rows.current.forEach((row) => row && observer.observe(row));
    return () => observer.disconnect();
  }, [options.length]);
  return (
    <fieldset className={styles.group} data-tone={tone}>
      <legend id={id}>{label}</legend>
      <OwnRadioGroup
        aria-labelledby={id}
        ref={listRef}
        className={styles.options}
        name={name}
        tone={tone}
        value={value}
        onValueChange={onValueChange}
      >
        <span
          ref={highlightRef}
          className={styles.highlight}
          aria-hidden="true"
        />
        {options.map((option, index) => {
          const checked = value === option.value;
          return (
            <label
              className={styles.option}
              key={option.value}
              ref={(node) => {
                rows.current[index] = node;
              }}
            >
              <OwnRadioGroupItem
                value={option.value}
                aria-labelledby={`${id}-label-${index}`}
                aria-describedby={
                  option.description ? `${id}-description-${index}` : undefined
                }
              />
              <span className={styles.mark} aria-hidden="true">
                {reduced ? (
                  <span
                    className={styles.dot}
                    style={{ opacity: checked ? 1 : 0 }}
                  />
                ) : (
                  <motion.span
                    className={styles.dot}
                    initial={false}
                    animate={
                      checked
                        ? { scale: 1, opacity: 1 }
                        : { scale: motionTokens.keyframes.radioGroup.dotEnterScale, opacity: 0 }
                    }
                    transition={
                      reduced
                        ? { duration: motionTokens.reduced.duration }
                        : {
                            ...motionTokens.spring.snappy,
                            opacity: {
                              duration: checked
                                ? motionTokens.duration.fast
                                : motionTokens.duration.instant,
                            },
                          }
                    }
                  />
                )}
              </span>
              <span>
                <strong id={`${id}-label-${index}`}>{option.label}</strong>
                {option.description && (
                  <small id={`${id}-description-${index}`}>
                    {option.description}
                  </small>
                )}
              </span>
            </label>
          );
        })}
      </OwnRadioGroup>
    </fieldset>
  );
}
