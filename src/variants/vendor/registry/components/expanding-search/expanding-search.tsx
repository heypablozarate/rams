"use client";

import { forwardRef, useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode, RefObject } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, visualElementStore } from "motion/react";
import { Popover as Floating } from "radix-ui";
import { MotionPresenceDiv } from "@/variants/presence-controls";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { MotionAction } from "@/variants/motion-swap";
import type { HTMLMotionProps, MotionValue } from "motion/react";
import { Search, X } from "rams-icons";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import styles from "./expanding-search.module.css";

export interface ExpandingSearchItem {
  id: string;
  title: string;
  /** One short line under the title, such as the type, owner, or last edit. */
  meta?: string;
  /** Results gather under this heading, in the order groups first appear in `items`. */
  group?: string;
  icon?: ReactNode;
  /** Extra words that should also find this item. */
  keywords?: string[];
}

/**
 * A search that waits as an icon button until it is needed. Use it in headers and toolbars where a full field would crowd the layout.
 * The button morphs into the field, results unfold beneath it, and Escape, choosing a result, or leaving the field empty folds it back into the icon.
 * Place it in the space the field may grow into; it fills that space's width and keeps the button on the `anchor` edge.
 */
export interface ExpandingSearchProps {
  /** Names the button, the field, and the results, such as "Search projects and docs". */
  label: string;
  items: ExpandingSearchItem[];
  /** Shown before anything is typed, such as recent searches. */
  suggestions?: ExpandingSearchItem[];
  suggestionsLabel?: string;
  placeholder?: string;
  onSelect?: (item: ExpandingSearchItem) => void;
  onExpandedChange?: (expanded: boolean) => void;
  /** The widest the field grows. It never grows past its container. */
  expandedWidth?: number;
  maxResults?: number;
  /** The edge the button sits on; the field grows away from it. */
  anchor?: "start" | "end";
  /** A short tip under the empty state. */
  emptyHint?: string;
  className?: string;
}

type Group = { name: string; items: ExpandingSearchItem[] };
type Mode = "suggestions" | "results" | "empty";

const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const searchGeometry = motionTokens.keyframes.expandingSearch;

/** Title starts beat word starts, which beat matches inside a word, which beat keyword and meta matches. Ties keep the original order. */
function rank(items: ExpandingSearchItem[], query: string, limit: number) {
  const q = query.toLocaleLowerCase();
  const scored: { item: ExpandingSearchItem; score: number; order: number }[] = [];
  items.forEach((item, order) => {
    const title = item.title.toLocaleLowerCase();
    const at = title.indexOf(q);
    const extra = [item.meta ?? "", ...(item.keywords ?? [])].some(word => word.toLocaleLowerCase().includes(q));
    const score = at === 0 ? 0 : at > 0 && /[\s\-/]/.test(title[at - 1]!) ? 1 : at > 0 ? 2 : extra ? 3 : -1;
    if (score >= 0) scored.push({ item, score, order });
  });
  return scored.sort((a, b) => a.score - b.score || a.order - b.order).slice(0, limit).map(entry => entry.item);
}

function groupBy(list: ExpandingSearchItem[], source: ExpandingSearchItem[]): Group[] {
  const order = new Map<string, number>();
  source.forEach((item, index) => { const name = item.group ?? ""; if (!order.has(name)) order.set(name, index); });
  const groups = new Map<string, ExpandingSearchItem[]>();
  list.forEach(item => { const name = item.group ?? ""; groups.set(name, [...(groups.get(name) ?? []), item]); });
  return [...groups].sort((a, b) => (order.get(a[0]) ?? 0) - (order.get(b[0]) ?? 0)).map(([name, items]) => ({ name, items }));
}

function Match({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) : -1;
  if (at < 0) return text;
  return <>{text.slice(0, at)}<mark className={styles.mark}>{text.slice(at, at + query.length)}</mark>{text.slice(at + query.length)}</>;
}

/** The panel shares the field's width value, so on first open it unfolds out of the field; afterwards only its height follows the content. */
const Panel = forwardRef<HTMLDivElement, Omit<HTMLMotionProps<"div">, "children"> & { width: MotionValue<number>; fullWidth: number; children: ReactNode }>(function Panel({ width, fullWidth, children, ...props }, ref) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  useLayoutEffect(() => {
    if (!reduced || !panelRef.current) return;
    const controls = visualElementStore.get(panelRef.current)?.getValue("opacity")?.animation;
    if (controls && "complete" in controls && typeof controls.complete === "function") controls.complete();
  }, [reduced]);
  const bodyRef = useRef<HTMLDivElement>(null);
  // The first placement sees natural content height, not a zero-height fold.
  // Width still unfolds with the field; later content heights keep their spring.
  const height = useMotionValue<number | "auto">("auto");
  useLayoutEffect(() => {
    const panel = panelRef.current, body = bodyRef.current;
    if (!panel || !body || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const next = body.offsetHeight + panel.offsetHeight - panel.clientHeight;
      if (reduced || height.get() === "auto") height.jump(next);
      else animate(height, next, motionTokens.spring.smooth);
    });
    observer.observe(body);
    return () => observer.disconnect();
  }, [height, reduced]);
  // Reduced motion skips the unfold: the panel is its content's height from the first frame and only fades.
  return <MotionPresenceDiv {...props} ref={node => { panelRef.current = node; if (typeof ref === "function") ref(node); else if (ref) ref.current = node; }} className={styles.panel} style={{ ...props.style, width, height: reduced ? "auto" : height, "--rams-detail-es-width": `${fullWidth}px` } as HTMLMotionProps<"div">["style"]}
    initial={reduced ? false : { opacity: 0 }}
    animate={{ opacity: 1, transition: { duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.fast, ease: enter } }}
    exit={{ opacity: 0, transition: { duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.instant, ease: standard } }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>
    <div ref={bodyRef} className={styles.body}>{children}</div>
  </MotionPresenceDiv>;
});

/** Offsets ignore transforms, so they describe where rows sit in the list, not where a gliding row happens to be mid-flight. */
function offsetWithin(node: HTMLElement, container: HTMLElement) {
  let top = 0;
  let current: HTMLElement | null = node;
  while (current && current !== container) { top += current.offsetTop; current = current.offsetParent as HTMLElement | null; }
  return top;
}

interface ListboxProps { id: string; label: string; groups: Group[]; query: string; activeIndex: number; optionId: (item: ExpandingSearchItem) => string; reduced: boolean; keyboard: RefObject<boolean>; onHover: (index: number) => void; onChoose: (item: ExpandingSearchItem) => void }

function Listbox({ id, label, groups, query, activeIndex, optionId, reduced, keyboard, onHover, onChoose }: ListboxProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const flat = groups.flatMap(group => group.items);
  const layoutKey = flat.map(item => item.id).join("|");
  const activeItem = flat[activeIndex];
  const activeId = activeItem ? optionId(activeItem) : "";
  /** The highlight lives inside the active row, so it rides that row wherever it glides. Moving to another row, it starts where the old one was and springs home. */
  const travel = useMotionValue(0);
  const fade = useMotionValue(1);
  const last = useRef<{ id: string; set: string; top: number } | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    const row = activeId ? document.getElementById(activeId) : null;
    if (!list || !row) { last.current = null; return; }
    const top = offsetWithin(row, list);
    const previous = last.current;
    last.current = { id: activeId, set: layoutKey, top };
    // Same row: its highlight is already in place, and any travel still in flight stays relative to it.
    if (reduced) {
      travel.jump(0); fade.jump(1);
      if (keyboard.current && previous?.id !== activeId) row.scrollIntoView({ block: "nearest" });
      return;
    }
    if (previous?.id === activeId) return;
    if (previous && previous.set === layoutKey) {
      const velocity = travel.getVelocity();
      travel.jump(previous.top + travel.get() - top);
      animate(travel, 0, { ...motionTokens.spring.snappy, velocity });
    } else {
      // Nothing was highlighted, or new results arrived: it fades in on its row, without travel.
      travel.jump(0);
      fade.jump(0); animate(fade, 1, { duration: motionTokens.duration.instant, ease: enter });
    }
    if (keyboard.current) row.scrollIntoView({ block: "nearest" });
  }, [activeId, layoutKey, reduced, travel, fade, keyboard]);
  useLayoutEffect(() => () => { travel.stop(); fade.stop(); }, [travel, fade]);

  return <div ref={listRef} id={id} role="listbox" aria-label={label} className={styles.listbox}>
    <AnimatePresence mode="popLayout" initial={false}>
      {groups.map(group => {
        const headingId = `${id}-group:${encodeURIComponent(JSON.stringify(group.name))}`;
        return <MotionPresenceDiv key={group.name} role="group" aria-labelledby={group.name ? headingId : undefined} className={styles.group}
          layout={reduced ? false : "position"} layoutDependency={layoutKey}
          initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduced ? { opacity: 0, transition: { duration: motionTokens.reduced.duration } } : { opacity: 0, transition: { duration: motionTokens.duration.instant } }}
          transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : { opacity: { duration: motionTokens.duration.fast, ease: enter }, layout: motionTokens.spring.smooth }}>
          {group.name && <div id={headingId} className={styles.groupLabel} role="presentation">{group.name}</div>}
          <AnimatePresence mode="popLayout" initial={false}>
            {group.items.map(item => {
              const position = flat.indexOf(item);
              const active = position === activeIndex;
              return <MotionPresenceDiv key={item.id} id={optionId(item)} role="option" aria-selected={active} data-active={active || undefined} className={styles.option}
                layout={reduced ? false : "position"} layoutDependency={layoutKey}
                initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduced ? { opacity: 0, transition: { duration: motionTokens.reduced.duration } } : { opacity: 0, transition: { duration: motionTokens.duration.instant } }}
                transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : { opacity: { duration: motionTokens.duration.fast, ease: enter }, layout: motionTokens.spring.smooth }}
                onPointerMove={() => { if (!active) { keyboard.current = false; onHover(position); } }}
                onMouseDown={event => event.preventDefault()}
                onClick={() => onChoose(item)}>
                {active && <motion.span className={styles.highlight} style={{ y: travel, opacity: fade }} aria-hidden="true" />}
                {item.icon && <span className={styles.optionIcon} aria-hidden="true">{item.icon}</span>}
                <span className={styles.optionText}>
                  <span className={styles.optionTitle}><Match text={item.title} query={query} /></span>
                  {item.meta && <span className={styles.optionMeta}>{item.meta}</span>}
                </span>
              </MotionPresenceDiv>;
            })}
          </AnimatePresence>
        </MotionPresenceDiv>;
      })}
    </AnimatePresence>
  </div>;
}

export function ExpandingSearch({ label, items, suggestions = [], suggestionsLabel = "Recent", placeholder, onSelect, onExpandedChange, expandedWidth = searchGeometry.defaultWidthPx, maxResults = searchGeometry.visibleResultLimit, anchor = "end", emptyHint = "Try a shorter word or check the spelling.", className }: ExpandingSearchProps) {
  const id = useId();
  const reduced = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const insidePointers = useRef(new WeakSet<Event>());
  const [expanded, setExpanded] = useState(false);
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const [fullWidth, setFullWidth] = useState(expandedWidth);
  const [{ focused, opening }, setFocusState] = useState({ focused: false, opening: 0 });
  const setFocused = (next: boolean) => setFocusState(state => ({ focused: next, opening: next && !state.focused ? state.opening + 1 : state.opening }));
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const open = useRef(false);
  const size = useRef<{ collapsed: number; expanded: number }>({ collapsed: searchGeometry.initialCollapsedPx, expanded: expandedWidth });
  const width = useMotionValue<number>(searchGeometry.initialCollapsedPx);
  /** True while the last highlight move came from the keyboard, so only keyboard moves scroll the list. */
  const keyboard = useRef(false);

  // The corner radius follows the width: a circle while collapsed, the control radius once open. It rides the same spring, so the two never drift apart.
  const syncShape = useCallback((value: number) => {
    const { collapsed, expanded: full } = size.current;
    shellRef.current?.style.setProperty("--rams-detail-es-open", String(Math.min(1, Math.max(0, (value - collapsed) / Math.max(1, full - collapsed)))));
  }, []);
  useMotionValueEvent(width, "change", syncShape);

  // The field grows to its own limit or its container, whichever is smaller. Container resizes are followed at once; they are not the person's action.
  useLayoutEffect(() => {
    const root = rootRef.current, shell = shellRef.current;
    if (!root || !shell) return;
    const measure = () => {
      const collapsed = shell.offsetHeight || searchGeometry.initialCollapsedPx;
      const full = Math.max(collapsed, Math.min(expandedWidth, root.clientWidth));
      size.current = { collapsed, expanded: full };
      setFullWidth(full);
      root.style.setProperty("--rams-detail-es-width", `${full}px`);
      const goal = open.current ? full : collapsed;
      if (width.isAnimating() && !reduced) animate(width, goal, motionTokens.spring.morph);
      else width.jump(goal);
      syncShape(width.get());
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [expandedWidth, width, syncShape, reduced]);

  // Opening grows on the morph spring with a hint of overshoot; folding back settles without one, so the circle never dips below its own size.
  const morphTo = (goal: number) => { if (reduced) width.jump(goal); else animate(width, goal, goal >= width.get() ? motionTokens.spring.morph : motionTokens.spring.smooth); };

  // Focus moves inside the same click, so touch keyboards open; the field is inert until this flush makes it focusable.
  function expand() {
    if (open.current) return;
    open.current = true;
    flushSync(() => { setExpanded(true); setFocused(true); });
    inputRef.current?.focus({ preventScroll: true });
    morphTo(size.current.expanded);
    onExpandedChange?.(true);
  }

  function collapse(returnFocus: boolean) {
    if (!open.current) return;
    open.current = false;
    flushSync(() => { setExpanded(false); setFocused(false); setQuery(""); setActive(-1); });
    if (returnFocus) buttonRef.current?.focus({ preventScroll: true });
    morphTo(size.current.collapsed);
    onExpandedChange?.(false);
  }

  const trimmed = query.trim();
  const results = useMemo(() => trimmed ? rank(items, trimmed, maxResults) : [], [items, trimmed, maxResults]);
  const mode: Mode | null = !trimmed ? (suggestions.length ? "suggestions" : null) : results.length ? "results" : "empty";
  const groups = useMemo<Group[]>(() => mode === "suggestions" ? [{ name: suggestionsLabel, items: suggestions }] : mode === "results" ? groupBy(results, items) : [], [mode, suggestions, suggestionsLabel, results, items]);
  const flat = groups.flatMap(group => group.items);
  const activeIndex = Math.min(active, flat.length - 1);
  const activeItem = flat[activeIndex];
  const optionId = (item: ExpandingSearchItem) => `${id}-${mode}:${encodeURIComponent(JSON.stringify([item.group ?? "", item.id]))}`;
  const listboxId = `${id}-${mode}-listbox`;
  const panelOpen = expanded && focused && mode !== null;
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!panelOpen || !root) return;
    const sync = () => setDirection(getComputedStyle(root).direction === "rtl" ? "rtl" : "ltr");
    sync();
    const observer = new MutationObserver(sync);
    for (let element: Element | null = root; element; element = element.parentElement) {
      observer.observe(element, { attributes: true, attributeFilter: ["dir", "class", "style"] });
    }
    return () => observer.disconnect();
  }, [panelOpen]);
  const announcement = !panelOpen ? "" : mode === "empty" ? `No results for ${trimmed}` : mode === "results" ? `${flat.length} ${flat.length === 1 ? "result" : "results"}` : `${flat.length} ${suggestionsLabel.toLocaleLowerCase()} ${flat.length === 1 ? "item" : "items"}`;

  function choose(item: ExpandingSearchItem) {
    collapse(true);
    onSelect?.(item);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") { event.preventDefault(); collapse(true); return; }
    if (!panelOpen || !flat.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      keyboard.current = true;
      setActive(activeIndex < 0 ? (step > 0 ? 0 : flat.length - 1) : (activeIndex + step + flat.length) % flat.length);
    } else if (event.key === "Enter" && activeItem) {
      event.preventDefault();
      choose(activeItem);
    }
  }

  const clearHidden = reduced ? { opacity: 0 } : { opacity: 0, scale: searchGeometry.clearScale, filter: `blur(${motionTokens.blur.subtle}px)` };

  return <Floating.Root open={panelOpen} onOpenChange={next => { if (!next) { setFocused(false); if (!query.trim()) collapse(false); } }}><div ref={rootRef} onPointerDownCapture={event => insidePointers.current.add(event.nativeEvent)} className={[styles.root, className].filter(Boolean).join(" ")} data-anchor={anchor} style={{ "--rams-detail-expanding-search-press-scale": searchGeometry.pressScale } as CSSProperties}>
    <Floating.Anchor asChild><motion.div ref={shellRef} className={styles.shell} data-expanded={expanded || undefined} style={{ width }}>
      <button ref={buttonRef} type="button" className={styles.trigger} aria-label={label} hidden={expanded} onClick={expand} />
      <Search className={styles.icon} width="var(--rams-detail-search-field-leading-glyph-size)" height="var(--rams-detail-search-field-leading-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" aria-hidden="true" />
      {/* The placeholder waits for the shape to start moving, then fades in; on close it leaves first. */}
      <motion.input ref={inputRef} className={styles.input} type="text" role="combobox" inert={!expanded} value={query} placeholder={placeholder ?? label}
        aria-label={label} aria-expanded={panelOpen} aria-controls={panelOpen && mode !== "empty" ? listboxId : undefined} aria-autocomplete="list"
        aria-activedescendant={panelOpen && activeItem ? optionId(activeItem) : undefined}
        autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="search"
        initial={false} animate={{ opacity: expanded ? 1 : 0 }}
        transition={expanded ? { duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.standard, ease: enter, delay: reduced ? motionTokens.reduced.stagger : motionTokens.sequence.handoff } : { duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.instant, ease: standard }}
        onChange={event => { const next = event.target.value; setQuery(next); setActive(next.trim() ? 0 : -1); keyboard.current = false; }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          // Switching windows keeps the search as it was; the field refocuses on return.
          if (typeof document !== "undefined" && !document.hasFocus()) return;
          setFocused(false);
          if (open.current && !inputRef.current?.value.trim()) collapse(false);
        }}
        onKeyDown={handleKeyDown} />
      <AnimatePresence initial={false}>
        {expanded && query && <MotionAction key="clear" type="button" tabIndex={-1} className={styles.clear} aria-label="Clear search"
          onMouseDown={event => event.preventDefault()}
          onClick={() => { setQuery(""); setActive(-1); inputRef.current?.focus({ preventScroll: true }); }}
          initial={reduced ? false : clearHidden} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ ...clearHidden, transition: { duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.instant, ease: standard } }}
          transition={reduced ? { duration: motionTokens.reduced.duration } : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast }, filter: { duration: motionTokens.duration.fast } }}>
          <X width="var(--rams-detail-motion-button-glyph-size)" height="var(--rams-detail-motion-button-glyph-size)" strokeWidth="var(--rams-detail-motion-button-glyph-stroke)" aria-hidden="true" />
        </MotionAction>}
      </AnimatePresence>
    </motion.div></Floating.Anchor>
    <AnimatePresence>
      {panelOpen && <Floating.Portal forceMount><Floating.Content key={opening} forceMount asChild role="presentation" side="bottom" dir={direction} align={anchor} sideOffset={searchGeometry.panelOffsetPx} collisionPadding={searchGeometry.panelCollisionPx}
        onOpenAutoFocus={event => event.preventDefault()} onCloseAutoFocus={event => event.preventDefault()}
        onEscapeKeyDown={event => { event.preventDefault(); collapse(true); }}
        onInteractOutside={event => {
          const root = rootRef.current;
          // A reduced exit can detach the clear glyph before Radix dispatches its deferred outside event.
          if (root?.contains(event.target as Node) || insidePointers.current.has(event.detail.originalEvent)) event.preventDefault();
        }}><Panel key="panel" width={width} fullWidth={fullWidth}>
        <AnimatePresence mode="popLayout" initial={false}>
            <MotionPresenceDiv key={mode} className={styles.view}
              initial={reduced ? { opacity: 0 } : { opacity: 0, filter: `blur(${motionTokens.blur.subtle}px)` }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={reduced ? { opacity: 0, transition: { duration: motionTokens.reduced.duration, ease: standard } } : { opacity: 0, transition: { duration: motionTokens.duration.instant, ease: standard } }}
              transition={{ duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.fast, ease: enter }}>
              {mode === "empty"
                ? <div className={styles.empty}><p className={styles.emptyTitle}>No results for “{trimmed}”</p><p className={styles.emptyHint}>{emptyHint}</p></div>
                : <Listbox id={listboxId} label={mode === "suggestions" ? suggestionsLabel : `Results for ${trimmed}`} groups={groups} query={mode === "results" ? trimmed : ""} activeIndex={activeIndex} optionId={optionId} reduced={reduced} keyboard={keyboard} onHover={setActive} onChoose={choose} />}
            </MotionPresenceDiv>
        </AnimatePresence>
      </Panel></Floating.Content></Floating.Portal>}
    </AnimatePresence>
    <span className={styles.srOnly} role="status" aria-live="polite">{announcement}</span>
  </div></Floating.Root>;
}

export default ExpandingSearch;
