"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, ReactNode } from "react";
import { DropdownMenu as DropdownPrimitive } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { MotionSwap } from "@/variants/motion-swap";
import { Button } from "@/primitives/button";
import { useMenuViewportRevealRef } from "@/primitives/menu-parts";
import { ChevronDown } from "rams-icons";
import { floatingPlacement } from "@/primitives/floating-placement";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import styles from "./dropdown-menu.module.css";

export interface DropdownItem { label: string; onSelect?: () => void; disabled?: boolean; icon?: ReactNode; destructive?: boolean; separatorBefore?: boolean; }
export interface DropdownMenuProps { label: string; items: DropdownItem[]; icon?: ReactNode; }

type Highlight = { top: number; height: number; danger: boolean; glide: boolean };

/** A new trigger label rises in while the old one leaves, and the trigger width springs to the measured text instead of snapping. */
function TriggerLabel({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const measure = useRef<HTMLSpanElement>(null);
  const measured = useRef<string | null>(null);
  const [size, setSize] = useState<{ width: number | "auto"; animate: boolean }>({ width: "auto", animate: false });
  useLayoutEffect(() => {
    const node = measure.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const current = node.textContent;
      // Only a text change morphs; the first measure and font swaps settle instantly.
      const animate = measured.current !== null && measured.current !== current;
      measured.current = current;
      setSize({ width: Math.ceil(entry.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth), animate });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <motion.span className={styles.label} initial={false} animate={{ width: size.width }} transition={size.animate && !reduced ? motionTokens.spring.morph : { duration: motionTokens.reduced.duration }}>
    <span ref={measure} className={styles.labelMeasure} aria-hidden="true">{text}</span>
    <AnimatePresence mode="popLayout" initial={false}>
      <MotionSwap key={text} aria-hidden="true" className={styles.labelText} initial={reduced ? false : { opacity: 0, y: `${motionTokens.keyframes.menuValueSwap.dropdownLabelEnterTravelEm}em`, filter: `blur(${motionTokens.blur.soft}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduced ? { opacity: 0, transition: { duration: motionTokens.reduced.duration } } : { opacity: 0, y: `${-motionTokens.keyframes.menuValueSwap.exitTravelEm}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}>{text}</MotionSwap>
    </AnimatePresence>
  </motion.span>;
}

export function DropdownMenu({ label, items, icon }: DropdownMenuProps) {
  const reduced = useReducedMotion();
  const contentRef = useMenuViewportRevealRef();
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const pointer = useRef(false);
  const clearTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(clearTimer.current), []);
  // Radix focuses the highlighted item (pointer or keyboard) and the content when the pointer leaves an item.
  function onMenuFocus(event: FocusEvent<HTMLDivElement>) {
    const item = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[role="menuitem"]') : null;
    window.clearTimeout(clearTimer.current);
    if (!item) {
      // A short grace period keeps the highlight gliding across separators and item gaps.
      clearTimer.current = window.setTimeout(() => setHighlight(null), pointer.current ? motionTokens.menuHighlight.pointerGapGraceMs : 0);
      return;
    }
    const next = { top: item.offsetTop, height: item.offsetHeight, danger: item.dataset.tone === "danger" };
    const glide = pointer.current;
    setHighlight(current => ({ ...next, glide: glide && current !== null }));
  }
  return <DropdownPrimitive.Root onOpenChange={open => { if (open) { window.clearTimeout(clearTimer.current); setHighlight(null); } }}>
    <DropdownPrimitive.Trigger asChild>
      <Button className={styles.trigger} variant="ghost" size="sm" type="button" aria-label={label}>
        {icon && <span className={styles.triggerIcon} aria-hidden="true">{icon}</span>}
        <TriggerLabel text={label}/>
        <ChevronDown className={styles.chevron} strokeWidth="var(--rams-detail-menu-glyph-stroke)" aria-hidden="true"/>
      </Button>
    </DropdownPrimitive.Trigger>
    <DropdownPrimitive.Portal><DropdownPrimitive.Content ref={contentRef} data-rams-menu-surface="" className={styles.menu} sideOffset={floatingPlacement.motionDropdown.anchorGapPx} align="end" collisionPadding={floatingPlacement.motionDropdown.collisionInsetPx} loop onFocus={onMenuFocus} onPointerMoveCapture={() => { pointer.current = true; }} onKeyDownCapture={() => { pointer.current = false; }}>
      {/* One highlight glides between items for the pointer and jumps instantly for the keyboard. */}
      <motion.span className={styles.highlight} data-tone={highlight?.danger ? "danger" : undefined} aria-hidden="true" initial={false} animate={highlight ? { y: highlight.top, height: highlight.height, opacity: 1 } : { opacity: 0 }} transition={{ default: highlight?.glide && !reduced ? motionTokens.spring.snappy : { duration: motionTokens.reduced.duration }, opacity: { duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.instant } }}/>
      {items.map((item, index) => <Fragment key={item.label}>{item.separatorBefore && <DropdownPrimitive.Separator className={styles.separator}/>}<DropdownPrimitive.Item className={[styles.item, item.destructive ? styles.destructive : ""].filter(Boolean).join(" ")} data-tone={item.destructive ? "danger" : undefined} style={{ "--rams-detail-i": index } as CSSProperties} disabled={item.disabled} onSelect={item.onSelect}>{item.icon && <span className={styles.icon} aria-hidden="true">{item.icon}</span>}{item.label}</DropdownPrimitive.Item></Fragment>)}
    </DropdownPrimitive.Content></DropdownPrimitive.Portal>
  </DropdownPrimitive.Root>;
}

export default DropdownMenu;
