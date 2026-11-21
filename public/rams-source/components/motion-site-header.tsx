"use client";
import "./motion-fields.css";

import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode, RefObject } from "react";
import { AnimatePresence, LayoutGroup, motion, useIsPresent, visualElementStore } from "motion/react";
import { Button as NativeButton } from "./button";
import { MotionPresenceDiv } from "./presence-controls";
import { motionTransition } from "./motion-policy";
import { useReducedMotion } from "./use-motion-preference";
import type { Transition, Variants } from "motion/react";
import { ArrowRight, BookOpen, Boxes, ChevronDown, History, LayoutTemplate, Menu, MessagesSquare, Palette, PanelsTopLeft, Route, X } from "lucide-react";
import { Select } from "./motion-select";
import { motionTokens } from "./motion-tokens";
import { siteHeaderGeometry } from "./site-header-geometry";
import styles from "./motion-site-header.module.css";

export type SiteHeaderVariant = "simple" | "centered" | "mega";

/** One destination inside a mega menu panel. */
export interface SiteHeaderLink {
  label: string;
  /** One short line under the label. */
  description?: string;
  /** A plain decorative icon beside the label. */
  icon?: ReactNode;
  href?: string;
}

/** A card beside the links in a mega menu panel. */
export interface SiteHeaderFeature {
  title: string;
  description?: string;
  href?: string;
  image?: { src: string; alt: string };
}

/** A top level destination. With `links` and the mega variant it opens a panel; otherwise it is a plain link. */
export interface SiteHeaderItem {
  /** Stable value, also used for `current`. */
  value: string;
  label: string;
  href?: string;
  links?: SiteHeaderLink[];
  feature?: SiteHeaderFeature;
}

export interface SiteHeaderAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

/** What `onNavigate` receives. */
export interface SiteHeaderDestination {
  label: string;
  href?: string;
  /** The top level item the destination belongs to. */
  section?: string;
}

export interface SiteHeaderProps {
  /** `simple` puts links beside the brand, `centered` centers them in a quiet capsule, `mega` opens panels for items with links. */
  variant?: SiteHeaderVariant;
  brand?: { name: string; href?: string; mark?: ReactNode };
  items?: SiteHeaderItem[];
  /** Value of the item that holds the current page (controlled). */
  current?: string;
  /** Initial current item when uncontrolled. */
  defaultCurrent?: string;
  /** Called when a destination inside an item is chosen, with that item's value. */
  onCurrentChange?: (value: string) => void;
  /** Called for every destination: items, panel links, the brand, and actions with an href. */
  onNavigate?: (destination: SiteHeaderDestination) => void;
  /** A quiet action before the primary one, such as Sign in. Pass null to hide it. */
  secondaryAction?: SiteHeaderAction | null;
  /** The one primary action at the end of the bar. Pass null to hide it. */
  primaryAction?: SiteHeaderAction | null;
  /** Sticks to the top of its scroll container. Defaults to true. */
  sticky?: boolean;
  /** The element that scrolls, when it is not the window. The header turns solid once it scrolls. */
  scrollContainer?: RefObject<HTMLElement | null>;
  /** Pixels of scroll before the background turns solid. Defaults to 8. */
  scrollThreshold?: number;
  /** Accessible name of the navigation landmark. */
  label?: string;
  className?: string;
}

type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;
const standard = [...motionTokens.ease.standard] as Bezier;
/** Duration based springs restated as stiffness and damping, so a retarget keeps the velocity already in flight. */
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = 2 * Math.PI / (visualDuration * 1.2);
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 };
};
const GROW = physical(motionTokens.spring.morph.visualDuration, motionTokens.spring.morph.bounce), SHRINK = physical(motionTokens.spring.smooth.visualDuration, motionTokens.spring.smooth.bounce), GLIDE = physical(motionTokens.spring.snappy.visualDuration, motionTokens.spring.snappy.bounce), SLIDE = physical(motionTokens.spring.smooth.visualDuration, motionTokens.spring.smooth.bounce);
const siteHeaderMotion = motionTokens.keyframes.siteHeader;

/** Panel content slides in from the side of the newly opened item; opening from closed drops in from the bar. */
const faceVariants: Variants = {
  hidden: (direction: number) => ({ opacity: 0, x: direction * siteHeaderMotion.faceSwitchTravelPx, y: direction ? 0 : -siteHeaderMotion.faceOpenTravelPx, filter: `blur(${motionTokens.blur.subtle}px)` }),
  shown: { opacity: 1, x: 0, y: 0, filter: "blur(0px)", transition: { x: SLIDE, y: SLIDE, opacity: { duration: motionTokens.duration.fast, ease: enter, delay: motionTokens.stagger.char }, filter: { duration: motionTokens.duration.standard, ease: enter } } },
  gone: (direction: number) => ({ opacity: 0, x: direction * -siteHeaderMotion.faceSwitchTravelPx * siteHeaderMotion.faceExitShare, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { x: SLIDE, opacity: { duration: motionTokens.duration.instant, ease: standard }, filter: { duration: motionTokens.duration.instant, ease: standard } } }),
};
const fadeVariants: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: motionTokens.duration.fast } }, gone: { opacity: 0, transition: { duration: motionTokens.duration.instant } } };

export function BrandMark(props: { className?: string }) {
  return <svg className={props.className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="var(--rams-detail-site-header-brand-glyph-stroke)" aria-hidden="true"><path d="M5 3h10l4 4v14H5zM15 3v5h4M8 12h8M8 16h5" /></svg>;
}

const ICON = { size: "calc(var(--rams-detail-site-header-panel-link-glyph-size) * 1px)", strokeWidth: "var(--rams-detail-site-header-panel-link-glyph-stroke)", "aria-hidden": true } as const;
export const siteHeaderExampleItems: SiteHeaderItem[] = [
  { value: "edition", label: "Edition", links: [
    { label: "Sheet plan", description: "Three eight-page signatures", icon: <BookOpen {...ICON} /> },
    { label: "Page order", description: "Check the fold before trimming", icon: <Route {...ICON} /> },
    { label: "Cover rule", description: "Oxide-red rule, 5 mm inside trim", icon: <Palette {...ICON} /> },
    { label: "Black plate", description: "Type and page furniture", icon: <LayoutTemplate {...ICON} /> },
  ], feature: { title: "Current worksheet", description: "24 pages · 140 sample copies · Buenos Aires" } },
  { value: "paper", label: "Paper", links: [
    { label: "Text stock", description: "100 gsm uncoated paper", icon: <PanelsTopLeft {...ICON} /> },
    { label: "Cover stock", description: "220 gsm separate cover", icon: <Boxes {...ICON} /> },
  ] },
  { value: "archive", label: "Archive" },
  { value: "colophon", label: "Colophon" },
];

const referenceNotes: Record<string, string> = {
  Folio21: "Folio21 · Buenos Aires · sample edition.",
  Edition: "24 pages in three eight-page signatures, with a separate cover.",
  "Sheet plan": "24 pages: three eight-page signatures.",
  "Page order": "Fold a proof sheet and check reader order before trimming.",
  "Cover rule": "Keep the oxide-red cover rule 5 mm inside trim.",
  "Black plate": "Black carries type and page furniture; oxide red carries the cover rule.",
  "Current worksheet": "24 pages · 140 sample copies · Buenos Aires.",
  Paper: "100 gsm text stock and a 220 gsm separate cover.",
  "Text stock": "Use 100 gsm uncoated stock for the 24 text pages.",
  "Cover stock": "The separate cover uses 220 gsm stock.",
  Archive: "Folio21 contains the sheet plan, plate notes, paper notes, and colophon for this sample edition.",
  Colophon: "Folio21 · Buenos Aires · 140 sample copies; 24 pages in three signatures.",
};

function useScrolled(threshold: number, container?: RefObject<HTMLElement | null>) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const node = container?.current ?? null;
    const target: HTMLElement | Window = node ?? window;
    const read = () => node ? node.scrollTop : window.scrollY;
    // Turns solid past the threshold and clear again only near the top, so it never flickers at the edge.
    const update = () => { const y = read(); setScrolled(previous => previous ? y > threshold / 2 : y > threshold); };
    update();
    target.addEventListener("scroll", update, { passive: true });
    return () => target.removeEventListener("scroll", update);
  }, [threshold, container]);
  return scrolled;
}

/** A panel face reports its natural height while current; a leaving face floats out of flow and turns inert. */
function Face({ direction, reduced, onHeight, children }: { direction: number; reduced: boolean; onHeight: (height: number) => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const present = useIsPresent();
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !present) return;
    onHeight(node.offsetHeight);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => onHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, [present, onHeight]);
  return <motion.div ref={ref} className={styles.face} data-face="" data-leaving={present ? undefined : ""} inert={!present} custom={direction} variants={reduced ? ({ hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: motionTokens.reduced.duration } }, gone: { opacity: 0, transition: { duration: motionTokens.reduced.duration } } }) : faceVariants} initial="hidden" animate="shown" exit="gone" transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>
    {children}
  </motion.div>;
}

type DestinationProps = Omit<HTMLAttributes<HTMLElement>, "onClick" | "children"> & { link: { href?: string; label: string }; onChoose: (event: ReactMouseEvent) => void; children: ReactNode };
/** Renders an anchor when the destination has an href and a button otherwise, so demos and real sites share one path. */
function Destination({ link, onChoose, children, ...rest }: DestinationProps) {
  return link.href
    ? <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} href={link.href} onClick={onChoose}>{children}</a>
    : <button {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} type="button" onClick={onChoose}>{children}</button>;
}

/**
 * A website header in three layouts. It sticks to the top and turns solid once the page scrolls, marks the current section
 * with an indicator that glides between links, opens springy mega menu panels whose content slides in from the side you
 * moved toward, and folds into a menu sheet on narrow containers.
 */
export const SiteHeader = forwardRef<HTMLElement, SiteHeaderProps>(function SiteHeader({
  variant = "mega",
  brand = { name: "Folio21" },
  items = siteHeaderExampleItems,
  current: currentProp,
  defaultCurrent,
  onCurrentChange,
  onNavigate,
  secondaryAction = null,
  primaryAction = null,
  sticky = true,
  scrollContainer,
  scrollThreshold = siteHeaderGeometry.scrollThresholdPx,
  label = "Main",
  className,
}, ref) {
  const id = useId();
  const reduced = !!useReducedMotion();
  const scrolled = useScrolled(scrollThreshold, scrollContainer);
  const [innerCurrent, setInnerCurrent] = useState(defaultCurrent);
  const current = currentProp ?? innerCurrent;
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState<{ value: string; direction: number } | null>(null);
  const [panel, setPanel] = useState<{ height: number | null; grow: boolean }>({ height: null, grow: true });
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const focusOwner = useRef<HTMLElement | null>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement | HTMLAnchorElement>());
  const panelRef = useRef<HTMLDivElement>(null);
  const openTimer = useRef<number | undefined>(undefined), closeTimer = useRef<number | undefined>(undefined);
  const focusFirst = useRef(false);
  useLayoutEffect(() => {
    if (!reduced || !menuOpen) return;
    const sheet = rootRef.current?.querySelector<HTMLElement>("[data-mobile-sheet]:not([inert])");
    if (!sheet) return;
    const nodes = [sheet, ...sheet.querySelectorAll<HTMLElement>(`.${styles.sheetItem}, .${styles.sheetActions}, .${styles.sheetGroup}:not([inert])`)];
    for (const node of nodes) {
      const visual = visualElementStore.get(node);
      for (const key of ["height", "opacity", "y"]) {
        const controls = visual?.getValue(key)?.animation;
        if (controls && "complete" in controls && typeof controls.complete === "function") controls.complete();
      }
    }
  }, [reduced, menuOpen]);

  useLayoutEffect(() => {
    if (!reduced || !open || !panelRef.current) return;
    const panelNode = panelRef.current;
    const nodes = [panelNode, ...panelNode.querySelectorAll<HTMLElement>("[data-face]:not([data-leaving])")];
    for (const node of nodes) {
      const visual = visualElementStore.get(node);
      for (const key of ["height", "opacity", "x", "y", "scale", "filter"]) {
        const controls = visual?.getValue(key)?.animation;
        if (controls && "complete" in controls && typeof controls.complete === "function") controls.complete();
      }
    }
  }, [reduced, open]);

  const hasPanels = variant === "mega";
  const openItem = open ? items.find(item => item.value === open.value) : undefined;

  const setRefs = useCallback((node: HTMLElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node); else if (ref) ref.current = node;
  }, [ref]);

  const clearTimers = useCallback(() => { window.clearTimeout(openTimer.current); window.clearTimeout(closeTimer.current); }, []);
  useEffect(() => clearTimers, [clearTimers]);

  const openPanel = useCallback((value: string | null) => {
    setOpen(previous => {
      if (!value) return null;
      if (previous?.value === value) return previous;
      const from = previous ? items.findIndex(item => item.value === previous.value) : -1;
      const to = items.findIndex(item => item.value === value);
      return { value, direction: from < 0 ? 0 : Math.sign(to - from) };
    });
    if (!value) setPanel({ height: null, grow: true });
  }, [items]);

  const close = useCallback((restoreFocus = false) => {
    clearTimers();
    const was = open?.value;
    openPanel(null);
    if (restoreFocus && was) triggerRefs.current.get(was)?.focus();
  }, [open, openPanel, clearTimers]);

  const closeMenu = useCallback((restoreFocus = false) => {
    setMenuOpen(false);
    setExpanded(null);
    if (restoreFocus) menuButtonRef.current?.focus();
  }, []);

  const choose = useCallback((destination: SiteHeaderDestination, section: string | undefined) => {
    if (section) {
      if (currentProp === undefined) setInnerCurrent(section);
      onCurrentChange?.(section);
    }
    // Only a locally handled destination retires the focused control in this view.
    const ownsFocus = !destination.href && !!rootRef.current?.contains(document.activeElement);
    close(ownsFocus && !!open);
    closeMenu(ownsFocus && menuOpen);
    onNavigate?.(destination);
  }, [close, closeMenu, currentProp, onCurrentChange, onNavigate, open, menuOpen]);

  // Outside presses and Escape close whichever layer is open.
  useEffect(() => {
    if (!open && !menuOpen) return;
    const onPointer = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) { close(); closeMenu(); } };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { const owned = !!rootRef.current?.contains(document.activeElement); if (owned) event.preventDefault(); if (open) close(owned); else closeMenu(owned); } };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open, menuOpen, close, closeMenu]);

  // The sheet belongs to narrow layouts: widening the container closes it, and it holds the page still while open.
  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const desktop = entry.contentRect.width >= siteHeaderGeometry.desktopMinRem * parseFloat(getComputedStyle(document.documentElement).fontSize);
      const active = document.activeElement as HTMLElement | null;
      const focused = node.contains(active) ? active : active === document.body && focusOwner.current?.isConnected ? focusOwner.current : null;
      if (desktop) {
        if (focused && (focused === menuButtonRef.current || node.querySelector('[data-mobile-sheet]')?.contains(focused))) node.querySelector<HTMLElement>('[data-nav-item]')?.focus();
        setMenuOpen(false); setExpanded(null);
      } else {
        if (focused && (panelRef.current?.contains(focused) || focused.hasAttribute('data-nav-item'))) menuButtonRef.current?.focus();
        setOpen(null);
      }
    });
    const outside = (event: Event) => { if (!node.contains(event.target as Node)) focusOwner.current = null; };
    document.addEventListener("focusin", outside); document.addEventListener("pointerdown", outside);
    observer.observe(node);
    return () => { observer.disconnect(); document.removeEventListener("focusin", outside); document.removeEventListener("pointerdown", outside); };
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const scroller: HTMLElement = scrollContainer?.current ?? document.documentElement;
    const previous = scroller.style.getPropertyValue("overflow");
    scroller.style.setProperty("overflow", "hidden");
    return () => { if (previous) scroller.style.setProperty("overflow", previous); else scroller.style.removeProperty("overflow"); };
  }, [menuOpen, scrollContainer]);

  useEffect(() => {
    if (!open || !focusFirst.current) return;
    focusFirst.current = false;
    const frame = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("[data-panel-link]")?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  function onTriggerPointerEnter(event: ReactPointerEvent, value: string) {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(openTimer.current);
    if (open) openPanel(value);
    else openTimer.current = window.setTimeout(() => openPanel(value), siteHeaderMotion.hoverIntentMs);
  }
  function onRegionPointerLeave(event: ReactPointerEvent) {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(() => openPanel(null), siteHeaderMotion.leaveGraceMs);
  }
  function onRegionPointerEnter(event: ReactPointerEvent) {
    if (event.pointerType === "mouse") window.clearTimeout(closeTimer.current);
  }

  function onNavKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    const triggers = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-nav-item]"));
    const index = triggers.indexOf(document.activeElement as HTMLElement);
    if (index < 0) return;
    event.preventDefault();
    const nextIndex = (index + (event.key === "ArrowRight" ? 1 : -1) + triggers.length) % triggers.length;
    triggers[nextIndex]!.focus();
    if (open) { const item = items[nextIndex]; openPanel(item && hasPanels && item.links?.length ? item.value : null); }
  }
  function onTriggerKeyDown(event: ReactKeyboardEvent, value: string) {
    if (event.key === "ArrowDown") { event.preventDefault(); focusFirst.current = true; openPanel(value); if (open?.value === value) panelRef.current?.querySelector<HTMLElement>("[data-panel-link]")?.focus(); }
  }
  function onPanelKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") return;
    const unique = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-face]:not([data-leaving]) [data-panel-link]"));
    if (!unique.length) return;
    event.preventDefault();
    const index = unique.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? unique.length - 1 : event.key === "ArrowDown" ? Math.min(index + 1, unique.length - 1) : index - 1;
    if (next < 0) { close(true); return; }
    unique[next]?.focus();
  }

  // Growing carries a little life; shrinking settles without overshoot.
  const onHeight = useCallback((height: number) => setPanel(previous => previous.height === height ? previous : { height, grow: previous.height === null || height > previous.height }), []);

  const actionNode = (action: SiteHeaderAction, kind: "secondary" | "primary", extra = "") => {
    const onClick = () => {
      const ownsFocus = !!rootRef.current?.contains(document.activeElement);
      close(ownsFocus && !!open); closeMenu(ownsFocus && menuOpen);
      action.onClick?.();
      if (action.href) onNavigate?.({ label: action.label, href: action.href });
    };
    const cls = `${styles.action} ${styles[kind]} ${extra}`;
    return <NativeButton asChild={!!action.href} type="button" size="sm" variant={kind === "primary" ? "default" : "ghost"} className={cls} onClick={onClick} disabled={!action.href && !action.onClick}>
      {action.href ? <a href={action.href}>{action.label}</a> : action.label}
    </NativeButton>;
  };

  const brandContent = <>{brand.mark}<span>{brand.name}</span></>;
  const brandNode = brand.href || onNavigate
    ? <Destination link={{ label: brand.name, href: brand.href }} className={styles.brand} onChoose={() => choose({ label: brand.name, href: brand.href }, undefined)}>{brandContent}</Destination>
    : <span className={styles.brand}>{brandContent}</span>;

  return <header
    ref={setRefs}
    onFocusCapture={event => { focusOwner.current = event.target; }}
    className={[styles.header, sticky ? styles.sticky : "", className].filter(Boolean).join(" ")}
    data-variant={variant}
    data-scrolled={scrolled || menuOpen || !!open ? "" : undefined}
  >
    <div className={styles.inner} onPointerLeave={onRegionPointerLeave} onPointerEnter={onRegionPointerEnter}>
      <div className={styles.bar}>
        <div className={styles.brandSlot}>{brandNode}</div>
        <LayoutGroup id={id}>
          <nav className={styles.nav} aria-label={label} onKeyDown={onNavKeyDown} onPointerLeave={() => setHovered(null)}>
            <ul className={styles.navList}>
              {items.map(item => {
                const isCurrent = current === item.value;
                const withPanel = hasPanels && !!item.links?.length;
                const isOpen = open?.value === item.value;
                const panelId = `${id}-panel`;
                const common = {
                  className: styles.navItem,
                  "data-nav-item": "",
                  "data-current": isCurrent ? "" : undefined,
                  "data-open": isOpen ? "" : undefined,
                  onPointerEnter: (event: ReactPointerEvent) => { if (event.pointerType === "mouse") setHovered(item.value); if (withPanel) onTriggerPointerEnter(event, item.value); else if (event.pointerType === "mouse" && open) closeTimer.current = window.setTimeout(() => openPanel(null), siteHeaderMotion.leaveGraceMs); },
                  onFocus: () => setHovered(null),
                };
                const decorations = <>
                  {hovered === item.value && variant !== "centered" && <motion.span key={`hover-${variant}`} layoutId={reduced ? undefined : `hover-${variant}`} className={styles.hover} transition={reduced ? { duration: motionTokens.reduced.duration } : GLIDE} aria-hidden="true" />}
                  {isCurrent && <motion.span key={`current-${variant}`} layoutId={reduced ? undefined : `current-${variant}`} className={styles.indicator} transition={motionTransition("selection", reduced)} aria-hidden="true" />}
                </>;
                return <li key={item.value} className={styles.navCell}>
                  {withPanel
                    ? <button
                        {...common}
                        ref={(node: HTMLButtonElement | null) => { if (node) triggerRefs.current.set(item.value, node); else triggerRefs.current.delete(item.value); }}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={isOpen ? panelId : undefined}
                        onClick={() => { clearTimers(); openPanel(isOpen ? null : item.value); }}
                        onKeyDown={event => onTriggerKeyDown(event, item.value)}
                      >
                        {decorations}
                        <span className={styles.navLabel}>{item.label}</span>
                        <ChevronDown className={styles.chevron} size="calc(var(--rams-detail-site-header-nav-glyph-size) * 1px)" strokeWidth="var(--rams-detail-site-header-nav-glyph-stroke)" aria-hidden="true" />
                      </button>
                    : <Destination
                        link={item}
                        {...common}
                        aria-current={isCurrent ? "page" : undefined}
                        onChoose={() => choose({ label: item.label, href: item.href, section: item.value }, item.value)}
                      >
                        {decorations}
                        <span className={styles.navLabel}>{item.label}</span>
                      </Destination>}
                </li>;
              })}
            </ul>
          </nav>
        </LayoutGroup>
        <div className={styles.actions}>
          {secondaryAction && actionNode(secondaryAction, "secondary", styles.wideOnly)}
          {primaryAction && actionNode(primaryAction, "primary", menuOpen ? styles.suppressedWhileMenuOpen : "")}
          <button ref={menuButtonRef} type="button" className={styles.menuButton} aria-expanded={menuOpen} aria-controls={`${id}-sheet`} aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => { if (menuOpen) closeMenu(); else setMenuOpen(true); }}>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span key={menuOpen ? "close" : "open"} className={styles.menuIcon} initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: menuOpen ? -siteHeaderMotion.toggleTurnDeg : siteHeaderMotion.toggleTurnDeg, scale: siteHeaderMotion.toggleSwapScale }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={reduced ? { opacity: 0 } : { opacity: 0, rotate: menuOpen ? siteHeaderMotion.toggleTurnDeg : -siteHeaderMotion.toggleTurnDeg, scale: siteHeaderMotion.toggleSwapScale }} transition={reduced ? { duration: motionTokens.reduced.duration } : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.instant } }}>
                {menuOpen ? <X size="calc(var(--rams-detail-site-header-menu-glyph-size) * 1px)" strokeWidth="var(--rams-detail-site-header-menu-glyph-stroke)" aria-hidden="true" /> : <Menu size="calc(var(--rams-detail-site-header-menu-glyph-size) * 1px)" strokeWidth="var(--rams-detail-site-header-menu-glyph-stroke)" aria-hidden="true" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {hasPanels && <AnimatePresence>
        {openItem?.links && <MotionPresenceDiv
          key="panel"
          id={`${id}-panel`}
          ref={panelRef}
          className={styles.panel}
          role="region"
          aria-label={openItem.label}
          onKeyDown={onPanelKeyDown}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: -siteHeaderMotion.panelEnterTravelPx, scale: siteHeaderMotion.panelEnterScale }}
          animate={{ opacity: 1, y: 0, scale: 1, height: panel.height ?? "auto" }}
          exit={reduced ? { opacity: 0, transition: { duration: motionTokens.reduced.duration } } : { opacity: 0, y: -siteHeaderMotion.panelExitTravelPx, scale: siteHeaderMotion.panelExitScale, transition: { duration: motionTokens.duration.exit, ease: standard } }}
          transition={reduced ? { duration: motionTokens.reduced.duration } : { height: panel.grow ? GROW : SHRINK, y: GROW, scale: GROW, opacity: { duration: motionTokens.duration.fast, ease: enter } }}
        >
          <AnimatePresence initial={false} custom={open?.direction ?? 0}>
            <Face key={openItem.value} direction={open?.direction ?? 0} reduced={reduced} onHeight={onHeight}>
              <div className={styles.faceGrid} data-featured={openItem.feature ? "" : undefined}>
                <ul className={styles.panelLinks}>
                  {openItem.links.map(link => <li key={link.label}>
                    <Destination link={link} className={styles.panelLink} data-panel-link="" onChoose={() => choose({ label: link.label, href: link.href, section: openItem.value }, openItem.value)}>
                      {link.icon && <span className={styles.panelIcon}>{link.icon}</span>}
                      <span className={styles.panelText}><span>{link.label}</span>{link.description && <span>{link.description}</span>}</span>
                    </Destination>
                  </li>)}
                </ul>
                {openItem.feature && <Destination link={{ label: openItem.feature.title, href: openItem.feature.href }} className={styles.feature} data-panel-link="" onChoose={() => choose({ label: openItem.feature!.title, href: openItem.feature!.href, section: openItem.value }, openItem.value)}>
                  {openItem.feature.image && <span className={styles.featureImage}><img src={openItem.feature.image.src} alt={openItem.feature.image.alt} /></span>}
                  <span className={styles.featureTitle}>{openItem.feature.title}<ArrowRight size="calc(var(--rams-detail-site-header-nav-glyph-size) * 1px)" strokeWidth="var(--rams-detail-site-header-nav-glyph-stroke)" aria-hidden="true" /></span>
                  {openItem.feature.description && <span className={styles.featureText}>{openItem.feature.description}</span>}
                </Destination>}
              </div>
            </Face>
          </AnimatePresence>
        </MotionPresenceDiv>}
      </AnimatePresence>}
    </div>

    <AnimatePresence>
      {menuOpen && <>
        <motion.div key="scrim" className={styles.scrim} onClick={() => closeMenu()} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.standard, ease: standard }} aria-hidden="true" />
        <MotionPresenceDiv
          data-mobile-sheet=""
          key="sheet"
          id={`${id}-sheet`}
          className={styles.sheet}
          initial={reduced ? { opacity: 0 } : { height: 0 }}
          animate={reduced ? { opacity: 1 } : { height: "auto" }}
          exit={reduced ? { opacity: 0 } : { height: 0, transition: SHRINK }}
          transition={reduced ? { duration: motionTokens.reduced.duration } : GROW}
        >
          <nav className={styles.sheetInner} aria-label={label}>
            <ul className={styles.sheetList}>
              {items.map((item, index) => {
                const isCurrent = current === item.value;
                const group = !!item.links?.length && variant === "mega";
                const isExpanded = expanded === item.value;
                const rowMotion = { initial: reduced ? false : { opacity: 0, y: -siteHeaderMotion.sheetItemTravelPx }, animate: { opacity: 1, y: 0 }, transition: { duration: motionTokens.duration.standard, ease: enter, delay: reduced ? motionTokens.reduced.stagger : Math.min(motionTokens.stagger.word + index * motionTokens.stagger.item, motionTokens.sequence.maxStagger) } } as const;
                return <motion.li key={item.value} className={styles.sheetItem} {...rowMotion}>
                  {group ? <>
                    <button type="button" className={styles.sheetRow} data-current={isCurrent ? "" : undefined} aria-expanded={isExpanded} aria-controls={`${id}-group-${item.value}`} onClick={() => setExpanded(isExpanded ? null : item.value)}>
                      <span>{item.label}</span><ChevronDown className={styles.sheetChevron} size="calc(var(--rams-detail-site-header-sheet-chevron-size) * 1px)" strokeWidth="var(--rams-detail-site-header-sheet-chevron-stroke)" aria-hidden="true" />
                    </button>
                    <AnimatePresence initial={false}>
                      {isExpanded && <MotionPresenceDiv key="group" id={`${id}-group-${item.value}`} className={styles.sheetGroup} initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }} animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }} exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }} transition={reduced ? { duration: motionTokens.reduced.duration } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }}>
                        <ul>{item.links!.map(link => <li key={link.label}>
                          <Destination link={link} className={styles.sheetLink} onChoose={() => choose({ label: link.label, href: link.href, section: item.value }, item.value)}>
                            {link.icon}<span>{link.label}</span>
                          </Destination>
                        </li>)}</ul>
                      </MotionPresenceDiv>}
                    </AnimatePresence>
                  </> : <Destination link={item} className={styles.sheetRow} data-current={isCurrent ? "" : undefined} aria-current={isCurrent ? "page" : undefined} onChoose={() => choose({ label: item.label, href: item.href, section: item.value }, item.value)}>
                    <span>{item.label}</span>{isCurrent && <span className={styles.sheetDot} aria-hidden="true" />}
                  </Destination>}
                </motion.li>;
              })}
            </ul>
            {(secondaryAction || primaryAction) && <motion.div className={styles.sheetActions} initial={reduced ? false : { opacity: 0, y: -siteHeaderMotion.sheetItemTravelPx }} animate={{ opacity: 1, y: 0 }} transition={{ duration: motionTokens.duration.standard, ease: enter, delay: reduced ? motionTokens.reduced.stagger : Math.min(motionTokens.stagger.word + items.length * motionTokens.stagger.item, motionTokens.sequence.maxStagger) }}>
              {secondaryAction && actionNode(secondaryAction, "secondary")}
              {primaryAction && actionNode(primaryAction, "primary")}
            </motion.div>}
          </nav>
        </MotionPresenceDiv>
      </>}
    </AnimatePresence>
  </header>;
});

SiteHeader.displayName = "SiteHeader";

const variantOptions = [{ value: "mega", label: "Mega menu" }, { value: "simple", label: "Simple" }, { value: "centered", label: "Centered" }];
/** A bounded print archive page with actual local destinations and three header layouts. */
export function SiteHeaderBlock({ variant: initial = "mega" }: { variant?: SiteHeaderVariant }) {
  const [variant, setVariant] = useState<SiteHeaderVariant>(initial);
  const [current, setCurrent] = useState("edition");
  const [selection, setSelection] = useState("Edition");
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const frame = scrollRef.current, header = headerRef.current;
    if (!frame || !header) return;
    const update = () => frame.style.setProperty("--rams-detail-site-header-sheet-max", `${Math.max(0, frame.clientHeight - header.offsetHeight)}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame); observer.observe(header);
    return () => observer.disconnect();
  }, []);
  return <div className={styles.preview}>
    <Select label="Header layout" options={variantOptions} value={variant} onValueChange={value => setVariant(value as SiteHeaderVariant)} />
    <div className={styles.frame} ref={scrollRef} tabIndex={0} aria-label="Folio21 archive page">
      <SiteHeader ref={headerRef} variant={variant} current={current} onCurrentChange={setCurrent}
        onNavigate={destination => setSelection(destination.label)} scrollContainer={scrollRef}
        secondaryAction={{ label: "Colophon", onClick: () => { setCurrent("colophon"); setSelection("Colophon"); } }}
        primaryAction={{ label: "Sheet plan", onClick: () => { setCurrent("edition"); setSelection("Sheet plan"); } }} />
      <article className={styles.page} aria-live="polite">
        <div className={styles.pageHero}>
          <p>Folio21 · Buenos Aires</p>
          <h2>{selection}</h2>
          <p>{referenceNotes[selection] ?? referenceNotes.Folio21}</p>
        </div>
        <div className={styles.pageRows}>
          {[["Sheet plan", "24 pages · three eight-page signatures"], ["Paper", "100 gsm text · 220 gsm cover"], ["Cover rule", "Oxide-red rule · 5 mm inside trim"], ["Colophon", "140 sample copies · Buenos Aires"]].map(([title, detail]) => <section key={title}><h3>{title}</h3><p>{detail}</p></section>)}
        </div>
      </article>
    </div>
  </div>;
}
export default SiteHeaderBlock;
