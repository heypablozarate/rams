"use client";
import "./motion-fields.css";

import { useEffect, useId, useLayoutEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { LayoutGroup, motion } from "motion/react";
import { Button } from "./button";
import { useReducedMotion } from "./use-motion-preference";
import { motionTokens } from "./motion-tokens";
import { motionTransition } from "./motion-policy";
import styles from "./motion-segmented-control.module.css";

export interface Segment { value: string; label: string; /** Optional content after the label, such as a badge. */ accessory?: ReactNode; }
export interface SegmentedControlProps {
  options: Segment[];
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  /** Called when the pointer or focus reaches an option, before it is chosen. Use it to start loading what that option shows. */
  onOptionIntent?: (value: string) => void;
  className?: string;
}

export default function SegmentedControl({ options, value, onValueChange, label, onOptionIntent, className }: SegmentedControlProps) {
  const id = useId();
  const reduced = useReducedMotion();
  const track = useRef<HTMLDivElement>(null);
  const edgeTolerance = motionTokens.keyframes.tabs.scrollEdgeTolerancePx;
  const ownedScroll = useRef<number | null>(null);
  const previous = useRef({ value, reduced });

  // When the options are wider than the container, the track scrolls inside itself. Edges fade only on the side with more to see.
  useLayoutEffect(() => {
    const node = track.current;
    if (!node) return;
    const edges = () => {
      const maximum = Math.max(0, node.scrollWidth - node.clientWidth);
      const rtl = getComputedStyle(node).direction === "rtl";
      if (ownedScroll.current !== null && Math.abs(node.scrollLeft - ownedScroll.current) <= edgeTolerance) ownedScroll.current = null;
      node.toggleAttribute("data-fade-start", rtl ? node.scrollLeft > -maximum + edgeTolerance : node.scrollLeft > edgeTolerance);
      node.toggleAttribute("data-fade-end", rtl ? node.scrollLeft < -edgeTolerance : node.scrollLeft < maximum - edgeTolerance);
    };
    edges();
    const releaseOwnership = () => { ownedScroll.current = null; };
    node.addEventListener("scroll", edges, { passive: true });
    node.addEventListener("scrollend", releaseOwnership);
    node.addEventListener("wheel", releaseOwnership, { passive: true });
    node.addEventListener("touchmove", releaseOwnership, { passive: true });
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(edges);
    observer?.observe(node);
    return () => { node.removeEventListener("scroll", edges); node.removeEventListener("scrollend", releaseOwnership); node.removeEventListener("wheel", releaseOwnership); node.removeEventListener("touchmove", releaseOwnership); observer?.disconnect(); };
  }, [options.length]);

  // The selected option is always scrolled fully into view, with a little room so it clears the fade.
  const first = useRef(true);
  useEffect(() => {
    const node = track.current;
    const button = node?.querySelector<HTMLElement>('[aria-pressed="true"]');
    const prior = previous.current;
    previous.current = { value, reduced };
    if (!node || !button || node.scrollWidth <= node.clientWidth) { first.current = false; ownedScroll.current = null; return; }
    if (!first.current && prior.value === value && prior.reduced !== reduced) {
      if (reduced && ownedScroll.current !== null && Math.abs(node.scrollLeft - ownedScroll.current) > edgeTolerance) node.scrollTo({ left: ownedScroll.current, behavior: "auto" });
      ownedScroll.current = null;
      return;
    }
    // offsetLeft may belong to the page or another positioned ancestor.
    // Selection scrolling is relative to this track's actual visible viewport.
    // Resolve the same scoped CSS length as the edge mask, including rem/calc overrides.
    const measure = node.ownerDocument.createElement("span");
    measure.setAttribute("aria-hidden", "true");
    measure.style.cssText = "position:fixed;inset:0;inline-size:var(--rams-detail-segmented-edge-fade);block-size:0;box-sizing:content-box;padding:0;border:0;visibility:hidden;pointer-events:none";
    node.appendChild(measure);
    const room = measure.getBoundingClientRect().width;
    measure.remove();
    const trackBounds = node.getBoundingClientRect(), selectedBounds = button.getBoundingClientRect();
    const delta = selectedBounds.left < trackBounds.left + room ? selectedBounds.left - trackBounds.left - room
      : selectedBounds.right > trackBounds.right - room ? selectedBounds.right - trackBounds.right + room : 0;
    const maximum = Math.max(0, node.scrollWidth - node.clientWidth);
    const rtl = getComputedStyle(node).direction === "rtl";
    const target = rtl ? Math.min(0, Math.max(-maximum, node.scrollLeft + delta)) : Math.max(0, Math.min(maximum, node.scrollLeft + delta));
    if (target !== node.scrollLeft) {
      const behavior = first.current || reduced ? "auto" : "smooth";
      ownedScroll.current = behavior === "smooth" ? target : null;
      node.scrollTo({ left: target, behavior });
    } else ownedScroll.current = null;
    first.current = false;
  }, [value, reduced]);

  // Arrow keys, Home and End move the selection like a tab list; only the selected option is a tab stop.
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const last = options.length - 1;
    const target = event.key === "ArrowRight" || event.key === "ArrowDown" ? (selectedIndex === last ? 0 : selectedIndex + 1)
      : event.key === "ArrowLeft" || event.key === "ArrowUp" ? (selectedIndex === 0 ? last : selectedIndex - 1)
        : event.key === "Home" ? 0 : event.key === "End" ? last : -1;
    if (target < 0 || !options[target]) return;
    event.preventDefault();
    onValueChange(options[target].value);
    track.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(options[target].value)}"]`)?.focus({ preventScroll: true });
  };

  return <div className={`${styles.root} ${className ?? ""}`} role="group" aria-label={label}>
    <LayoutGroup id={id}><motion.div ref={track} layoutScroll className={styles.track}>
      {options.map((option, index) => <Button variant="ghost" key={option.value} id={`${id}-${option.value}`} className={styles.button} type="button" data-value={option.value} aria-pressed={value === option.value} tabIndex={index === selectedIndex ? 0 : -1} onClick={() => onValueChange(option.value)} onKeyDown={onKeyDown} onPointerEnter={onOptionIntent ? () => onOptionIntent(option.value) : undefined} onFocus={onOptionIntent ? () => onOptionIntent(option.value) : undefined}>
        {value === option.value && (reduced
          ? <span className={styles.selection} aria-hidden="true" />
          : <motion.span className={styles.selection} layoutId="selection" layoutDependency={value} transition={motionTransition("selection")} aria-hidden="true" />)}
        <span className={styles.label}>{option.label}{option.accessory}</span>
      </Button>)}
    </motion.div></LayoutGroup>
  </div>;
}
