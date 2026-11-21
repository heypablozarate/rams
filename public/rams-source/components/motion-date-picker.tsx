"use client";
import "./motion-fields.css";

import { MotionPresenceDiv } from "./presence-controls";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ButtonHTMLAttributes, KeyboardEvent } from "react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { AnimatePresence, motion, visualElementStore } from "motion/react";
import { ButtonBase as OwnButton } from "./button";
import { useReducedMotion } from "./use-motion-preference";
import type { Variants } from "motion/react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { Calendar, type CalendarDateMatcher } from "./motion-calendar";
import { floatingPlacement } from "./floating-placement";
import { motionTokens } from "./motion-tokens";
import styles from "./motion-date-picker.module.css";

export interface DatePickerProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "onChange"> {
  label: string;
  value?: Date;
  onValueChange?: (date: Date | undefined) => void;
  description?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: CalendarDateMatcher;
  locale?: string;
  format?: Intl.DateTimeFormatOptions;
  /** Adds a Today button to the calendar header. */
  showToday?: boolean;
}

const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const { spring, duration, ease, blur } = motionTokens;
const instant = { duration: duration.instant };
/** Each part of the date rolls with time: a later date rises from below, an earlier one drops from above. Parts that did not change stay still. */
const valueRoll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * motionTokens.keyframes.menuValueSwap.selectValueEnterTravelEm}em`, filter: `blur(${blur.soft}px)` }),
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.standard, ease: ease.enter } },
  exit: (direction: number) => ({ opacity: 0, y: `${direction * -motionTokens.keyframes.menuValueSwap.exitTravelEm}em`, filter: `blur(${blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: ease.standard } }),
};
/** Reduced motion keeps a short crossfade; resting values match the roll so server and client markup agree. */
const valueFade: Variants = { enter: { opacity: 0 }, center: { opacity: 1, y: 0, filter: "blur(0px)", transition: instant }, exit: { opacity: 0, transition: instant } };
/** The footer confirms the pick: new copy rises in with a soft blur while the old line lifts away. */
const statusRise: Variants = {
  enter: { opacity: 0, y: `${motionTokens.keyframes.statusSwap.textOffsetEm}em`, filter: `blur(${blur.soft}px)` },
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: duration.standard, ease: ease.enter } },
  exit: { opacity: 0, y: `${-motionTokens.keyframes.statusSwap.textOffsetEm}em`, filter: `blur(${blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: ease.standard } },
};

export function DatePicker({ label, value, onValueChange: onChange, description, placeholder = "Select a date", minDate, maxDate, disabledDates, locale = "en-US", format = { month: "short", day: "numeric", year: "numeric" }, showToday, id, className, disabled, ...buttonProps }: DatePickerProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hintId = description ? `${controlId}-description` : undefined;
  const calendarPanHintId = `${controlId}-calendar-pan-hint`;
  const [open, setOpen] = useState(false);
  const [calendarCanPan, setCalendarCanPan] = useState(false);
  const [month, setMonth] = useState(monthStart(value ?? new Date()));
  const [opening, setOpening] = useState(0);
  const openingRef = useRef(0);
  const openRef = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [panPanel, setPanPanel] = useState<HTMLDivElement | null>(null);
  const attachPopover = useCallback((node: HTMLDivElement | null) => {
    popoverRef.current = node;
    setPanPanel(node);
  }, []);
  const closeTimer = useRef<number | undefined>(undefined);
  const formatter = new Intl.DateTimeFormat(locale, format);
  const reduce = useReducedMotion() ?? false;
  const cancelClose = useCallback(() => {
    if (closeTimer.current === undefined) return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = undefined;
  }, []);
  /** Closing hands focus back to the trigger when it was inside the calendar. */
  const close = useCallback((restore = true) => {
    cancelClose();
    if (restore && popoverRef.current?.contains(document.activeElement)) triggerRef.current?.focus({ preventScroll: true });
    openRef.current = false;
    setOpen(false);
  }, [cancelClose]);
  // A new transition prop does not finish an already running Motion spring.
  // Complete its existing controls, including a retained exit, so Presence
  // promises settle without a second animator or a delayed focus callback.
  useLayoutEffect(() => {
    if (!reduce) return;
    const node = popoverRef.current;
    if (!node) return;
    const visual = visualElementStore.get(node);
    for (const key of ["opacity", "y", "scale"]) {
      const controls = visual?.getValue(key)?.animation;
      if (controls && "complete" in controls && typeof controls.complete === "function") controls.complete();
    }
    if (closeTimer.current !== undefined && openRef.current) close();
  }, [close, reduce]);
  useLayoutEffect(() => {
    if (!open) return;
    const viewport = panPanel?.querySelector<HTMLElement>('[data-slot="calendar-dates-viewport"]');
    if (!viewport) return;
    const measure = () => setCalendarCanPan(viewport.scrollWidth > viewport.clientWidth);
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    // Text-size changes can resize the calendar plane without resizing the viewport.
    for (const child of viewport.children) observer.observe(child);
    return () => observer.disconnect();
  }, [open, panPanel]);
  const time = value?.getTime() ?? null;
  const [previousTime, setPreviousTime] = useState(time);
  const [direction, setDirection] = useState(1);
  if (previousTime !== time) { setPreviousTime(time); setDirection(time === null || previousTime === null || time >= previousTime ? 1 : -1); }
  const shown = value ? formatter.format(value) : placeholder;
  const parts = value ? formatter.formatToParts(value) : [];
  // Parts after a wider or narrower segment move on the same curve the new text arrives on, so they never overlap it.
  const partMotion = reduce ? { duration: motionTokens.reduced.duration } : { duration: duration.standard, ease: ease.enter };

  useEffect(() => cancelClose, [cancelClose]);
  /** The calendar always opens on the month of the current value, or today's month. */
  const show = () => { cancelClose(); setMonth(monthStart(value ?? new Date())); openingRef.current += 1; setOpening(openingRef.current); openRef.current = true; setOpen(true); };
  const changeOpen = (next: boolean) => next ? show() : close(false);
  /** A picked day lets the highlight glide onto it and the footer confirm it, then the calendar returns to the field. */
  const selectDate = (date: Date | undefined) => {
    const cycle = openingRef.current;
    onChange?.(date);
    cancelClose();
    if (!openRef.current || openingRef.current !== cycle) return;
    if (reduce || !date) close();
    else closeTimer.current = window.setTimeout(() => {
      closeTimer.current = undefined;
      if (openRef.current && openingRef.current === cycle) close();
    }, motionTokens.keyframes.datePicker.selectionSettleMs);
  };
  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    buttonProps.onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if ((event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") && !open) { event.preventDefault(); show(); }
    if (event.key === "Escape") close();
  };
  return <PopoverPrimitive.Root open={open} onOpenChange={changeOpen}><div className={[styles.field, className].filter(Boolean).join(" ")} data-open={open || undefined}>
    <label className={styles.label} htmlFor={controlId}>{label}</label>
    <div className={styles.anchor}>
      <PopoverPrimitive.Trigger asChild><OwnButton {...buttonProps} variant="ghost" ref={triggerRef} id={controlId} type="button" disabled={disabled} aria-haspopup="dialog" aria-expanded={open} aria-describedby={hintId} className={styles.trigger} onKeyDown={onTriggerKeyDown}>
        <CalendarDays size="var(--rams-detail-date-picker-motion-trigger-glyph-size)" strokeWidth="var(--rams-detail-date-picker-motion-trigger-glyph-stroke)" aria-hidden="true" />
        <span className={styles.srOnly}>{shown}</span>
        <span className={styles.valueText} aria-hidden="true">
          <AnimatePresence mode="popLayout" initial={false} custom={1}>
            {value ? <motion.span key="value" className={styles.value} custom={1} variants={reduce ? ({ enter: { opacity: 0 }, center: { opacity: 1, y: 0, filter: "blur(0px)", transition: ({ duration: motionTokens.reduced.duration }) }, exit: { opacity: 0, transition: ({ duration: motionTokens.reduced.duration }) } }) : valueRoll} initial="enter" animate="center" exit="exit" transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>
              {parts.map((part, index) => <motion.span key={`${index}-${part.type}`} className={styles.part} layout="position" layoutDependency={time} transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : partMotion}>
                {part.type === "literal" ? <span className={styles.partValue}>{part.value}</span> : <AnimatePresence mode="popLayout" initial={false} custom={direction}><motion.span key={part.value} className={styles.partValue} custom={direction} variants={reduce ? ({ enter: { opacity: 0 }, center: { opacity: 1, y: 0, filter: "blur(0px)", transition: ({ duration: motionTokens.reduced.duration }) }, exit: { opacity: 0, transition: ({ duration: motionTokens.reduced.duration }) } }) : valueRoll} initial="enter" animate="center" exit="exit" transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>{part.value}</motion.span></AnimatePresence>}
              </motion.span>)}
            </motion.span> : <motion.span key="placeholder" className={styles.placeholder} custom={-1} variants={reduce ? ({ enter: { opacity: 0 }, center: { opacity: 1, y: 0, filter: "blur(0px)", transition: ({ duration: motionTokens.reduced.duration }) }, exit: { opacity: 0, transition: ({ duration: motionTokens.reduced.duration }) } }) : valueRoll} initial="enter" animate="center" exit="exit" transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>{placeholder}</motion.span>}
          </AnimatePresence>
        </span>
        <ChevronDown className={styles.chevron} size="var(--rams-detail-date-picker-motion-trigger-glyph-size)" strokeWidth="var(--rams-detail-date-picker-motion-trigger-glyph-stroke)" aria-hidden="true" />
      </OwnButton></PopoverPrimitive.Trigger>
      <AnimatePresence>
        {open && <PopoverPrimitive.Portal forceMount><PopoverPrimitive.Content key={opening} forceMount asChild side="bottom" align="start" sideOffset={floatingPlacement.motionDatePicker.anchorGapPx} collisionPadding={floatingPlacement.motionDatePicker.collisionInsetPx}
          onOpenAutoFocus={event => { event.preventDefault(); const day = popoverRef.current?.querySelector<HTMLButtonElement>('[data-present] [data-date][tabindex="0"]'); (day ?? popoverRef.current)?.focus({ preventScroll: true }); }}
          onCloseAutoFocus={event => event.preventDefault()} onEscapeKeyDown={event => { event.preventDefault(); close(); }}
          ><MotionPresenceDiv tabIndex={-1} ref={attachPopover} className={styles.popover} role="dialog" aria-label={`${label} calendar`} aria-describedby={calendarCanPan ? calendarPanHintId : undefined}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -motionTokens.keyframes.datePicker.panelEnterTravelPx, scale: motionTokens.keyframes.datePicker.panelEnterScale }}
          animate={{ opacity: 1, y: 0, scale: 1, transition: reduce ? ({ duration: motionTokens.reduced.duration }) : { ...spring.snappy, opacity: { duration: duration.fast, ease: ease.enter } } }}
          exit={{ opacity: 0, ...(reduce ? {} : { y: -motionTokens.keyframes.datePicker.panelExitTravelPx, scale: motionTokens.keyframes.datePicker.panelExitScale }), transition: { duration: motionTokens.duration.fast, ease: ease.standard } }} transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>
          {calendarCanPan && <p id={calendarPanHintId} className={styles.description} dir="auto" style={{ margin: 0 }}>Scroll for more dates.</p>}
          <Calendar value={value} onValueChange={selectDate} month={month} onMonthChange={setMonth} minDate={minDate} maxDate={maxDate} disabledDates={disabledDates} locale={locale} showToday={showToday} />
          <div className={styles.footer}><OwnButton type="button" variant="ghost" onClick={() => selectDate(undefined)} disabled={!value}>Clear</OwnButton><span className={styles.status}><AnimatePresence initial={false}><motion.span key={time ?? "none"} variants={reduce ? ({ enter: { opacity: 0 }, center: { opacity: 1, y: 0, filter: "blur(0px)", transition: ({ duration: motionTokens.reduced.duration }) }, exit: { opacity: 0, transition: ({ duration: motionTokens.reduced.duration }) } }) : statusRise} initial="enter" animate="center" exit="exit" transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>{value ? `Selected ${formatter.format(value)}` : "Choose a day"}</motion.span></AnimatePresence></span></div>
        </MotionPresenceDiv></PopoverPrimitive.Content></PopoverPrimitive.Portal>}
      </AnimatePresence>
    </div>
    {description && <span id={hintId} className={styles.description}>{description}</span>}
  </div></PopoverPrimitive.Root>;
}
