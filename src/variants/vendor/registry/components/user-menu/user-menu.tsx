"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ComponentProps, CSSProperties, FocusEvent, KeyboardEvent, MouseEvent, PointerEvent, ReactNode, Ref } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { MotionRegion, MotionSwap } from "@/variants/motion-swap";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { userMenuCompactQuery } from "@/primitives/user-menu-compact-query";
import type { PanInfo, Transition, Variants } from "motion/react";
import { ChevronDown, LoaderCircle, LogOut, Monitor, Moon, Sun, SunMoon } from "rams-icons";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import styles from "./user-menu.module.css";

export type UserStatus = "available" | "busy" | "away";
export type ThemePreference = "light" | "dark" | "system";

/** Statuses in menu order. Each one has its own dot shape as well as color: solid, barred, or hollow. */
export const userStatuses: { value: UserStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "away", label: "Away" },
];

const themes: { value: ThemePreference; label: string; icon: ReactNode }[] = [
  { value: "light", label: "Light", icon: <Sun size="var(--rams-detail-user-menu-preference-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" aria-hidden="true" /> },
  { value: "dark", label: "Dark", icon: <Moon size="var(--rams-detail-user-menu-preference-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" aria-hidden="true" /> },
  { value: "system", label: "System", icon: <Monitor size="var(--rams-detail-user-menu-preference-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" aria-hidden="true" /> },
];

export interface UserMenuUser { name: string; email: string; plan?: string; avatarSrc?: string; avatarSrcSet?: string }
export interface UserMenuItem { label: string; icon?: ReactNode; keys?: string[]; onSelect?: () => void }

/**
 * The account menu behind a person's photo in an app's top bar. It holds a compact identity header, a short group of account
 * destinations, an inline theme switch, and sign out. On compact screens it opens as a bottom sheet instead.
 * Theme and status choices keep the menu open; everything else closes it and returns focus to the trigger.
 * When `onSignOut` returns a promise, the item shows its progress and the menu closes once it settles.
 */
export interface UserMenuProps {
  user: UserMenuUser;
  /** Presence status. Passing `status` or `onStatusChange` shows the presence dot and an inline status switch. */
  status?: UserStatus;
  defaultStatus?: UserStatus;
  onStatusChange?: (status: UserStatus) => void;
  theme?: ThemePreference;
  defaultTheme?: ThemePreference;
  /** Reports the choice. Applying it to the page is up to the app. */
  onThemeChange?: (theme: ThemePreference) => void;
  /** Shows the inline light, dark, and system switch. */
  showTheme?: boolean;
  /** Account destinations with optional shortcut hints, such as ["⌘", ","]. Keep it to three or four. */
  items?: UserMenuItem[];
  onSignOut?: () => void | Promise<unknown>;
  signOutKeys?: string[];
  /** Align the panel to the logical start, center, or end of the trigger. */
  align?: "start" | "center" | "end";
  /** Shows the name and a chevron beside the avatar on wider screens. */
  showName?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Renders the desktop panel in a portal on the body. Pass false to keep it inside the trigger's wrapper. */
  portal?: boolean;
  /** The trigger button, for returning focus after the menu is swapped out. */
  ref?: Ref<HTMLButtonElement>;
  className?: string;
  /** Applies to the portaled panel/sheet, not its trigger. */
  panelClassName?: string;
  panelStyle?: CSSProperties;
}

type Highlight = { top: number; height: number; tone?: string; glide: boolean };
type OpenReason = "first" | "last" | "pointer" | null;

const compactQuery = userMenuCompactQuery;
const subscribeCompact = (change: () => void) => { const query = window.matchMedia(compactQuery); query.addEventListener("change", change); return () => query.removeEventListener("change", change); };
const subscribeNothing = () => () => {};
const statusLabel = (status: UserStatus) => userStatuses.find(option => option.value === status)?.label ?? status;
const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const exitEase = [...motionTokens.keyframes.userMenuExit.curve] as [number, number, number, number];

/** The panel grows out of the trigger on a critically damped spring; rows follow a beat later. Closing is a short fade. */
const groupHandoff = Math.min(motionTokens.sequence.handoff, Math.max(0, motionTokens.sequence.maxStagger - motionTokens.stagger.item));
const groupStep = (count: number) => Math.min(motionTokens.stagger.item, (motionTokens.sequence.maxStagger - groupHandoff) / Math.max(1, count - 1));
const panelMotion = (count: number): Variants => ({
  closed: { opacity: 0, scale: motionTokens.keyframes.userMenu.panelEnterScale },
  open: { opacity: 1, scale: 1, transition: { type: "spring", visualDuration: motionTokens.spring.snappy.visualDuration, bounce: motionTokens.spring.snappy.bounce, opacity: { duration: motionTokens.duration.fast, ease: enter }, delayChildren: groupHandoff, staggerChildren: groupStep(count) } },
  exit: { opacity: 0, scale: motionTokens.keyframes.userMenu.panelExitScale, transition: { duration: motionTokens.duration.instant, ease: exitEase } },
});
const sheetMotion = (count: number): Variants => ({
  closed: { opacity: 1, y: "100%" },
  open: { opacity: 1, y: 0, transition: { ...motionTokens.spring.smooth, visualDuration: motionTokens.spring.smooth.visualDuration, delayChildren: groupHandoff, staggerChildren: groupStep(count) } },
  exit: { y: "100%", transition: { duration: motionTokens.duration.standard, ease: exitEase } },
});
const reducedSurface: Variants = { closed: { opacity: 1 }, open: { opacity: 1, transition: { duration: motionTokens.reduced.duration } }, exit: { opacity: 0, transition: { duration: motionTokens.reduced.duration } } };
const rowMotion: Variants = { closed: { opacity: 0, y: motionTokens.keyframes.userMenu.rowTravelPx }, open: { opacity: 1, y: 0, transition: { duration: motionTokens.duration.standard, ease: enter } } };

/** A presence mark that morphs between statuses: the color crossfades while a hole opens for away and a bar slides in for busy. */
export function PresenceDot({ status, className }: { status: UserStatus | "offline"; className?: string }) {
  return <span className={[styles.dot, className].filter(Boolean).join(" ")} data-status={status} aria-hidden="true" />;
}

function Portrait({ user }: { user: UserMenuUser }) {
  const [failed, setFailed] = useState<string>();
  if (!user.avatarSrc || failed === user.avatarSrc) {
    const initials = user.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("");
    return <span className={`${styles.portrait} ${styles.initials}`}>{initials}</span>;
  }
  // eslint-disable-next-line @next/next/no-img-element -- registry components stay framework agnostic; pass optimized URLs as avatarSrc and avatarSrcSet.
  return <img className={styles.portrait} src={user.avatarSrc} srcSet={user.avatarSrcSet} alt="" decoding="async" draggable={false} onError={() => setFailed(user.avatarSrc)} />;
}

function Face({ user, status, size }: { user: UserMenuUser; status?: UserStatus; size: "sm" | "default" }) {
  return <span className={styles.face} data-size={size}><Portrait user={user} />{status && <PresenceDot status={status} />}</span>;
}

/** Changing text rises out of a small blur while the old text lifts away. */
function Rise({ text, reduced }: { text: string; reduced: boolean }) {
  return <AnimatePresence mode="popLayout" initial={false}>
    <MotionSwap key={text} aria-hidden="true" className={styles.rise} initial={reduced ? false : { opacity: 0, y: `${motionTokens.keyframes.userMenuDetail.labelTravelEm}em`, filter: `blur(${motionTokens.blur.subtle}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: `${-motionTokens.keyframes.userMenuDetail.labelTravelEm}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: standard } }}
      transition={reduced ? { duration: motionTokens.reduced.duration } : { duration: motionTokens.duration.standard, ease: enter }}>{text}</MotionSwap>
  </AnimatePresence>;
}

function Keys({ keys }: { keys: string[] }) {
  return <kbd className={styles.keys} aria-hidden="true">{keys.map((key, index) => <kbd key={`${key}-${index}`} className={styles.key}>{key}</kbd>)}</kbd>;
}

/** A compact inline switch. It is one stop in the menu: up and down pass over it, left and right choose within it. */
function Segmented<T extends string>({ label, icon, value, options, onChange, variants }: { label: string; icon: ReactNode; value: T; options: { value: T; label: string; icon: ReactNode }[]; onChange: (value: T) => void; variants?: Variants }) {
  const index = Math.max(0, options.findIndex(option => option.value === value));
  return <motion.div className={styles.row} data-stop="group" data-label={label} variants={variants}>
    <span className={styles.icon} aria-hidden="true">{icon}</span>
    <span className={styles.rowLabel} aria-hidden="true">{label}</span>
    <div className={styles.segments} role="group" aria-label={label} style={{ "--rams-detail-index": index } as CSSProperties}>
      <span className={styles.thumb} aria-hidden="true" />
      {options.map(option => <button key={option.value} type="button" role="menuitemradio" tabIndex={-1} aria-checked={option.value === value} aria-label={option.label} title={option.label}
        className={styles.segment} onClick={() => onChange(option.value)}>{option.icon}</button>)}
    </div>
  </motion.div>;
}

const getStops = (root: HTMLElement | null) => Array.from(root?.querySelectorAll<HTMLElement>("[data-stop]") ?? []);
function revealStop(stop: HTMLElement | null | undefined, viewport: HTMLElement) {
  if (!stop) return;
  // Reveal only this menu's content, never scroll the page behind its trigger.
  const item = stop.getBoundingClientRect(), panel = viewport.getBoundingClientRect();
  const style = getComputedStyle(viewport);
  const top = panel.top + parseFloat(style.paddingTop), bottom = panel.bottom - parseFloat(style.paddingBottom);
  if (item.top < top) viewport.scrollTop -= top - item.top;
  else if (item.bottom > bottom) viewport.scrollTop += item.bottom - bottom;
}
function focusStop(stop: HTMLElement | undefined, viewport?: HTMLElement | null) {
  if (!stop) return;
  const target = stop.dataset.stop === "group" ? stop.querySelector<HTMLElement>('[aria-checked="true"]') ?? stop.querySelector<HTMLElement>("button") : stop;
  target?.focus({ preventScroll: true });
  if (viewport) revealStop(stop, viewport);
}

function MenuSurface({ id, ref, drag, onKeyDown, onFocusCapture, ...props }: ComponentProps<typeof MotionRegion>) {
  const present = useIsPresent();
  return <MotionRegion {...props} id={present ? id : undefined} ref={ref} drag={present ? drag : false}
    onKeyDown={present ? onKeyDown : undefined} onFocusCapture={present ? onFocusCapture : undefined} />;
}

export function UserMenu({ user, status: statusProp, defaultStatus = "available", onStatusChange, theme: themeProp, defaultTheme = "system", onThemeChange, showTheme = true, items = [], onSignOut, signOutKeys, align = "end", showName = false, open: openProp, defaultOpen = false, onOpenChange, portal = true, ref, className, panelClassName, panelStyle }: UserMenuProps) {
  const id = useId();
  const menuId = `${id}-menu`;
  const triggerId = `${id}-trigger`;
  const reduced = !!useReducedMotion();
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const responsiveFocus = useRef<{ index: number; radio: number } | null>(null);
  const compact = useSyncExternalStore(subscribeCompact, () => window.matchMedia(compactQuery).matches, () => false);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [innerStatus, setInnerStatus] = useState(defaultStatus);
  const [innerTheme, setInnerTheme] = useState(defaultTheme);
  const [signingOut, setSigningOut] = useState(false);
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const open = openProp ?? innerOpen;
  const showStatus = statusProp !== undefined || onStatusChange !== undefined;
  const status = statusProp ?? innerStatus;
  const theme = themeProp ?? innerTheme;
  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const reason = useRef<OpenReason>(null);
  const typed = useRef({ text: "", timer: 0 });
  const mounted = useRef(true);
  const pending = useRef(false);
  const sheet = hydrated && compact;
  const inline = !portal && !sheet;

  useEffect(() => { mounted.current = true; const current = typed.current; return () => { mounted.current = false; window.clearTimeout(current.timer); }; }, []);

  function setTriggerRef(node: HTMLButtonElement | null) {
    triggerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as { current: HTMLButtonElement | null }).current = node;
  }

  function setOpen(next: boolean, why: OpenReason = null) {
    reason.current = next ? why : null;
    responsiveFocus.current = null;
    if (next) setSigningOut(pending.current);
    setHighlight(null);
    setInnerOpen(next);
    onOpenChange?.(next);
  }
  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
  }

  // Focus moves in only when a person opened the menu, so a menu that starts open never steals focus or scrolls the page.
  useEffect(() => {
    if (!open) return;
    const why = reason.current;
    reason.current = null;
    if (!why) return;
    const frame = requestAnimationFrame(() => {
      const stops = getStops(listRef.current);
      if (why === "first") focusStop(stops[0], surfaceRef.current);
      else if (why === "last") focusStop(stops.at(-1), surfaceRef.current);
      else surfaceRef.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, sheet]);

  useLayoutEffect(() => {
    if (!open) return;
    const restore = () => {
      const surface = document.getElementById(menuId) as HTMLDivElement | null;
      if (!surface) return;
      surfaceRef.current = surface;
      listRef.current = surface.querySelector<HTMLDivElement>("[data-user-menu-list]");
      const target = responsiveFocus.current;
      if (!target || (document.activeElement !== surface && surface.contains(document.activeElement))) return;
      const stop = getStops(listRef.current)[target.index];
      const radio = stop?.querySelectorAll<HTMLElement>('[role="menuitemradio"]')[target.radio];
      if (radio) radio.focus({ preventScroll: true });
      else if (stop) focusStop(stop, surface);
      else surface.focus({ preventScroll: true });
    };
    restore();
    const frame = requestAnimationFrame(restore);
    return () => cancelAnimationFrame(frame);
  }, [open, sheet, menuId, hydrated]);

  // Portals inherit direction from the trigger rather than document.body.
  useLayoutEffect(() => {
    if (open && surfaceRef.current && triggerRef.current)
      surfaceRef.current.dir = getComputedStyle(triggerRef.current).direction;
  }, [open, sheet, hydrated]);

  // The desktop panel chooses the side with room and scrolls locally when neither
  // side fits. Inline mode keeps the same DOM/containing block; it does not portal.
  useLayoutEffect(() => {
    if (!open || sheet) return;
    const panel = surfaceRef.current, trigger = triggerRef.current;
    if (!panel || !trigger) return;
    const place = () => {
      if (surfaceRef.current !== panel || triggerRef.current !== trigger) return;
      const rect = trigger.getBoundingClientRect();
      const margin = motionTokens.keyframes.userMenu.viewportMarginPx, gap = motionTokens.keyframes.userMenu.panelGapPx;
      const below = Math.max(0, window.innerHeight - margin - rect.bottom - gap);
      const above = Math.max(0, rect.top - gap - margin);
      const computed = getComputedStyle(panel);
      const naturalHeight = panel.scrollHeight + parseFloat(computed.borderTopWidth) + parseFloat(computed.borderBottomWidth);
      const onTop = naturalHeight > below && (naturalHeight <= above || above > below);
      panel.style.maxHeight = `${onTop ? above : below}px`;
      const width = panel.offsetWidth, height = panel.offsetHeight;
      const rtl = getComputedStyle(trigger).direction === "rtl";
      const physicalStart = rtl ? rect.right - width : rect.left;
      const physicalEnd = rtl ? rect.left : rect.right - width;
      const wanted = align === "start" ? physicalStart : align === "center" ? rect.left + rect.width / 2 - width / 2 : physicalEnd;
      const left = Math.max(margin, Math.min(wanted, window.innerWidth - width - margin));
      const top = Math.max(margin, Math.min(onTop ? rect.top - gap - height : rect.bottom + gap, window.innerHeight - height - margin));
      const root = inline ? rootRef.current?.getBoundingClientRect() : null;
      panel.style.left = `${left - (root?.left ?? 0)}px`;
      panel.style.top = `${top - (root?.top ?? 0)}px`;
      if (inline) { panel.style.right = "auto"; panel.style.marginLeft = "0px"; }
      panel.dataset.side = onTop ? "top" : "bottom";
      const face = trigger.firstElementChild?.getBoundingClientRect();
      const faceCenter = rtl && face ? (face.left + face.right) / 2 : rect.left + Math.min(rect.width, rect.height) / 2;
      const originX = !rtl && align === "end" && rect.width > rect.height ? rect.right - rect.height / 2 - left : faceCenter - left;
      panel.style.setProperty("--rams-detail-origin-x", `${Math.min(Math.max(0, originX), width)}px`);
      panel.style.setProperty("--rams-detail-origin-y", onTop ? `${height}px` : "0px");
      const active = document.activeElement;
      if (active instanceof HTMLElement && panel.contains(active)) revealStop(active.closest<HTMLElement>("[data-stop]"), panel);
    };
    // Scrolling within the menu is intentional; do not snap it back to the
    // focused row or treat that local scroll as a moving anchor.
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && panel.contains(event.target)) return;
      place();
    };
    place();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place);
    observer?.observe(panel);
    observer?.observe(trigger);
    if (listRef.current) observer?.observe(listRef.current);
    if (panel.firstElementChild) observer?.observe(panel.firstElementChild);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", onScroll, true);
    return () => { observer?.disconnect(); window.removeEventListener("resize", place); window.removeEventListener("scroll", onScroll, true); };
  }, [open, sheet, inline, align, hydrated]);

  // Outside presses close the panel. The sheet has its own scrim.
  useEffect(() => {
    if (!open || sheet) return;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      const target = event.target as Node;
      if (surfaceRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      reason.current = null;
      setHighlight(null);
      setInnerOpen(false);
      onOpenChange?.(false);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, sheet, onOpenChange]);

  // The page behind the sheet stays put.
  useEffect(() => {
    if (!open || !sheet) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => { root.style.overflow = previous; };
  }, [open, sheet]);

  function changeStatus(value: UserStatus) { setInnerStatus(value); onStatusChange?.(value); }
  function changeTheme(value: ThemePreference) { setInnerTheme(value); onThemeChange?.(value); }

  function signOut() {
    if (pending.current) return;
    const result = onSignOut?.();
    if (!result || typeof result.then !== "function") { close(true); return; }
    // Async sign out keeps the menu open with its progress on the item, then closes once it settles.
    pending.current = true;
    setSigningOut(true);
    const done = () => { pending.current = false; if (mounted.current) close(false); };
    result.then(done, done);
  }

  function onListFocus(event: FocusEvent<HTMLDivElement>) {
    const stop = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>("[data-stop]") : null;
    if (!stop) { setHighlight(null); return; }
    setHighlight(current => ({ top: stop.offsetTop, height: stop.offsetHeight, tone: stop.dataset.tone, glide: current !== null }));
  }

  // Focus follows a mouse or pen, so the keyboard carries on from wherever the pointer left the highlight.
  function onItemPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;
    if (document.activeElement !== event.currentTarget) event.currentTarget.focus({ preventScroll: true });
  }
  // The inline switches are not rows, so the pointer over them releases the highlight instead of dragging it along.
  function onListPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch" || !highlight) return;
    const group = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-stop="group"]') : null;
    if (!group || group.contains(document.activeElement)) return;
    setHighlight(null);
    surfaceRef.current?.focus({ preventScroll: true });
  }
  function onListPointerLeave(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;
    setHighlight(null);
    surfaceRef.current?.focus({ preventScroll: true });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const stops = getStops(listRef.current);
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const current = active?.closest<HTMLElement>("[data-stop]") ?? null;
    const index = current ? stops.indexOf(current) : -1;
    const step = (to: HTMLElement | undefined) => { event.preventDefault(); focusStop(to, surfaceRef.current); };
    switch (event.key) {
      case "ArrowDown": return step(stops[(index + 1) % stops.length]);
      case "ArrowUp": return step(stops[index <= 0 ? stops.length - 1 : index - 1]);
      case "Home": return step(stops[0]);
      case "End": return step(stops.at(-1));
      case "Escape": case "Tab": event.preventDefault(); return close(true);
      case "ArrowLeft": case "ArrowRight": {
        if (current?.dataset.stop !== "group") return;
        event.preventDefault();
        const segments = Array.from(current.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'));
        const at = Math.max(0, segments.findIndex(segment => segment.getAttribute("aria-checked") === "true"));
        const inlineSign = getComputedStyle(current).direction === "rtl" ? -1 : 1;
        const step = event.key === "ArrowRight" ? inlineSign : -inlineSign;
        const next = segments[(at + step + segments.length) % segments.length];
        next?.focus({ preventScroll: true });
        next?.click();
        return;
      }
    }
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey || event.key === " ") return;
    // Typeahead: letters jump to the next row whose label starts with what was typed.
    const memory = typed.current;
    window.clearTimeout(memory.timer);
    memory.text += event.key.toLowerCase();
    memory.timer = window.setTimeout(() => { memory.text = ""; }, motionTokens.keyframes.userMenuDetail.typeaheadResetMs);
    const ordered = [...stops.slice(index + 1), ...stops.slice(0, index + 1)];
    const search = memory.text.length > 1 && current?.dataset.label?.toLowerCase().startsWith(memory.text) ? [current] : ordered;
    const match = search.find(stop => stop.dataset.label?.toLowerCase().startsWith(memory.text));
    if (match) step(match);
  }

  function onTriggerClick(event: MouseEvent<HTMLButtonElement>) {
    if (open) { close(false); return; }
    setOpen(true, event.detail === 0 ? "first" : "pointer");
  }
  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    setOpen(true, event.key === "ArrowDown" ? "first" : "last");
  }

  const sheetDrag = motionTokens.keyframes.userMenuSheetDrag;
  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > sheetDrag.dismissDistancePx || info.velocity.y > sheetDrag.dismissVelocityPxPerSecond) close(true);
  }

  const glide: Transition = highlight?.glide && !reduced ? motionTokens.spring.snappy : { duration: motionTokens.reduced.duration };
  const row = reduced ? undefined : rowMotion;
  const rowCount = items.length + 2 + Number(showTheme) + Number(showStatus);
  const onSurfaceFocus = (event: FocusEvent<HTMLDivElement>) => {
    const list = event.currentTarget.querySelector<HTMLDivElement>("[data-user-menu-list]");
    const stop = (event.target as HTMLElement).closest<HTMLElement>("[data-stop]");
    const radios = Array.from(stop?.querySelectorAll('[role="menuitemradio"]') ?? []);
    if (stop) responsiveFocus.current = { index: getStops(list).indexOf(stop), radio: radios.indexOf(event.target) };
    else if (!responsiveFocus.current) responsiveFocus.current = { index: -1, radio: -1 };
  };
  const menuProps = { id: menuId, role: "menu", "aria-labelledby": triggerId, tabIndex: -1, onKeyDown, onFocusCapture: onSurfaceFocus };

  const content = <>
    <motion.div className={styles.header} variants={reduced ? (reduced ? undefined : ({ closed: { opacity: 0, y: motionTokens.keyframes.userMenu.rowTravelPx }, open: { opacity: 1, y: 0, transition: { duration: motionTokens.reduced.duration, ease: enter } } })) : row} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>
      <Face user={user} status={showStatus ? status : undefined} size="default" />
      <div className={styles.identity}>
        <div className={styles.nameRow}><span className={styles.name}>{user.name}</span>{user.plan && <span className={styles.plan}>{user.plan}</span>}</div>
        <span className={styles.email} title={user.email}>{user.email}</span>
      </div>
    </motion.div>
    <div ref={listRef} data-user-menu-list="" className={styles.list} onFocus={onListFocus} onPointerMove={onListPointerMove} onPointerLeave={onListPointerLeave}>
      <motion.span className={styles.highlight} data-tone={highlight?.tone} aria-hidden="true" initial={false}
        animate={highlight ? { y: highlight.top, height: highlight.height, opacity: 1 } : { opacity: 0 }}
        transition={{ default: glide, opacity: { duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.instant } }} />
      {items.length > 0 && <>
        <div className={styles.separator} role="separator" />
        {items.map(item => <motion.button key={item.label} type="button" role="menuitem" tabIndex={-1} className={styles.item} data-stop="item" data-label={item.label} variants={reduced ? (reduced ? undefined : ({ closed: { opacity: 0, y: motionTokens.keyframes.userMenu.rowTravelPx }, open: { opacity: 1, y: 0, transition: { duration: motionTokens.reduced.duration, ease: enter } } })) : row}
          onPointerMove={onItemPointerMove} onClick={() => { close(true); item.onSelect?.(); }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>
          <span className={styles.icon} aria-hidden="true">{item.icon}</span>
          <span className={styles.itemLabel}>{item.label}</span>
          {item.keys && <Keys keys={item.keys} />}
        </motion.button>)}
      </>}
      {(showTheme || showStatus) && <>
        <div className={styles.separator} role="separator" />
        {showStatus && <Segmented label="Status" icon={<PresenceDot status={status} />} value={status} onChange={changeStatus}
          options={userStatuses.map(option => ({ ...option, icon: <PresenceDot status={option.value} /> }))} variants={row} />}
        {showTheme && <Segmented label="Theme" icon={<SunMoon size="var(--rams-detail-user-menu-action-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" />} value={theme} onChange={changeTheme} options={themes} variants={row} />}
      </>}
      <div className={styles.separator} role="separator" />
      <motion.button type="button" role="menuitem" tabIndex={-1} className={styles.item} data-stop="item" data-tone="danger" data-label="Sign out" variants={reduced ? (reduced ? undefined : ({ closed: { opacity: 0, y: motionTokens.keyframes.userMenu.rowTravelPx }, open: { opacity: 1, y: 0, transition: { duration: motionTokens.reduced.duration, ease: enter } } })) : row}
        aria-label={signingOut ? "Signing out" : "Sign out"} aria-busy={signingOut || undefined} onPointerMove={onItemPointerMove} onClick={signOut} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>
        <span className={styles.icon} aria-hidden="true">{signingOut ? <LoaderCircle className={styles.spinner} size="var(--rams-detail-user-menu-action-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" /> : <LogOut size="var(--rams-detail-user-menu-action-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" />}</span>
        <span className={styles.itemLabel}><Rise text={signingOut ? "Signing out" : "Sign out"} reduced={reduced} /></span>
        {signOutKeys && <Keys keys={signOutKeys} />}
      </motion.button>
    </div>
  </>;

  const panel = <AnimatePresence>
    {open && !sheet && <MenuSurface key="panel" ref={surfaceRef} {...menuProps} data-rams-menu-surface="" className={[styles.panel, panelClassName].filter(Boolean).join(" ")} style={panelStyle} data-inline={inline || undefined} data-align={align}
      variants={reduced ? reducedSurface : panelMotion(rowCount)} initial={reduced ? false : "closed"} animate="open" exit="exit" transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>
      {content}
    </MenuSurface>}
  </AnimatePresence>;

  const bottomSheet = <AnimatePresence>
    {open && sheet && <MotionRegion key="scrim" className={styles.scrim} aria-hidden="true" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.standard, ease: standard }} onClick={() => close(true)} />}
    {open && sheet && <MenuSurface key="sheet" ref={surfaceRef} {...menuProps} data-rams-menu-surface="" className={[styles.panel, styles.sheet, panelClassName].filter(Boolean).join(" ")} style={panelStyle} aria-modal="true"
      variants={reduced ? reducedSurface : sheetMotion(rowCount)} initial={reduced ? false : "closed"} animate="open" exit="exit"
      drag={reduced ? false : "y"} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: sheetDrag.upwardElasticity, bottom: sheetDrag.downwardElasticity }} dragMomentum={false} onDragEnd={onDragEnd} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>
      <span className={styles.handle} aria-hidden="true" />
      {content}
    </MenuSurface>}
  </AnimatePresence>;

  return <span ref={rootRef} className={styles.root}>
    <button ref={setTriggerRef} id={triggerId} type="button" className={[styles.trigger, className].filter(Boolean).join(" ")} data-state={open ? "open" : "closed"} data-name={showName || undefined}
      aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined} aria-label={`Account menu, ${user.name}${showStatus ? `, ${statusLabel(status)}` : ""}`}
      onClick={onTriggerClick} onKeyDown={onTriggerKeyDown}>
      <Face user={user} status={showStatus ? status : undefined} size="sm" />
      {showName && <><span className={styles.triggerName}>{user.name}</span><ChevronDown className={styles.chevron} size="var(--rams-detail-user-menu-action-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" aria-hidden="true" /></>}
    </button>
    {sheet ? createPortal(bottomSheet, document.body) : inline ? panel : hydrated ? createPortal(panel, document.body) : null}
  </span>;
}

export default UserMenu;
