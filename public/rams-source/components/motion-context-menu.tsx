"use client";
import "./motion-fields.css";

import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, FocusEvent, KeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import { MotionRegion } from "./motion-swap";
import { Button } from "./button";
import { floatingPlacement } from "./floating-placement";
import { Check, MoreHorizontal } from "lucide-react";
import { motionTokens } from "./motion-tokens";
import styles from "./motion-context-menu.module.css";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  checked?: boolean;
}

export interface ContextMenuProps {
  children: ReactNode;
  items: ContextMenuItem[];
  label?: string;
}

const contextMotion = motionTokens.keyframes.contextMenu;

type Highlight = { index: number; top: number; height: number; danger: boolean; glide: boolean };

function clampTo(x: number, y: number, width: number, height: number, inset: number) {
  const left = Math.max(inset, Math.min(x, window.innerWidth - width - inset));
  const top = Math.max(inset, Math.min(y, window.innerHeight - height - inset));
  // The menu grows from the pointer, even when it is clamped away from a viewport edge.
  return { x: left, y: top, originX: Math.max(0, Math.min(width, x - left)), originY: Math.max(0, Math.min(height, y - top)) };
}

export function ContextMenu({ children, items, label = "Context menu" }: ContextMenuProps) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  // The portal mounts on first open (client only) and stays so the menu can animate out.
  const [portal, setPortal] = useState(false);
  // Each open gets its own key, so reopening at a new point fades the old menu out in place
  // and grows a fresh one from the pointer instead of teleporting the visible menu.
  const [point, setPoint] = useState({ x: 0, y: 0, originX: 0, originY: 0, key: 0 });
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const insetProbe = useRef<HTMLSpanElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const pointer = useRef(false);
  const clearTimer = useRef(0);
  // A primary press on the target while the menu is open closes it; the click that follows must not reopen it.
  const pressedWhileOpen = useRef(false);
  // An exiting menu keeps its last props, so its handlers check this before moving focus or selecting.
  const live = useRef(false);

  const anchor = useRef({ x: 0, y: 0 });

  useEffect(() => { live.current = open; }, [open]);
  // The mounted panel and its inset token own placement before the first paint.
  useLayoutEffect(() => {
    const node = menuRef.current;
    const probe = insetProbe.current;
    if (!open || !node || !probe) return;
    const inset = parseFloat(getComputedStyle(probe).width);
    const next = clampTo(anchor.current.x, anchor.current.y, node.offsetWidth, node.offsetHeight, inset);
    setPoint(current => (current.x === next.x && current.y === next.y && current.originX === next.originX && current.originY === next.originY ? current : { ...next, key: current.key }));
  }, [open, point.key]);
  useEffect(() => () => window.clearTimeout(clearTimer.current), []);
  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')?.focus({ preventScroll: true });
    const closeOnPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnViewportChange = (event: Event) => {
      if (event.target instanceof Node && menuRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnPointerDown);
    window.addEventListener("scroll", closeOnViewportChange, true);
    window.addEventListener("resize", closeOnViewportChange);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointerDown);
      window.removeEventListener("scroll", closeOnViewportChange, true);
      window.removeEventListener("resize", closeOnViewportChange);
    };
  }, [open, point.key]);

  function showMenu(x: number, y: number) {
    anchor.current = { x, y };
    setPoint(current => ({ x, y, originX: 0, originY: 0, key: current.key + 1 }));
    window.clearTimeout(clearTimer.current);
    pointer.current = false;
    setHighlight(null);
    setPortal(true);
    setOpen(true);
  }

  function onTargetKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
      event.preventDefault();
      const rect = targetRef.current?.getBoundingClientRect();
      if (rect) showMenu(rect.left + floatingPlacement.motionContextMenu.targetInlineOffsetPx, rect.bottom + floatingPlacement.motionContextMenu.targetBlockGapPx);
    }
  }

  function onTargetClick() {
    if (pressedWhileOpen.current) { pressedWhileOpen.current = false; return; }
    const rect = targetRef.current?.getBoundingClientRect();
    if (rect) showMenu(rect.left + floatingPlacement.motionContextMenu.targetInlineOffsetPx, rect.bottom + floatingPlacement.motionContextMenu.targetBlockGapPx);
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const enabled = items.map((item, index) => ({ item, index })).filter(({ item }) => !item.disabled);
    const current = document.activeElement?.getAttribute("data-index");
    const currentPosition = enabled.findIndex(({ index }) => String(index) === current);
    let nextPosition: number | undefined;
    if (event.key === "ArrowDown") nextPosition = (currentPosition + 1) % enabled.length;
    if (event.key === "ArrowUp") nextPosition = currentPosition < 0 ? enabled.length - 1 : (currentPosition - 1 + enabled.length) % enabled.length;
    if (event.key === "Home") nextPosition = 0;
    if (event.key === "End") nextPosition = enabled.length - 1;
    if (nextPosition !== undefined && enabled.length) {
      event.preventDefault();
      event.currentTarget.querySelector<HTMLElement>(`[data-index="${enabled[nextPosition]!.index}"]`)?.focus();
    }
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); targetRef.current?.focus(); }
  }

  function place(item: HTMLElement, glide: boolean) {
    window.clearTimeout(clearTimer.current);
    const next = { index: Number(item.dataset.index), top: item.offsetTop, height: item.offsetHeight, danger: item.dataset.tone === "danger" };
    setHighlight(current => ({ ...next, glide: glide && current !== null }));
  }

  // Keyboard focus places the highlight instantly; the pointer makes it glide between rows.
  function onMenuFocus(event: FocusEvent<HTMLDivElement>) {
    const item = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[role="menuitem"]') : null;
    if (item) {
      // A pointer-opened menu focuses its first row without showing a highlight, like a native menu.
      if (!pointer.current && item.matches(":focus-visible")) place(item, false);
      return;
    }
    // A short grace period keeps the highlight gliding across the gap between rows.
    window.clearTimeout(clearTimer.current);
    clearTimer.current = window.setTimeout(() => setHighlight(null), pointer.current ? motionTokens.menuHighlight.pointerGapGraceMs : 0);
  }

  return <>
    <div ref={targetRef} className={styles.target} tabIndex={0} onPointerDown={event => { pressedWhileOpen.current = open && event.button === 0; }} onClick={onTargetClick} onContextMenu={event => { event.preventDefault(); showMenu(event.clientX, event.clientY); }} onKeyDown={onTargetKeyDown} aria-label={label} aria-haspopup="menu" aria-expanded={open}>
      {children}
    </div>
    {portal ? createPortal(<AnimatePresence>
      {open && <MotionRegion key={point.key} ref={node => { if (node) menuRef.current = node; }} data-rams-menu-surface="" className={styles.menu} role="menu" aria-label={label} tabIndex={-1} style={{ left: point.x, top: point.y, transformOrigin: `${point.originX}px ${point.originY}px` }} onKeyDown={onMenuKeyDown} onFocus={onMenuFocus} onPointerMoveCapture={() => { pointer.current = true; }} onKeyDownCapture={() => { pointer.current = false; }} onPointerLeave={event => { if (live.current) event.currentTarget.focus({ preventScroll: true }); }}
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: contextMotion.panelEnterScale }} animate={{ opacity: 1, scale: 1 }} exit={reduced ? { opacity: 0, transition: { duration: motionTokens.reduced.duration } } : { opacity: 0, scale: contextMotion.panelExitScale, transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } }} transition={reduced ? { duration: motionTokens.reduced.duration } : { default: motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } }}>
        <span ref={insetProbe} className={styles.insetProbe} aria-hidden="true" />
        <motion.span className={styles.highlight} data-tone={highlight?.danger ? "danger" : undefined} aria-hidden="true" initial={false} animate={highlight ? { y: highlight.top, height: highlight.height, opacity: 1 } : { opacity: 0 }} transition={{ default: highlight?.glide && !reduced ? motionTokens.spring.snappy : { duration: motionTokens.reduced.duration }, opacity: { duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.instant } }}/>
        {items.map((item, index) => <Button key={item.id} variant="ghost" size="sm" type="button" role="menuitem" tabIndex={-1} data-index={index} data-tone={item.destructive ? "danger" : undefined} style={{ "--rams-detail-i": index } as CSSProperties} disabled={item.disabled} className={[styles.item, item.destructive ? styles.destructive : ""].filter(Boolean).join(" ")} onPointerMove={event => { if (!live.current) return; window.clearTimeout(clearTimer.current); if (document.activeElement !== event.currentTarget) event.currentTarget.focus({ preventScroll: true }); if (highlight?.index !== index) place(event.currentTarget, true); }} onPointerLeave={() => { if (live.current) menuRef.current?.focus({ preventScroll: true }); }} onClick={() => { if (!live.current) return; live.current = false; item.onSelect?.(); setOpen(false); targetRef.current?.focus(); }}>
          <span className={styles.icon} aria-hidden="true">{item.icon ?? (item.checked ? <Check /> : <MoreHorizontal />)}</span><span>{item.label}</span>
        </Button>)}
      </MotionRegion>}
    </AnimatePresence>, document.body) : null}
  </>;
}

export const contextMenuExampleItems: ContextMenuItem[] = [
  { id: "trim", label: "Show trim boundary", checked: true },
  { id: "registration", label: "Show registration crosses", checked: false },
];

export default ContextMenu;
