"use client";
import "./motion-fields.css";

import { MotionSwap } from "./motion-swap";
import { MotionPresenceDiv } from "./presence-controls";

import { Popover as PopoverPrimitive } from "radix-ui";

import { AnimatePresence, motion, visualElementStore } from "motion/react";
import { floatingPlacement } from "./floating-placement";
import { ButtonBase as OwnButton } from "./button";
import { useReducedMotion } from "./use-motion-preference";
import type { Variants } from "motion/react";
import { ChevronDown, Clock3 } from "lucide-react";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { motionTokens } from "./motion-tokens";
import { collectionPresentation } from "./collection-presentation";
import styles from "./motion-time-picker.module.css";

export interface TimePickerProps {
  label: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  description?: string;
  placeholder?: string;
  minuteStep?: 1 | 5 | 10 | 15 | 30;
  format?: "12h" | "24h";
  disabled?: boolean;
  className?: string;
}

const pad = (value: number) => String(value).padStart(2, "0");
const toMinutes = (value: string) => { const [h = NaN, m = NaN] = value.split(":").map(Number); return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : 0; };
const placement = floatingPlacement.motionDropdown;
const presentation = motionTokens.keyframes.timePicker;
const valueTravel = motionTokens.keyframes.menuValueSwap;
const popupScale = motionTokens.keyframes.popover;
const glyphSize = "var(--rams-detail-time-picker-glyph-size)";
const enter = motionTokens.ease.enter;
const standard = motionTokens.ease.standard;
/** The shown time rolls like a clock face: a later time rises from below, an earlier one drops from above. */
const valueRoll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * valueTravel.selectValueEnterTravelEm}em`, filter: `blur(${motionTokens.blur.soft}px)` }),
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: enter } },
  exit: (direction: number) => ({ opacity: 0, y: `${-direction * valueTravel.exitTravelEm}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: standard } }),
};
export function TimePicker({ label, value, defaultValue = "09:00", onValueChange: onChange, description, placeholder = "Select a time", minuteStep = collectionPresentation.timePickerDefaultStepMinutes, format = "12h", disabled = false, className }: TimePickerProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const [menu, setMenu] = useState<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const centerOnOpen = useRef(false);
  const [internal, setInternal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [popupDirection, setPopupDirection] = useState<"ltr" | "rtl">("ltr");
  const [opening, setOpening] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const selected = value ?? internal;
  const reduce = useReducedMotion();
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    if (!open || !trigger) return;
    const sync = () => setPopupDirection(getComputedStyle(trigger).direction === "rtl" ? "rtl" : "ltr");
    sync();
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(sync);
    for (let element: Element | null = trigger; element; element = element.parentElement) {
      observer.observe(element, { attributes: true, attributeFilter: ["dir", "class", "style"] });
    }
    return () => observer.disconnect();
  }, [open]);
  // A new transition prop does not finish an already running Motion spring.
  // Complete its existing controls, including a retained exit, so Presence
  // promises settle without a second animator or a delayed focus callback.
  useLayoutEffect(() => {
    if (!reduce) return;
    const node = menu;
    if (!node) return;
    const visual = visualElementStore.get(node);
    for (const key of ["opacity", "y", "scale"]) {
      const controls = visual?.getValue(key)?.animation;
      if (controls && "complete" in controls && typeof controls.complete === "function") controls.complete();
    }
  }, [reduce, menu]);
  const [previous, setPrevious] = useState(selected);
  const [direction, setDirection] = useState(1);
  if (previous !== selected) { setPrevious(selected); setDirection(toMinutes(selected) >= toMinutes(previous) ? 1 : -1); }
  const options = Array.from({ length: Math.ceil(1440 / minuteStep) }, (_, index) => { const minutes = index * minuteStep; const hour = Math.floor(minutes / 60); const minute = minutes % 60; return `${pad(hour)}:${pad(minute)}`; });
  const display = (raw: string) => { const minutes = toMinutes(raw); const hour = Math.floor(minutes / 60); const minute = minutes % 60; return format === "24h" ? `${pad(hour)}:${pad(minute)}` : `${hour % 12 || 12}:${pad(minute)} ${hour < 12 ? "AM" : "PM"}`; };
  // Runs before paint so the menu's first frame is already centered on the selected time.
  const revealActive = () => {
    if (!open || activeIndex < 0) return;
    // Scroll only the menu, never the page: the selected time opens centered, arrow keys then keep the highlight in view.
    const option = optionRefs.current[activeIndex];
    const menu = option?.parentElement;
    if (!option || !menu) return;
    // Popper supplies available space after mounting its portal; do not consume
    // the opening scroll request while the menu still has its intrinsic height.
    if (typeof ResizeObserver !== "undefined" && !getComputedStyle(menu).getPropertyValue("--radix-popover-content-available-height").trim()) return;
    const top = option.offsetTop;
    const bottom = top + option.offsetHeight;
    if (centerOnOpen.current) { centerOnOpen.current = false; menu.scrollTop = top - (menu.clientHeight - option.offsetHeight) / 2; }
    else if (top < menu.scrollTop) menu.scrollTop = top;
    else if (bottom > menu.scrollTop + menu.clientHeight) menu.scrollTop = bottom - menu.clientHeight;
  };
  useLayoutEffect(() => {
    if (!open || !menu) return;
    revealActive();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(revealActive);
    observer?.observe(menu);
    return () => observer?.disconnect();
  }, [activeIndex, open, menu]);
  const choose = (next: string) => {
    // Restore only focus owned by a departing option, before the consumer callback can move it elsewhere.
    if (optionRefs.current.some(option => option === document.activeElement)) triggerRef.current?.focus({ preventScroll: true });
    if (value === undefined) setInternal(next);
    onChange?.(next); setOpen(false);
  };
  const openMenu = () => {
    const selectedIndex = options.indexOf(selected);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    centerOnOpen.current = true;
    setOpening(cycle => cycle + 1);
    setOpen(true);
  };
  const close = (restore = false) => {
    if (restore && (document.activeElement === triggerRef.current || menu?.contains(document.activeElement))) triggerRef.current?.focus({ preventScroll: true });
    setOpen(false);
  };
  const changeOpen = (next: boolean) => next ? openMenu() : close();
  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") { event.preventDefault(); close(true); return; }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open && activeIndex >= 0) choose(options[activeIndex]!);
      else openMenu();
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) { openMenu(); return; }
      const next = (activeIndex + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
      setActiveIndex(next);
      if (menu?.contains(document.activeElement)) optionRefs.current[next]?.focus({ preventScroll: true });
    }
  };
  const valueClass = selected ? styles.value : styles.placeholder;
  const displayedValue = selected ? display(selected) : placeholder;
  return <PopoverPrimitive.Root open={open} onOpenChange={changeOpen}><div className={[styles.field, className].filter(Boolean).join(" ")}>
    <span id={labelId} className={styles.label}>{label}</span>
    <div className={styles.anchor}>
      <PopoverPrimitive.Trigger asChild><OwnButton ref={triggerRef} type="button" variant="ghost" className={styles.trigger} disabled={disabled} aria-labelledby={`${labelId} ${valueId}`} aria-describedby={description ? `${id}-description` : undefined} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-listbox`} onKeyDown={onKeyDown}>
        <Clock3 size={glyphSize} aria-hidden="true" />
        <span id={valueId} className={styles.srOnly}>{displayedValue}</span>
        <span className={styles.valueText} aria-hidden="true">
          {reduce ? <span className={valueClass}>{displayedValue}</span>
            : <AnimatePresence initial={false} custom={direction}>
                <MotionSwap key={selected || "placeholder"} className={valueClass} custom={direction}
                  variants={valueRoll} initial="enter" animate="center" exit="exit">
                  {displayedValue}
                </MotionSwap>
              </AnimatePresence>}
        </span>
        <ChevronDown className={styles.chevron} size={glyphSize} aria-hidden="true" />
      </OwnButton></PopoverPrimitive.Trigger>
      <AnimatePresence initial={false}>{open && <PopoverPrimitive.Portal forceMount><PopoverPrimitive.Content key={opening} forceMount asChild dir={popupDirection} side="bottom" align="start" sideOffset={placement.anchorGapPx} collisionPadding={placement.collisionInsetPx} role="listbox"
        onOpenAutoFocus={event => event.preventDefault()} onCloseAutoFocus={event => event.preventDefault()} onEscapeKeyDown={event => { event.preventDefault(); close(true); }}
        ><MotionPresenceDiv ref={setMenu} onKeyDown={onKeyDown} id={`${id}-listbox`} className={styles.menu} role="listbox" aria-label={`${label} options`}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: presentation.popupEnterY, scale: popupScale.enterScale }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: reduce ? { duration: motionTokens.reduced.duration } : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: enter } } }}
        exit={{ opacity: 0, ...(reduce ? {} : { y: presentation.popupExitY, scale: popupScale.exitScale }), transition: { duration: motionTokens.duration.instant, ease: standard } }} transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>
        {options.map((option, index) => <button ref={node => { optionRefs.current[index] = node; }} id={`${id}-option-${index}`} type="button" role="option" aria-selected={option === selected} data-active={activeIndex === index || undefined} className={styles.option} key={option} onFocus={() => setActiveIndex(index)} onPointerMove={() => { if (activeIndex !== index) setActiveIndex(index); }} onClick={() => choose(option)}><bdi dir="ltr">{display(option)}</bdi>{option === selected && <span className={styles.dot} aria-hidden="true" />}</button>)}
      </MotionPresenceDiv></PopoverPrimitive.Content></PopoverPrimitive.Portal>}</AnimatePresence>
    </div>
    {description && <span id={`${id}-description`} className={styles.description}>{description}</span>}
  </div></PopoverPrimitive.Root>;
}
