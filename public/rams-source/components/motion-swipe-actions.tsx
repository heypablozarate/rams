"use client";
import "./motion-fields.css";

import { Children, createContext, useContext, useEffect, useEffectEvent, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, Dispatch, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode, SetStateAction } from "react";
import { DropdownMenu as Menu } from "radix-ui";
import { AnimatePresence, animate, motion, useAnimationControls, usePresence, useMotionValue, useTransform } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import type { AnimationPlaybackControls, MotionValue } from "motion/react";
import { floatingPlacement } from "./floating-placement";
import { MoreHorizontal } from "lucide-react";
import { motionTokens } from "./motion-tokens";
import styles from "./motion-swipe-actions.module.css";

export interface SwipeAction {
  label: string;
  icon: ReactNode;
  /** Fill of the revealed action. Pair `danger` with a label that names the destructive result. */
  tone?: "neutral" | "accent" | "danger";
  /** Runs for a full swipe, a tap on the revealed action, or the More actions menu. Remove the item here unless `keepRow` is set. */
  onSelect: () => void;
  /** The row springs home after the action instead of sliding away and collapsing, for actions such as Mark as unread. */
  keepRow?: boolean;
}

/**
 * A list whose rows reveal actions on a horizontal swipe, the way a mail inbox does. Use it for short lists where people triage items quickly.
 * Only one row stays open at a time; touching anywhere else or pressing Escape puts it away. Every row also has a More actions menu with the same
 * actions, so keyboard and screen reader users never need the gesture.
 */
export interface SwipeActionsProps { label: string; children: ReactNode; className?: string; emptyState?: ReactNode }

/** One row. `leading` actions sit under the left edge and `trailing` actions under the right; the outermost action on each side commits on a full swipe. */
export interface SwipeActionsRowProps {
  /** Names the row in its menu button, for example the message subject. */
  label: string;
  leading?: SwipeAction[];
  trailing?: SwipeAction[];
  /** Lets a long swipe commit the outermost action without a tap. On by default. */
  fullSwipe?: boolean;
  children: ReactNode;
  className?: string;
}

type Side = "leading" | "trailing";
type Group = { openId: string | null; setOpenId: Dispatch<SetStateAction<string | null>>; rows: Map<string, HTMLElement>; rememberFocus: (row: HTMLElement, menu: Element) => void };
type Drag = { pointer: number; type: string; startX: number; startY: number; origin: number; locked: "x" | "y" | null; samples: [number, number][] };

/** Width of one action while a row rests open. */
const swipePresentation = motionTokens.keyframes.swipeActions;
const ACTION = swipePresentation.actionWidthPx;
/** Movement before a press is read as a swipe or handed to the page as a scroll. */
const SLOP = swipePresentation.dragSlopPx;
/** Seconds of travel projected from the release velocity, roughly a 0.99 deceleration rate. */
const PROJECTION = swipePresentation.projectionSeconds;
/** Release speed in px/s that counts as a flick. */
const FLICK = swipePresentation.flickSpeedPxPerSecond;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
/** Past its last stop the row still follows, but every pixel costs more, like pulling against elastic. */
const rubberBand = (overshoot: number, dimension: number) => (1 - 1 / (overshoot * swipePresentation.edgeResistance / dimension + 1)) * dimension;
const sideOf = (value: number): Side | null => value > 0 ? "leading" : value < 0 ? "trailing" : null;

const GroupContext = createContext<Group>({ openId: null, setOpenId: () => {}, rows: new Map(), rememberFocus: () => {} });

export function SwipeActions({ label, children, className, emptyState }: SwipeActionsProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [rows] = useState(() => new Map<string, HTMLElement>());
  const listRef = useRef<HTMLUListElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<{ row: HTMLElement; menu: Element; next: Element | null; previous: Element | null } | null>(null);
  const rememberFocus = (row: HTMLElement, menu: Element) => { pendingFocus.current = { row, menu, next: row.nextElementSibling, previous: row.previousElementSibling }; };
  useEffect(() => {
    const cancelOutside = (event: Event) => {
      const pending = pendingFocus.current;
      const target = event.target;
      if (pending && target instanceof Node && !pending.row.contains(target) && !pending.menu.contains(target)) pendingFocus.current = null;
    };
    const cancelTab = (event: KeyboardEvent) => { if (event.key === "Tab") pendingFocus.current = null; };
    document.addEventListener("focusin", cancelOutside, true);
    document.addEventListener("pointerdown", cancelOutside, true);
    document.addEventListener("keydown", cancelTab, true);
    return () => { pendingFocus.current = null; document.removeEventListener("focusin", cancelOutside, true); document.removeEventListener("pointerdown", cancelOutside, true); document.removeEventListener("keydown", cancelTab, true); };
  }, []);
  const restoreFocus = () => {
    const pending = pendingFocus.current;
    if (!pending) return;
    requestAnimationFrame(() => {
      if (pendingFocus.current !== pending) return;
      const list = listRef.current;
      if (!list) { pendingFocus.current = null; return; }
      if (pending.row.isConnected) return;
      pendingFocus.current = null;
      const active = document.activeElement;
      if (active !== document.body && active !== null && !pending.row.contains(active)) return;
      const available = (node: Element | null) => node instanceof HTMLElement && node.isConnected && !("removing" in node.dataset) ? node.querySelector<HTMLElement>("[data-swipe-more]") : null;
      (available(pending.next) ?? available(pending.previous) ?? list.querySelector<HTMLElement>('li:not([data-removing]) [data-swipe-more]') ?? groupRef.current)?.focus({ preventScroll: true });
    });
  };
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new MutationObserver(() => {
      const pending = pendingFocus.current;
      if (pending && !pending.row.isConnected) restoreFocus();
    });
    observer.observe(list, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!openId) return;
    const onPointerDown = (event: PointerEvent) => { const row = rows.get(openId); if (row && event.target instanceof Node && row.contains(event.target)) return; setOpenId(null); };
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpenId(null); };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown, true); document.removeEventListener("keydown", onKeyDown); };
  }, [openId, rows]);
  const group = useMemo(() => ({ openId, setOpenId, rows, rememberFocus }), [openId, rows]);
  return <GroupContext.Provider value={group}>
    <div ref={groupRef} role="group" aria-label={label} tabIndex={-1} className={styles.group} data-empty={Children.toArray(children).length === 0 ? "" : undefined}>
    <div className={[styles.surface, className].filter(Boolean).join(" ")}>
      <ul ref={listRef} role="list" aria-label={label} tabIndex={-1} className={styles.list}>
        <AnimatePresence initial={false}>{children}</AnimatePresence>
      </ul>
    </div>
    {Children.toArray(children).length === 0 && (emptyState ?? <span className={styles.emptyFocusLabel}>{label}</span>)}
    </div>
  </GroupContext.Provider>;
}

function velocityOf(samples: [number, number][]) {
  const last = samples[samples.length - 1];
  if (!last) return 0;
  const first = samples.find(sample => last[0] - sample[0] <= swipePresentation.velocityWindowMs) ?? last;
  const elapsed = (last[0] - first[0]) / 1000;
  return elapsed > 0 ? (last[1] - first[1]) / elapsed : 0;
}

export function SwipeActionsRow({ label, leading = [], trailing = [], fullSwipe = true, children, className }: SwipeActionsRowProps) {
  const { openId, setOpenId, rows, rememberFocus } = useContext(GroupContext);
  const id = useId();
  const reduced = useReducedMotion() ?? false;
  const [present, safeToRemove] = usePresence();
  const rowAnimation = useAnimationControls();
  const rowRef = useRef<HTMLLIElement>(null);
  const x = useMotionValue(0);
  const cover = useMotionValue(0);
  const [covering, setCovering] = useState<{ side: Side; index: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const width = useRef(0);
  const drag = useRef<Drag | null>(null);
  const travel = useRef<AnimationPlaybackControls | null>(null);
  const stretch = useRef<AnimationPlaybackControls | null>(null);
  const armed = useRef(false);
  const leaving = useRef(false);
  const swallowClick = useRef(false);
  const restoreTimer = useRef(0);
  const stop = useRef(0);

  useLayoutEffect(() => {
    if (!reduced) return;
    travel.current?.stop();
    stretch.current?.stop();
    if (drag.current?.locked === "x") swallowClick.current = true;
    drag.current = null;
    armed.current = false;
    if (rowRef.current) delete rowRef.current.dataset.dragging;
    x.jump(stop.current);
    cover.jump(leaving.current ? 1 : 0);
  }, [cover, reduced, x]);
  useLayoutEffect(() => () => {
    travel.current?.stop();
    stretch.current?.stop();
  }, []);

  const actionsOf = (side: Side) => side === "leading" ? leading : trailing;
  const openWidth = (side: Side) => actionsOf(side).length * ACTION;
  const outermost = (side: Side) => side === "leading" ? 0 : trailing.length - 1;
  const canCommit = (side: Side) => fullSwipe && actionsOf(side).length > 0;
  const threshold = (side: Side) => Math.max(openWidth(side) + swipePresentation.commitClearancePx, width.current * swipePresentation.commitWidthShare);

  function stretchTo(value: number) {
    stretch.current?.stop();
    if (reduced) { cover.jump(value); return; }
    stretch.current = animate(cover, value, motionTokens.spring.morph);
  }

  /** Springs the row to a stop, carrying the release velocity. Travel snaps instantly with reduced motion. */
  function settle(target: number, velocity = 0) {
    if (armed.current || (target !== 0 && cover.get() !== 0)) stretchTo(0);
    armed.current = false;
    stop.current = target;
    const from = x.get();
    const home = () => { if (target === 0) { stretch.current?.stop(); cover.jump(0); } };
    if (reduced) { x.jump(target); home(); }
    else {
      // Heading home, the spring may not carry the row past zero, or the opposite actions would flash.
      const toward = target === 0 && Math.sign(velocity) === -Math.sign(from);
      const launch = toward ? Math.sign(velocity) * Math.min(Math.abs(velocity), Math.abs(from) * swipePresentation.homeVelocityPerPx) : velocity;
      travel.current = animate(x, target, { ...(target === 0 ? motionTokens.spring.smooth : motionTokens.spring.snappy), velocity: launch, onComplete: home });
    }
    if (target === 0) setOpenId(current => current === id ? null : current);
    else setOpenId(id);
  }

  /** The chosen action stretches over the whole row while the row leaves in its direction; the list then closes the gap. */
  function commit(side: Side, index: number, velocity = 0, viaMenu = false) {
    const action = actionsOf(side)[index];
    if (!action || leaving.current) return;
    // A menu action may finish asynchronously or retain its row; keep its focused trigger visible.
    if (viaMenu) { action.onSelect(); settle(0, velocity); return; }
    const direction = side === "leading" ? 1 : -1;
    armed.current = false;
    setCovering({ side, index });
    stretchTo(1);
    if (action.keepRow) { action.onSelect(); settle(0, velocity); return; }
    leaving.current = true;
    const row = rowRef.current;
    if (row) row.dataset.removing = "";
    travel.current?.stop();
    const end = direction * (width.current + swipePresentation.exitClearancePx);
    stop.current = end;
    if (reduced) x.jump(end);
    else travel.current = animate(x, end, { ...motionTokens.spring.smooth, velocity: Math.sign(velocity) === direction ? velocity : 0 });
    setOpenId(current => current === id ? null : current);
    action.onSelect();
    // A list that keeps the item gets its row back instead of an empty band of colour.
    window.clearTimeout(restoreTimer.current);
    restoreTimer.current = window.setTimeout(() => { if (!leaving.current) return; leaving.current = false; if (row) delete row.dataset.removing; settle(0); }, swipePresentation.retainedRowRestoreMs);
  }

  function arm(value: number, pointerType: string) {
    const side = sideOf(value);
    const limit = side ? threshold(side) : Infinity;
    const next = !!side && canCommit(side) && Math.abs(value) > (armed.current ? limit - swipePresentation.rearmTravelPx : limit);
    if (next === armed.current || !side) { if (!side && armed.current) { armed.current = false; stretchTo(0); } return; }
    armed.current = next;
    if (next) {
      setCovering({ side, index: outermost(side) });
      if (pointerType === "touch") navigator.vibrate?.(swipePresentation.vibrationMs);
    }
    stretchTo(next ? 1 : 0);
  }

  function constrain(raw: number) {
    const side = sideOf(raw);
    if (!side) return 0;
    const dimension = width.current || swipePresentation.fallbackWidthPx;
    const limit = actionsOf(side).length === 0 ? 0 : canCommit(side) ? dimension : openWidth(side);
    const distance = Math.abs(raw);
    return Math.sign(raw) * (distance <= limit ? distance : limit + rubberBand(distance - limit, dimension));
  }

  function release(velocity: number) {
    const value = x.get(), side = sideOf(value);
    if (!side || actionsOf(side).length === 0) { settle(0, velocity); return; }
    const direction = side === "leading" ? 1 : -1;
    const distance = Math.abs(value), outward = velocity * direction, open = openWidth(side);
    const projected = distance + outward * PROJECTION;
    const flung = distance > open && outward > FLICK && projected > threshold(side);
    // A flick back toward home cancels an armed full swipe.
    if (canCommit(side) && ((armed.current && outward > -FLICK) || flung)) { commit(side, outermost(side), velocity); return; }
    settle(projected > open * swipePresentation.openSnapShare ? direction * open : 0, velocity);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    swallowClick.current = false;
    if (leaving.current || !event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    // Catch the row mid-flight: the next move retargets from wherever it is now.
    travel.current?.stop();
    drag.current = { pointer: event.pointerId, type: event.pointerType, startX: event.clientX, startY: event.clientY, origin: x.get(), locked: null, samples: [[event.timeStamp, event.clientX]] };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId || current.locked === "y") return;
    if (!current.locked) {
      const dx = event.clientX - current.startX, dy = event.clientY - current.startY;
      if (Math.hypot(dx, dy) < SLOP) return;
      if (Math.abs(dy) > Math.abs(dx)) { current.locked = "y"; return; }
      // Measure from here, so crossing the slop never jumps the row.
      current.locked = "x";
      current.startX = event.clientX;
      event.currentTarget.setPointerCapture(event.pointerId);
      if (rowRef.current) rowRef.current.dataset.dragging = "";
      setOpenId(id);
    }
    const value = constrain(current.origin + event.clientX - current.startX);
    x.set(value);
    current.samples.push([event.timeStamp, event.clientX]);
    if (current.samples.length > swipePresentation.velocitySampleLimit) current.samples.shift();
    arm(value, current.type);
  }

  function onPointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId) return;
    drag.current = null;
    if (current.locked === "x") {
      swallowClick.current = true;
      if (rowRef.current) delete rowRef.current.dataset.dragging;
      current.samples.push([event.timeStamp, event.clientX]);
      release(event.type === "pointercancel" ? 0 : velocityOf(current.samples));
      return;
    }
    // A tap on an open row closes it instead of acting on what is underneath.
    if (current.locked === null && Math.abs(x.get()) > swipePresentation.dragCaptureTolerancePx) { swallowClick.current = true; settle(0); }
  }

  function onClickCapture(event: ReactMouseEvent<HTMLDivElement>) {
    if (!swallowClick.current) return;
    swallowClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  }


  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    rows.set(id, row);
    width.current = row.offsetWidth;
    const observer = new ResizeObserver(([entry]) => { if (entry) width.current = entry.contentRect.width; });
    observer.observe(row);
    return () => { observer.disconnect(); rows.delete(id); window.clearTimeout(restoreTimer.current); setOpenId(current => current === id ? null : current); };
  }, [id, rows, setOpenId]);

  // Another row opened, or someone touched outside: put this one away.
  const closeForOthers = useEffectEvent(() => { if (openId !== id && !leaving.current && drag.current?.locked !== "x" && x.get() !== 0) settle(0); });
  useEffect(() => { closeForOthers(); }, [openId]);

  // Undo brought the item back while it was still leaving: slide it home as the height reopens.
  const returnHome = useEffectEvent(() => {
    if (!leaving.current) return;
    leaving.current = false;
    window.clearTimeout(restoreTimer.current);
    if (rowRef.current) delete rowRef.current.dataset.removing;
    settle(0);
  });
  useEffect(() => { if (present) returnHome(); else setMenuOpen(false); }, [present]);

  const menuItems = [...leading.map((action, index) => ({ action, side: "leading" as const, index })), ...trailing.map((action, index) => ({ action, side: "trailing" as const, index }))];
  useLayoutEffect(() => {
    let current = true;
    rowAnimation.stop();
    if (reduced) rowAnimation.set(present ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 });
    else if (present) {
      void rowAnimation.start({ height: "auto", opacity: 1, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } } });
    } else {
      void rowAnimation.start({ height: 0, opacity: 0, transition: { height: { ...motionTokens.spring.smooth, delay: motionTokens.sequence.settle }, opacity: { duration: motionTokens.duration.instant, delay: motionTokens.sequence.settle } } })
        .then(() => { if (current) safeToRemove?.(); });
    }
    return () => { current = false; rowAnimation.stop(); };
  }, [present, reduced, rowAnimation, safeToRemove]);
  useEffect(() => { if (!present && reduced) safeToRemove?.(); }, [present, reduced, safeToRemove]);

  return <motion.li ref={rowRef} className={[styles.row, className].filter(Boolean).join(" ")} style={{ "--rams-detail-swipe-action-width": `${ACTION}px` } as CSSProperties}
    inert={!present || undefined} aria-hidden={!present || undefined}
    initial={reduced ? false : { height: 0, opacity: 0 }} animate={rowAnimation}>
    {(["leading", "trailing"] as const).map(side => actionsOf(side).map((action, index) => {
      const count = actionsOf(side).length;
      const rank = side === "leading" ? count - 1 - index : index;
      const coverRank = covering?.side === side ? (side === "leading" ? count - 1 - covering.index : covering.index) : null;
      return <ActionLayer key={`${side}-${index}`} action={action} side={side} rank={rank} count={count} coverRank={coverRank} x={x} cover={cover} onPress={() => commit(side, index)} />;
    }))}
    <motion.div className={styles.content} style={{ x }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerEnd} onPointerCancel={onPointerEnd} onClickCapture={onClickCapture}>
      <div className={styles.body}>{children}</div>
      {menuItems.length > 0 && <Menu.Root open={present && menuOpen} onOpenChange={setMenuOpen}>
        {/* Opens on click rather than on press, so a swipe that starts on the button still moves the row. */}
        <Menu.Trigger className={styles.more} data-swipe-more="" aria-label={`More actions for ${label}`} onPointerDown={event => event.preventDefault()} onClick={event => { if (event.detail > 0) setMenuOpen(open => !open); }}>
          <MoreHorizontal size="var(--rams-detail-swipe-more-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" aria-hidden="true" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content className={styles.menu} align="end" sideOffset={floatingPlacement.motionDropdown.anchorGapPx} collisionPadding={floatingPlacement.motionDropdown.collisionInsetPx}
            style={{ "--rams-detail-swipe-menu-viewport-inset": `${floatingPlacement.motionDropdown.collisionInsetPx}px` } as CSSProperties} loop>
            {menuItems.map(({ action, side, index }, order) => <Menu.Item key={`${side}-${index}`} className={styles.item} data-tone={action.tone} style={{ "--rams-detail-i": order } as CSSProperties} onSelect={() => { const menu = document.activeElement?.closest('[role="menu"]'); if (!action.keepRow && rowRef.current && menu) rememberFocus(rowRef.current, menu); commit(side, index, 0, true); }}>
              <span className={styles.itemIcon} aria-hidden="true">{action.icon}</span>{action.label}
            </Menu.Item>)}
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>}
    </motion.div>
  </motion.li>;
}

type LayerProps = { action: SwipeAction; side: Side; rank: number; count: number; coverRank: number | null; x: MotionValue<number>; cover: MotionValue<number>; onPress: () => void };

/**
 * One revealed action. Rank 0 sits against the content and the highest rank at the row's outer edge. Every layer spans the full row and slides in by
 * transform only, so the actions share the revealed space evenly, widen together past the resting width, and the covering action can stretch across the row.
 */
function ActionLayer({ action, side, rank, count, coverRank, x, cover, onPress }: LayerProps) {
  const direction = side === "leading" ? 1 : -1;
  const segment = useTransform(x, value => Math.max(0, value * direction) / count);
  // Distance from the row's outer edge to this layer's inner edge.
  const inset = useTransform([x, cover], ([value = 0, progress = 0]: number[]) => {
    const revealed = Math.max(0, value * direction), base = (count - rank) * revealed / count;
    if (coverRank === rank) return base + progress * (revealed - base);
    if (coverRank !== null && rank > coverRank) return base * (1 - progress);
    return base;
  });
  const shift = useTransform(inset, value => direction * value);
  // The glyph rides the centre of its share, then hugs the content edge while this action covers the row.
  const glyphX = useTransform([segment, cover], ([share = 0, progress = 0]: number[]) => -direction * (coverRank === rank ? share / 2 + progress * (ACTION / 2 - share / 2) : share / 2));
  const iconReveal = useTransform([segment, cover], ([share = 0, progress = 0]: number[]) => {
    const own = clamp01((share / ACTION - swipePresentation.iconRevealStart) / swipePresentation.iconRevealSpan);
    if (coverRank === rank) return Math.max(own, progress);
    return coverRank === null ? own : own * (1 - progress);
  });
  const labelReveal = useTransform([segment, cover], ([share = 0, progress = 0]: number[]) => {
    const own = clamp01((share / ACTION - swipePresentation.labelRevealStart) / swipePresentation.labelRevealSpan);
    if (coverRank === rank) return Math.max(own, progress);
    return coverRank === null ? own : own * (1 - progress);
  });
  const iconScale = useTransform(iconReveal, value => swipePresentation.iconStartScale + (1 - swipePresentation.iconStartScale) * value);
  // The menu button is the accessible path, so the revealed copy stays out of the tab order and the accessibility tree.
  return <motion.button type="button" tabIndex={-1} aria-hidden="true" className={styles.layer} data-side={side} data-tone={action.tone ?? "neutral"} style={{ x: shift, zIndex: rank - count }} onClick={onPress}>
    <motion.span className={styles.anchor} style={{ x: glyphX }}>
      <span className={styles.glyph}>
        <motion.span className={styles.icon} style={{ opacity: iconReveal, scale: iconScale }}>{action.icon}</motion.span>
        <motion.span className={styles.label} style={{ opacity: labelReveal }}>{action.label}</motion.span>
      </span>
    </motion.span>
  </motion.button>;
}

export default SwipeActions;
