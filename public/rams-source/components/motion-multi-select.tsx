"use client";
import "./motion-fields.css";

import { ButtonBase as OwnButton } from "./button";
import { MotionPresenceButton as MotionOwnButton, MotionPresenceDiv } from "./presence-controls";

import { AnimatePresence, motion, useIsPresent, visualElementStore } from "motion/react";
import { Popover as Floating } from "radix-ui";
import { useReducedMotion } from "./use-motion-preference";
import type { HTMLMotionProps, Variants } from "motion/react";
import { ChevronDown, X } from "lucide-react";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motionTokens } from "./motion-tokens";
import type { CSSProperties } from "react";
import { contentPresentation } from "./content-presentation";
import styles from "./motion-multi-select.module.css";


export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  description?: string;
  maxVisible?: number;
  disabled?: boolean;
  className?: string;
  /** Applied to the actual portaled panel, not inherited from the trigger. */
  panelClassName?: string;
  panelStyle?: MenuPanelStyle;
}

const menuMotion = motionTokens.compoundMenus;

type MenuPanelStyle = CSSProperties & { [token: `--${string}`]: string | number | undefined };

const enter = motionTokens.ease.enter;
const standard = motionTokens.ease.standard;
/** Each chip sits in a slot whose width opens and collapses on a spring, so neighbours travel with it and nothing overlaps. */
const slot: Variants = {
  hidden: { width: 0, opacity: 0 },
  shown: { width: "auto", opacity: 1, transition: { width: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast, ease: enter } } },
  gone: { width: 0, opacity: 0, transition: { width: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.instant, ease: standard } } },
};
/** The chip itself grows in from .9 with a soft blur and shrinks back as it leaves. */
const chip: Variants = {
  hidden: { scale: menuMotion.chipScale, filter: `blur(${motionTokens.blur.soft}px)` },
  shown: { scale: 1, filter: "blur(0px)", transition: { ...motionTokens.spring.snappy, filter: { duration: motionTokens.duration.standard, ease: enter } } },
  gone: { scale: menuMotion.chipScale, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.instant, ease: standard } },
};
/** Reduced motion keeps short crossfades; resting states match the moving variants so server and client markup agree. */
const fade: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.instant } }, gone: { opacity: 0, transition: { duration: motionTokens.duration.instant } } };
const slotFade: Variants = { hidden: { opacity: 0 }, shown: { width: "auto", opacity: 1, transition: { duration: motionTokens.duration.instant } }, gone: { opacity: 0, transition: { duration: motionTokens.duration.instant } } };
const chipStill: Variants = { hidden: { scale: 1, filter: "blur(0px)" }, shown: { scale: 1, filter: "blur(0px)" }, gone: { scale: 1, filter: "blur(0px)" } };
/** The overflow count rolls: a larger number rises from below, a smaller one drops from above. */
const roll: Variants = {
  hidden: (direction: number) => ({ opacity: 0, y: `${direction * menuMotion.countTravelEm}em`, filter: `blur(${motionTokens.blur.subtle}px)` }),
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: enter } },
  gone: (direction: number) => ({ opacity: 0, y: `${-direction * menuMotion.countTravelEm}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.instant, ease: standard } }),
};

function ChipSlot(props: HTMLMotionProps<"span">) {
  const present = useIsPresent();
  return <motion.span {...props} data-exiting={present ? undefined : ""} />;
}

function CountDigit(props: HTMLMotionProps<"span">) {
  const present = useIsPresent();
  return <motion.span {...props} data-exiting={present ? undefined : ""} />;
}

/** A check that draws itself when an option is picked and retracts when it is removed. */
function CheckMark({ reduce }: { reduce: boolean | null }) {
  const present = useIsPresent();
  return <svg data-exiting={present ? undefined : ""} className={styles.check} width="var(--rams-detail-menu-glyph-size)" height="var(--rams-detail-menu-glyph-size)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="var(--rams-detail-menu-glyph-check-stroke)" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <motion.path d="M4 12.5 9 17.5 20 6.5" initial={reduce ? { opacity: 0 } : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} exit={reduce ? { opacity: 0 } : { pathLength: 0, opacity: 0 }} transition={reduce ? { duration: motionTokens.reduced.duration } : { pathLength: { duration: motionTokens.duration.standard, ease: enter }, opacity: { duration: motionTokens.duration.instant } }} />
  </svg>;
}

export function MultiSelect({ label, options, value, defaultValue = [], onValueChange, placeholder = "Select options", description, maxVisible = contentPresentation.multiSelect.defaultVisibleLabels, disabled = false, className, panelClassName, panelStyle }: MultiSelectProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [placementNode, setPlacementNode] = useState<HTMLSpanElement | null>(null);
  // Radix Portal mounts its children after the parent's first layout effect.
  // React 19 ref cleanup is identity-guarded so a retained exiting panel cannot detach a newer one.
  const placementRef = useCallback((probe: HTMLSpanElement | null) => {
    if (!probe) return;
    setPlacementNode(probe);
    return () => setPlacementNode(current => current === probe ? null : current);
  }, []);
  // Zero is only the unmeasured lifecycle state. Authored placement comes from the panel's CSS scope.
  const [placement, setPlacement] = useState({ offset: 0, collision: 0 });
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const focusRequest = useRef<number | null>(null);
  const [internal, setInternal] = useState(defaultValue);
  const [{ open, opening }, setOpenState] = useState({ open: false, opening: 0 });
  const setOpen = (next: boolean | ((current: boolean) => boolean)) => setOpenState(state => { const open = typeof next === "function" ? next(state.open) : next; return { open, opening: open && !state.open ? state.opening + 1 : state.opening }; });
  const visibleOpen = open && !disabled;
  useEffect(() => { if (disabled) setOpen(false); }, [disabled]);
  useLayoutEffect(() => {
    const probe = placementNode;
    if (!visibleOpen || !probe) return;
    let active = true;
    const measure = () => {
      if (!active) return;
      const style = getComputedStyle(probe);
      const offset = parseFloat(style.width), collision = parseFloat(style.height);
      if (!Number.isFinite(offset) || !Number.isFinite(collision) || offset < 0 || collision < 0) return;
      setPlacement(previous => previous.offset === offset && previous.collision === collision ? previous : { offset, collision });
    };
    measure();
    // Observe only the two resolved CSS lengths, not ancestors or arbitrary custom properties.
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(probe);
    return () => { active = false; observer.disconnect(); };
  }, [visibleOpen, placementNode, panelStyle, panelClassName]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const selected = value ?? internal;
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const labelFor = (item: string) => options.find((option) => option.value === item)?.label ?? item;
  const visible = selected.slice(0, maxVisible).map((item) => ({ value: item, label: labelFor(item) }));
  const remaining = Math.max(0, selected.length - visible.length);
  // A closed menu forgets its highlight, so the next open starts clean instead of on a stale hovered row.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) { setWasOpen(open); if (!open) setActiveIndex(-1); }
  const [previousRemaining, setPreviousRemaining] = useState(remaining);
  const [countDirection, setCountDirection] = useState(1);
  if (previousRemaining !== remaining) { setPreviousRemaining(remaining); setCountDirection(remaining > previousRemaining ? 1 : -1); }


  const update = (next: string[]) => { if (value === undefined) setInternal(next); onValueChange?.(next); };
  const toggle = (option: MultiSelectOption) => {
    if (disabled || option.disabled) return;
    update(selectedSet.has(option.value) ? selected.filter((item) => item !== option.value) : [...selected, option.value]);
  };
  const clear = () => { setOpen(false); triggerRef.current?.focus({ preventScroll: true }); update([]); };
  const enabled = options.map((option, index) => option.disabled ? -1 : index).filter((index) => index >= 0);
  // Keyboard entry moves focus into the listbox; pointer entry keeps the trigger in place.
  // Options are not extra Tab stops, so Tab can leave the widget naturally.
  const focusOption = (index: number) => {
    if (index < 0 || options[index]?.disabled) return;
    setActiveIndex(index);
    if (open) {
      focusRequest.current = null;
      optionRefs.current[index]?.focus();
    } else {
      focusRequest.current = index;
      setOpen(true);
    }
  };
  const closeMenu = () => {
    focusRequest.current = null;
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) closeMenu();
      else {
        const index = enabled.find(index => selectedSet.has(options[index]!.value)) ?? enabled[0];
        if (index === undefined) setOpen(true);
        else focusOption(index);
      }
      return;
    }
    if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); closeMenu(); return; }
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && enabled.length) {
      event.preventDefault();
      focusOption(event.key === "ArrowDown" ? enabled[0]! : enabled[enabled.length - 1]!);
    }
  };
  const onOptionKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "Tab") {
      // Return the native Tab origin to the inline widget before leaving its portal.
      const last = rootRef.current?.querySelector<HTMLButtonElement>('[aria-label="Clear selections"]:not(:disabled):not([inert])');
      (event.shiftKey ? triggerRef.current : last ?? triggerRef.current)?.focus({ preventScroll: true });
      setOpen(false); event.stopPropagation(); return;
    }
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closeMenu(); return; }
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggle(options[index]!); return; }
    const current = enabled.indexOf(index);
    const next = event.key === "Home" ? 0 : event.key === "End" ? enabled.length - 1
      : event.key === "ArrowDown" ? (current + 1) % enabled.length
        : event.key === "ArrowUp" ? (current - 1 + enabled.length) % enabled.length : -1;
    if (next < 0 || !enabled.length) return;
    event.preventDefault();
    focusOption(enabled[next]!);
  };
  const reduce = useReducedMotion();
  const retiringFrames = useRef(new Map<HTMLElement, number>());
  useLayoutEffect(() => {
    const node = menuRef.current;
    const view = node?.ownerDocument.defaultView;
    const preference = view?.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (visibleOpen || !node || !view || !preference || retiringFrames.current.has(node)) return;
    const sample = () => {
      if (!node.isConnected) { retiringFrames.current.delete(node); return; }
      if (preference.matches) { node.setAttribute("data-retired", ""); retiringFrames.current.delete(node); }
      else retiringFrames.current.set(node, view.requestAnimationFrame(sample));
    };
    retiringFrames.current.set(node, view.requestAnimationFrame(sample));
  }, [visibleOpen]);
  useEffect(() => {
    const frames = retiringFrames.current;
    return () => { frames.forEach((frame, node) => node.ownerDocument.defaultView?.cancelAnimationFrame(frame)); frames.clear(); };
  }, []);
  const [selectionSettled, setSelectionSettled] = useState(reduce);
  const selectionKey = JSON.stringify(selected);
  const previousSelection = useRef(selectionKey);
  useLayoutEffect(() => {
    if (reduce) setSelectionSettled(true);
    else if (previousSelection.current !== selectionKey) setSelectionSettled(false);
    previousSelection.current = selectionKey;
  }, [reduce, selectionKey]);
  const [countSettled, setCountSettled] = useState(reduce);
  const previousCount = useRef(remaining);
  useLayoutEffect(() => {
    if (reduce) setCountSettled(true);
    else if (previousCount.current !== remaining) setCountSettled(false);
    previousCount.current = remaining;
  }, [reduce, remaining]);
  useLayoutEffect(() => {
    if (!reduce || !menuRef.current) return;
    const visual = visualElementStore.get(menuRef.current);
    // Complete this panel's existing controls, including a retained exit.
    for (const key of ["opacity", "y", "scale"]) {
      const controls = visual?.getValue(key)?.animation;
      if (controls && "complete" in controls && typeof controls.complete === "function") controls.complete();
    }
  }, [reduce]);

  return <Floating.Root open={visibleOpen} onOpenChange={setOpen}><div ref={rootRef} className={[styles.field, className].filter(Boolean).join(" ")} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget) && !menuRef.current?.contains(event.relatedTarget)) setOpen(false); }}>
    <span id={labelId} className={styles.label}>{label}</span>
    <Floating.Anchor asChild><div className={styles.control}><OwnButton ref={triggerRef} type="button" className={`${styles.trigger} ${selected.length ? styles.hasClear : ""}`} disabled={disabled} aria-labelledby={`${labelId} ${valueId}`} aria-haspopup="listbox" aria-expanded={visibleOpen} aria-controls={`${id}-listbox`} onClick={() => setOpen((current) => !current)} onKeyDown={onKeyDown}>
      <span id={valueId} className={styles.srOnly}>{selected.length ? selected.map(labelFor).join(", ") : placeholder}</span>
      <span className={styles.value} data-settled={selectionSettled ? "" : undefined} aria-hidden="true">
        <AnimatePresence initial={false}>
          {visible.map((item) => <ChipSlot key={`chip-${item.value}`} className={styles.slot} variants={reduce ? ({ hidden: { opacity: 0 }, shown: { width: "auto", opacity: 1, transition: { duration: motionTokens.reduced.duration } }, gone: { opacity: 0, transition: { duration: motionTokens.reduced.duration } } }) : slot} initial="hidden" animate="shown" exit="gone" transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}><motion.span dir="auto" className={styles.chip} variants={reduce ? chipStill : chip} transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>{item.label}</motion.span></ChipSlot>)}
          {remaining > 0 && <ChipSlot key="more" className={styles.slot} variants={reduce ? ({ hidden: { opacity: 0 }, shown: { width: "auto", opacity: 1, transition: { duration: motionTokens.reduced.duration } }, gone: { opacity: 0, transition: { duration: motionTokens.reduced.duration } } }) : slot} initial="hidden" animate="shown" exit="gone" transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}><motion.span className={styles.more} variants={reduce ? chipStill : chip} transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>+<span className={styles.count} data-settled={countSettled ? "" : undefined}><AnimatePresence initial={false} custom={countDirection}><CountDigit key={remaining} custom={countDirection} variants={reduce ? ({ hidden: { opacity: 0 }, shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.reduced.duration } }, gone: { opacity: 0, transition: { duration: motionTokens.reduced.duration } } }) : roll} initial="hidden" animate="shown" exit="gone" transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>{remaining}</CountDigit></AnimatePresence></span></motion.span></ChipSlot>}
          {!selected.length && <motion.span key="placeholder" className={styles.placeholder} variants={reduce ? ({ hidden: { opacity: 0 }, shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.reduced.duration } }, gone: { opacity: 0, transition: { duration: motionTokens.reduced.duration } } }) : fade} initial="hidden" animate="shown" exit="gone" transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>{placeholder}</motion.span>}
        </AnimatePresence>
      </span>
      <ChevronDown className={styles.chevron} size="var(--rams-detail-menu-glyph-size)" aria-hidden="true" />
    </OwnButton>
    <AnimatePresence initial={false}>{selected.length > 0 && !disabled && <MotionOwnButton type="button" aria-label="Clear selections" className={styles.clear} onClick={clear}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: menuMotion.clearScale, filter: `blur(${motionTokens.blur.subtle}px)` }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transition: reduce ? { duration: motionTokens.reduced.duration } : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast } } }}
      exit={{ opacity: 0, ...(reduce ? {} : { scale: menuMotion.clearScale, filter: `blur(${motionTokens.blur.subtle}px)` }), transition: { duration: motionTokens.duration.instant, ease: standard } }}
      whileTap={{ scale: reduce ? 1 : menuMotion.revealScale, transition: { duration: motionTokens.duration.instant, ease: standard } }} transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}><X size="var(--rams-detail-menu-glyph-size)" aria-hidden="true" /></MotionOwnButton>}</AnimatePresence>
    <AnimatePresence initial={false}>
      {visibleOpen && <Floating.Portal forceMount><Floating.Content key={opening} forceMount asChild side="bottom" align="start" sideOffset={placement.offset} collisionPadding={placement.collision}
        onOpenAutoFocus={event => { event.preventDefault(); const index = focusRequest.current; focusRequest.current = null; if (index !== null) optionRefs.current[index]?.focus({ preventScroll: true }); }}
        onCloseAutoFocus={event => event.preventDefault()}
        onInteractOutside={event => { if (rootRef.current?.contains(event.target as Node)) event.preventDefault(); }}><MotionPresenceDiv ref={menuRef} id={`${id}-listbox`} className={[styles.menu, panelClassName].filter(Boolean).join(" ")} data-settled={selectionSettled ? "" : undefined} style={panelStyle} data-rams-menu-surface="" role="listbox" aria-label={label} aria-multiselectable="true"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -menuMotion.panelTravel, scale: menuMotion.panelScale }}
        animate={{ opacity: 1, y: 0, scale: 1, transition: reduce ? { duration: motionTokens.reduced.duration } : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: enter } } }}
        exit={{ opacity: 0, ...(reduce ? {} : { y: -menuMotion.panelTravel, scale: menuMotion.panelScale }), transition: { duration: motionTokens.duration.instant, ease: standard } }} transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>
        <span className={styles.placementMeasure} aria-hidden="true" inert><span ref={placementRef} className={styles.placement} /></span>
        {options.map((option, index) => <OwnButton ref={node => { optionRefs.current[index] = node; }} type="button" tabIndex={-1} role="option" aria-selected={selectedSet.has(option.value)} aria-disabled={option.disabled || undefined} key={option.value} className={styles.option} data-active={activeIndex === index} disabled={option.disabled} onKeyDown={event => onOptionKeyDown(event, index)} onFocus={() => setActiveIndex(index)} onPointerMove={() => { if (activeIndex !== index) setActiveIndex(index); }} onClick={() => toggle(option)}>
          <span>{option.label}</span><AnimatePresence initial={false}>{selectedSet.has(option.value) && <CheckMark key="check" reduce={reduce} />}</AnimatePresence>
        </OwnButton>)}
      </MotionPresenceDiv></Floating.Content></Floating.Portal>}
    </AnimatePresence>
    </div></Floating.Anchor>
    {description && <span className={styles.description}>{description}</span>}
  </div></Floating.Root>;
}
