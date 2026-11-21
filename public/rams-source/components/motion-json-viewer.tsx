"use client";
import "./motion-fields.css";

import { ButtonBase as OwnButton } from "./button";
import { Input as OwnInput } from "./input";

import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { AnimatePresence, LayoutGroup, animate, motion } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import { MotionPresenceDiv, MotionPresenceSpan } from "./presence-controls";
import { MotionSwap } from "./motion-swap";
import type { AnimationPlaybackControls, Transition } from "motion/react";
import { Check, ChevronDown, ChevronRight, ChevronUp, ChevronsDownUp, ChevronsUpDown, Copy, Link2, Search, X } from "lucide-react";
import { motionTokens } from "./motion-tokens";
import { collectionPresentation } from "./collection-presentation";
import styles from "./motion-json-viewer.module.css";

export type JsonValueType = "object" | "array" | "string" | "number" | "boolean" | "null" | "other";

export interface JsonViewerCopyDetail {
  kind: "value" | "path";
  path: string;
  text: string;
}

/**
 * A collapsible tree for JSON. Values are colored by type, branches unfold row by row, search highlights every match and
 * opens the branches that hold them, long arrays and objects load in pages, and each row can copy its value or path.
 * The tree follows the WAI-ARIA tree pattern: arrows move and open, Home and End jump, Enter toggles, and the modifier
 * key with C copies the focused value.
 */
export interface JsonViewerProps {
  data: unknown;
  /** Name of the root in paths, as in `root.users[0].name`. Defaults to "root". */
  rootName?: string;
  /** Levels open on first render when `defaultExpanded` is not set. Defaults to 1, which opens the root. */
  defaultExpandDepth?: number;
  /** Paths of open branches. */
  expanded?: string[];
  defaultExpanded?: string[];
  onExpandedChange?: (paths: string[]) => void;
  /** Show the search field. Defaults to true. */
  searchable?: boolean;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  /** Children shown per page in a long array or object. Defaults to 50. */
  pageSize?: number;
  /** Show copy value and copy path actions. Defaults to true. */
  copyable?: boolean;
  onCopy?: (detail: JsonViewerCopyDetail) => void;
  /** Called when a row becomes the current one. */
  onSelect?: (detail: { path: string; value: unknown; type: JsonValueType }) => void;
  /** Show the path of the current row under the tree. Defaults to true. */
  showPath?: boolean;
  /** Height of the scrolling tree area. Defaults to 420px. */
  maxHeight?: number | string;
  /** Accessible name of the tree. */
  label?: string;
  className?: string;
}

type Row = {
  id: string;
  kind: "node" | "more";
  level: number;
  name: string | number | null;
  value: unknown;
  type: JsonValueType;
  count: number;
  open: boolean;
  parent: string | null;
  posinset: number;
  setsize: number;
  /** For "more" rows: how many children are still hidden. */
  hidden?: number;
};

const IDENT = /^[A-Za-z_$][\w$]*$/;

function typeOf(value: unknown): JsonValueType {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  switch (typeof value) {
    case "object": return "object";
    case "string": return "string";
    case "number": case "bigint": return "number";
    case "boolean": return "boolean";
    default: return "other";
  }
}
const isBranch = (type: JsonValueType) => type === "object" || type === "array";
function entries(value: unknown): [string | number, unknown][] {
  if (Array.isArray(value)) return value.map((item, index) => [index, item]);
  if (value && typeof value === "object") return Object.entries(value as Record<string, unknown>);
  return [];
}
const childPath = (parent: string, key: string | number) => typeof key === "number" ? `${parent}[${key}]` : IDENT.test(key) ? `${parent}.${key}` : `${parent}[${JSON.stringify(key)}]`;
const within = (ancestor: string, id: string) => id === ancestor || id.startsWith(`${ancestor}.`) || id.startsWith(`${ancestor}[`);

function primitiveText(value: unknown, type: JsonValueType) {
  if (type === "string") return value as string;
  if (type === "null") return "null";
  return String(value);
}
function copyText(value: unknown, type: JsonValueType) {
  if (type === "string") return value as string;
  if (isBranch(type)) return JSON.stringify(value, null, 2);
  return primitiveText(value, type);
}
const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
const countLabel = (row: { type: JsonValueType; count: number }) => row.type === "array" ? plural(row.count, "item", "items") : plural(row.count, "key", "keys");

/** Every container path, for expand all. */
function allBranches(data: unknown, rootName: string) {
  const out: string[] = [];
  const visit = (value: unknown, id: string) => {
    if (!isBranch(typeOf(value))) return;
    out.push(id);
    for (const [key, child] of entries(value)) visit(child, childPath(id, key));
  };
  visit(data, rootName);
  return out;
}
function branchesToDepth(data: unknown, rootName: string, depth: number) {
  const out: string[] = [];
  const visit = (value: unknown, id: string, level: number) => {
    if (level >= depth || !isBranch(typeOf(value))) return;
    out.push(id);
    for (const [key, child] of entries(value)) visit(child, childPath(id, key), level + 1);
  };
  visit(data, rootName, 0);
  return out;
}

type SearchResult = { matches: string[]; ancestors: Set<string>; needed: Map<string, number> };
/** Finds keys and primitive values that contain the query, the branches that hold them, and how far each page must reach. */
function searchJson(data: unknown, rootName: string, needle: string): SearchResult {
  const matches: string[] = [];
  const ancestors = new Set<string>();
  const needed = new Map<string, number>();
  const frames: [string, number][] = [];
  const visit = (value: unknown, id: string, name: string | number | null) => {
    if (matches.length >= collectionPresentation.jsonSearchLimit) return;
    const type = typeOf(value);
    const keyHit = typeof name === "string" && name.toLowerCase().includes(needle);
    const valueHit = !isBranch(type) && primitiveText(value, type).toLowerCase().includes(needle);
    if (keyHit || valueHit) {
      matches.push(id);
      for (const [frame, index] of frames) {
        ancestors.add(frame);
        needed.set(frame, Math.max(needed.get(frame) ?? 0, index + 1));
      }
    }
    if (!isBranch(type)) return;
    entries(value).forEach(([key, child], index) => {
      frames.push([id, index]);
      visit(child, childPath(id, key), key);
      frames.pop();
    });
  };
  visit(data, rootName, null);
  return { matches, ancestors, needed };
}

function Highlight({ text, needle, current }: { text: string; needle: string; current: boolean }) {
  if (!needle) return <>{text}</>;
  const lower = text.toLowerCase();
  const parts: ReactNode[] = [];
  let from = 0, at = lower.indexOf(needle);
  while (at !== -1) {
    if (at > from) parts.push(text.slice(from, at));
    parts.push(<mark key={at} className={styles.mark} data-current={current || undefined}>{text.slice(at, at + needle.length)}</mark>);
    from = at + needle.length;
    at = lower.indexOf(needle, from);
  }
  if (from < text.length) parts.push(text.slice(from));
  return <>{parts}</>;
}

type CopyState = "idle" | "done" | "error";
/** Icon-only copy action. The glyph swaps in place, so the button never changes width. */
function CopyButton({ label, icon, onCopy, reduced, className, focusable = false, resetKey }: { label: string; icon: ReactNode; onCopy: () => Promise<void>; reduced: boolean; className?: string; focusable?: boolean; resetKey?: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef(0);
  const revision = useRef(0);
  useLayoutEffect(() => {
    revision.current += 1;
    window.clearTimeout(timer.current);
    setState("idle");
  }, [resetKey]);
  useEffect(() => () => { revision.current += 1; window.clearTimeout(timer.current); }, []);
  const run = async () => {
    window.clearTimeout(timer.current);
    const current = ++revision.current;
    let next: CopyState;
    try { await onCopy(); next = "done"; } catch { next = "error"; }
    if (current !== revision.current) return;
    setState(next);
    timer.current = window.setTimeout(() => { if (current === revision.current) setState("idle"); }, motionTokens.keyframes.jsonViewer.copyFeedbackHoldMs);
  };
  const glyph = state === "done" ? <Check size="var(--rams-detail-json-copy-glyph-size)" strokeWidth="var(--rams-detail-json-copy-feedback-glyph-stroke)" aria-hidden="true" /> : state === "error" ? <X size="var(--rams-detail-json-copy-glyph-size)" strokeWidth="var(--rams-detail-json-copy-feedback-glyph-stroke)" aria-hidden="true" /> : icon;
  return <OwnButton type="button" tabIndex={focusable ? undefined : -1} className={[styles.action, className].filter(Boolean).join(" ")} data-state={state} aria-label={state === "done" ? "Copied" : state === "error" ? "Copy failed" : label} title={label}
    onClick={event => { event.stopPropagation(); void run(); }}>
    <AnimatePresence initial={false} mode="popLayout">
      <MotionSwap key={state} className={styles.actionGlyph} aria-hidden="true" initial={reduced ? { opacity: 0 } : { opacity: 0, scale: motionTokens.keyframes.jsonViewer.copyGlyphScale, filter: `blur(${motionTokens.blur.subtle}px)` }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={reduced ? { opacity: 0 } : { opacity: 0, scale: motionTokens.keyframes.jsonViewer.copyGlyphScale, filter: `blur(${motionTokens.blur.subtle}px)` }}
        transition={reduced ? { duration: motionTokens.reduced.duration } : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.instant }, filter: { duration: motionTokens.duration.instant } }}>{glyph}</MotionSwap>
    </AnimatePresence>
  </OwnButton>;
}

async function writeClipboard(text: string) {
  if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
  await navigator.clipboard.writeText(text);
}

/* Scroll, row heights and the current-row highlight share one critically damped spring, so a highlight that moves while
 * the tree scrolls travels straight to its row instead of overshooting the viewport. */
const scrollSpring: Transition = motionTokens.spring.smooth;

export const JsonViewer = forwardRef<HTMLDivElement, JsonViewerProps>(function JsonViewer({
  data, rootName = "root", defaultExpandDepth = collectionPresentation.jsonTreeExpandDepth, expanded: expandedProp, defaultExpanded, onExpandedChange,
  searchable = true, query: queryProp, defaultQuery = "", onQueryChange, pageSize = collectionPresentation.jsonTreePageSize, copyable = true, onCopy, onSelect,
  showPath = true, maxHeight, label = "JSON", className,
}, ref) {
  const reduced = !!useReducedMotion();
  const uid = useId();
  const treeRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());

  /* Open branches. */
  const [expandedInternal, setExpandedInternal] = useState<string[]>(() => defaultExpanded ?? branchesToDepth(data, rootName, defaultExpandDepth));
  const expandedList = expandedProp ?? expandedInternal;
  const base = useMemo(() => new Set(expandedList), [expandedList]);
  const setExpanded = useCallback((next: Set<string>) => {
    const list = [...next];
    if (expandedProp === undefined) setExpandedInternal(list);
    onExpandedChange?.(list);
  }, [expandedProp, onExpandedChange]);

  /* Search. Branches holding a match open on their own; closing one while searching is remembered until the query changes. */
  const [queryInternal, setQueryInternal] = useState(defaultQuery);
  const query = queryProp ?? queryInternal;
  const needle = query.trim().toLowerCase();
  const setQuery = (next: string) => {
    if (queryProp === undefined) setQueryInternal(next);
    onQueryChange?.(next);
  };
  const search = useMemo<SearchResult | null>(() => needle ? searchJson(data, rootName, needle) : null, [data, needle, rootName]);
  const [closedWhileSearching, setClosedWhileSearching] = useState<{ needle: string; ids: Set<string> }>({ needle: "", ids: new Set() });
  const closed = closedWhileSearching.needle === needle ? closedWhileSearching.ids : null;
  const [matchIndex, setMatchIndex] = useState(0);
  const matchCount = search?.matches.length ?? 0;
  const matchSet = useMemo(() => new Set(search?.matches ?? []), [search]);
  const currentMatch = search && matchCount ? search.matches[Math.min(matchIndex, matchCount - 1)] : null;

  const isOpen = useCallback((id: string) => {
    if (search && search.ancestors.has(id)) return !closed?.has(id);
    return base.has(id);
  }, [base, closed, search]);

  /* Pages for long branches. */
  const [pages, setPages] = useState<Record<string, number>>({});
  const limitOf = useCallback((id: string) => Math.max((pages[id] ?? 1) * pageSize, search?.needed.get(id) ?? 0), [pageSize, pages, search]);

  /* The visible rows, flat. Each row unfolds its own height, so nested branches, pages, and expand all share one motion. */
  const rows = useMemo(() => {
    const out: Row[] = [];
    const visit = (value: unknown, id: string, name: string | number | null, level: number, parent: string | null, posinset: number, setsize: number) => {
      const type = typeOf(value);
      const list = isBranch(type) ? entries(value) : [];
      const open = isBranch(type) && isOpen(id);
      out.push({ id, kind: "node", level, name, value, type, count: list.length, open, parent, posinset, setsize });
      if (!open) return;
      const limit = limitOf(id);
      const shown = list.slice(0, limit);
      const more = list.length - shown.length;
      const size = shown.length + (more > 0 ? 1 : 0);
      shown.forEach(([key, child], index) => visit(child, childPath(id, key), key, level + 1, id, index + 1, size));
      if (more > 0) out.push({ id: `${id}::more`, kind: "more", level: level + 1, name: null, value: null, type: "other", count: 0, open: false, parent: id, posinset: size, setsize: size, hidden: more });
    };
    visit(data, rootName, null, 1, null, 1, 1);
    return out;
  }, [data, isOpen, limitOf, rootName]);

  /* The current row. When it is folded away, the nearest visible branch that holds it takes over. */
  const [activeRaw, setActiveRaw] = useState(rootName);
  const active = useMemo(() => {
    if (rows.some(row => row.id === activeRaw)) return activeRaw;
    let best = rootName;
    for (const row of rows) if (row.kind === "node" && within(row.id, activeRaw) && row.id.length > best.length) best = row.id;
    return best;
  }, [activeRaw, rootName, rows]);
  const activeIndex = Math.max(0, rows.findIndex(row => row.id === active));
  /* The current row folded away and a branch above took over. The highlight lands there directly instead of flying from a row that is collapsing out of view. */
  const folded = active !== activeRaw;
  const activeRow = rows[activeIndex];
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerFocused, setFooterFocused] = useState(false);
  useLayoutEffect(() => {
    const footer = footerRef.current, focus = footer?.ownerDocument.activeElement;
    if (activeRow?.kind === "more" && footerFocused && footer && focus && footer.contains(focus))
      rowRefs.current.get(active)?.focus({ preventScroll: true });
  }, [active, activeRow?.kind, footerFocused]);

  // If a controlled update folds the focused row away, keep focus in the surviving tree.
  useLayoutEffect(() => {
    if (!folded) return;
    const prior = rowRefs.current.get(activeRaw);
    const focus = prior?.ownerDocument.activeElement;
    if (prior && focus && prior.contains(focus)) rowRefs.current.get(active)?.focus({ preventScroll: true });
  }, [active, activeRaw, folded]);

  const onSelectRef = useRef(onSelect);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  const lastReported = useRef<string | null>(null);
  useEffect(() => {
    if (!activeRow || activeRow.kind !== "node" || lastReported.current === activeRow.id) return;
    lastReported.current = activeRow.id;
    onSelectRef.current?.({ path: activeRow.id, value: activeRow.value, type: activeRow.type });
  }, [activeRow]);

  /* Scrolling keeps the current row in view, springing to where it will sit once rows finish unfolding. */
  const scrollFlight = useRef<{ controls: AnimationPlaybackControls; target: number } | null>(null);
  const reveal = useCallback((index: number, center: boolean) => {
    const tree = treeRef.current;
    if (!tree) return;
    const rowHeight = tree.querySelector(`.${styles.line}`)?.getBoundingClientRect().height ?? 0;
    if (!rowHeight) return;
    const treeStyle = getComputedStyle(tree);
    const inset = Number.parseFloat(treeStyle.scrollPaddingBlockStart) || 0;
    const top = index * rowHeight + parseFloat(treeStyle.paddingTop), bottom = top + rowHeight, view = tree.clientHeight, now = tree.scrollTop;
    let target = now;
    if (center) target = top - view / 2 + rowHeight / 2;
    else if (top < now + inset) target = top - inset;
    else if (bottom > now + view - inset) target = bottom - view + inset;
    target = Math.max(0, target);
    scrollFlight.current?.controls.stop();
    scrollFlight.current = null;
    if (Math.abs(target - now) < 1) return;
    if (reduced) { tree.scrollTop = target; return; }
    const controls = animate(now, target, {
      ...scrollSpring,
      onUpdate: value => { tree.scrollTop = value; },
      onComplete: () => {
        if (scrollFlight.current?.controls === controls) scrollFlight.current = null;
      },
    });
    scrollFlight.current = { controls, target };
  }, [reduced]);
  useLayoutEffect(() => {
    const flight = scrollFlight.current;
    if (!reduced || !flight) return;
    flight.controls.stop();
    scrollFlight.current = null;
    if (treeRef.current) treeRef.current.scrollTop = flight.target;
  }, [reduced]);
  useEffect(() => () => scrollFlight.current?.controls.stop(), []);

  const pendingFocus = useRef(false);
  const pendingReveal = useRef<"nearest" | "center" | null>(null);
  /* Bumped on every navigation, so moving to the row that is already current still focuses and reveals it. */
  const [navigation, setNavigation] = useState(0);
  useEffect(() => {
    if (pendingFocus.current) {
      pendingFocus.current = false;
      rowRefs.current.get(active)?.focus({ preventScroll: true });
    }
    if (pendingReveal.current) {
      reveal(activeIndex, pendingReveal.current === "center");
      pendingReveal.current = null;
    }
  }, [active, activeIndex, reveal, navigation]);

  const moveTo = (id: string, focus = true, how: "nearest" | "center" = "nearest") => {
    pendingFocus.current = focus;
    pendingReveal.current = how;
    setActiveRaw(id);
    setNavigation(count => count + 1);
  };

  const toggle = (id: string, next?: boolean) => {
    const open = isOpen(id);
    const want = next ?? !open;
    if (want === open) return;
    if (search?.ancestors.has(id)) {
      const ids = new Set(closed ?? []);
      if (want) ids.delete(id); else ids.add(id);
      setClosedWhileSearching({ needle, ids });
      if (want && !base.has(id)) setExpanded(new Set(base).add(id));
      return;
    }
    const nextSet = new Set(base);
    if (want) nextSet.add(id); else nextSet.delete(id);
    setExpanded(nextSet);
  };

  const expandAll = () => {
    setExpanded(new Set(allBranches(data, rootName)));
    setClosedWhileSearching({ needle, ids: new Set() });
    // Branches above the current row unfold and push it down; follow it to where it settles.
    moveTo(active, false, "nearest");
  };
  const collapseAll = () => {
    const rootOpen = isBranch(typeOf(data)) ? [rootName] : [];
    setExpanded(new Set(rootOpen));
    setClosedWhileSearching({ needle, ids: new Set([...(search?.ancestors ?? [])].filter(id => id !== rootName)) });
    setPages({});
    moveTo(rootName, false, "nearest");
  };
  const showMore = (parent: string) => setPages(current => ({ ...current, [parent]: Math.ceil(limitOf(parent) / pageSize) + 1 }));

  /* Copy. */
  const [announcement, setAnnouncement] = useState("");
  const footerRevision = useRef(0);
  const footerAnnounced = useRef(false);
  useLayoutEffect(() => {
    footerRevision.current += 1;
    if (footerAnnounced.current) { footerAnnounced.current = false; setAnnouncement(""); }
  }, [activeRow?.id]);
  const copy = async (row: Row, kind: "value" | "path", shouldAnnounce: () => boolean = () => true, fromFooter = false) => {
    const text = kind === "path" ? row.id : copyText(row.value, row.type);
    try {
      await writeClipboard(text);
      if (shouldAnnounce()) { footerAnnounced.current = fromFooter; setAnnouncement(`Copied ${kind === "path" ? "path" : "value of"} ${row.id}`); }
      onCopy?.({ kind, path: row.id, text });
    } catch (error) {
      if (shouldAnnounce()) { footerAnnounced.current = fromFooter; setAnnouncement("Copy failed"); }
      throw error;
    }
  };

  /* Search navigation. */
  const stepMatch = (step: number) => {
    if (!search || !matchCount) return;
    const next = ((Math.min(matchIndex, matchCount - 1) + step) % matchCount + matchCount) % matchCount;
    setMatchIndex(next);
    moveTo(search.matches[next]!, false, "center");
  };
  const onQuery = (next: string) => {
    setQuery(next);
    setMatchIndex(0);
    const trimmed = next.trim().toLowerCase();
    if (trimmed) {
      const first = searchJson(data, rootName, trimmed).matches[0];
      if (first) moveTo(first, false, "center");
    } else if (needle) {
      // Clearing folds the branches search opened. Aim the scroll at where the current row settles, so it stays in view.
      moveTo(activeRaw, false, "nearest");
    }
  };

  const onSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") { event.preventDefault(); stepMatch(event.shiftKey ? -1 : 1); }
    else if (event.key === "Escape" && query) { event.preventDefault(); event.stopPropagation(); onQuery(""); }
    else if (event.key === "ArrowDown" && !event.altKey) { event.preventDefault(); moveTo(active, true); }
  };

  const onTreeKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const row = rows[activeIndex];
    if (!row || event.altKey) return;
    const mod = event.metaKey || event.ctrlKey;
    if (mod && event.key.toLowerCase() === "c") {
      if (row.kind === "node" && !window.getSelection()?.toString()) { event.preventDefault(); void copy(row, event.shiftKey ? "path" : "value").catch(() => {}); }
      return;
    }
    if (mod) return;
    const go = (index: number) => { event.preventDefault(); const target = rows[Math.max(0, Math.min(rows.length - 1, index))]; if (target) moveTo(target.id); };
    switch (event.key) {
      case "ArrowDown": go(activeIndex + 1); break;
      case "ArrowUp": go(activeIndex - 1); break;
      case "Home": go(0); break;
      case "End": go(rows.length - 1); break;
      case "ArrowRight":
        event.preventDefault();
        if (row.kind === "node" && isBranch(row.type)) { if (!row.open) toggle(row.id, true); else if (row.count) go(activeIndex + 1); }
        break;
      case "ArrowLeft":
        event.preventDefault();
        if (row.kind === "node" && row.open) toggle(row.id, false);
        else if (row.parent) moveTo(row.parent);
        break;
      case "Enter": case " ":
        event.preventDefault();
        if (row.kind === "more") showMore(row.parent!);
        else if (isBranch(row.type)) toggle(row.id);
        break;
      case "/":
        if (searchable) { event.preventDefault(); searchRef.current?.focus(); searchRef.current?.select(); }
        break;
      default:
    }
  };

  const heightStyle = maxHeight === undefined
    ? undefined
    : { "--rams-detail-json-max-height": typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight } as CSSProperties;
  const bulk = rows.length > motionTokens.keyframes.jsonViewer.maxAnimatedRows;
  const rowTransition: Transition = reduced || bulk ? { duration: motionTokens.reduced.duration } : { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } };

  const describe = (row: Row) => {
    const name = row.name === null ? rootName : String(row.name);
    if (row.kind === "more") return `Show ${Math.min(pageSize, row.hidden ?? 0)} more, ${row.hidden} hidden`;
    return isBranch(row.type) ? `${name}, ${row.type}, ${countLabel(row)}` : `${name}: ${primitiveText(row.value, row.type)}`;
  };

  return <div ref={ref} className={[styles.root, className].filter(Boolean).join(" ")} style={heightStyle}>
    {searchable || rows.length > 1 ? <div className={styles.toolbar}>
      {searchable ? <label className={styles.search}>
        <Search size="var(--rams-detail-json-toolbar-glyph-size)" strokeWidth="var(--rams-detail-json-glyph-stroke)" aria-hidden="true" className={styles.searchIcon} />
        <OwnInput ref={searchRef} type="search" className={styles.input} value={query} placeholder="Search keys and values" aria-label="Search JSON" aria-controls={`${uid}-tree`}
          onChange={event => onQuery(event.target.value)} onKeyDown={onSearchKeyDown} spellCheck={false} autoComplete="off" />
        <AnimatePresence initial={false}>
          {needle ? <MotionPresenceSpan key="matches" className={styles.matches} initial={reduced ? { opacity: 0 } : { opacity: 0, x: motionTokens.keyframes.jsonViewer.searchCounterTravelPx }} animate={{ opacity: 1, x: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, x: motionTokens.keyframes.jsonViewer.searchCounterTravelPx }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] }}>
            <span className={styles.count} aria-live="polite">{matchCount ? `${Math.min(matchIndex, matchCount - 1) + 1}/${matchCount}` : "0/0"}</span>
            <OwnButton type="button" className={styles.tool} aria-label="Previous match" disabled={!matchCount} onClick={() => stepMatch(-1)}><ChevronUp size="var(--rams-detail-json-toolbar-glyph-size)" strokeWidth="var(--rams-detail-json-glyph-stroke)" aria-hidden="true" /></OwnButton>
            <OwnButton type="button" className={styles.tool} aria-label="Next match" disabled={!matchCount} onClick={() => stepMatch(1)}><ChevronDown size="var(--rams-detail-json-toolbar-glyph-size)" strokeWidth="var(--rams-detail-json-glyph-stroke)" aria-hidden="true" /></OwnButton>
          </MotionPresenceSpan> : null}
        </AnimatePresence>
      </label> : <span className={styles.grow} />}
      <span className={styles.divider} aria-hidden="true" />
      <OwnButton type="button" className={styles.tool} aria-label="Expand all" title="Expand all" onClick={expandAll}><ChevronsUpDown size="var(--rams-detail-json-toolbar-glyph-size)" strokeWidth="var(--rams-detail-json-glyph-stroke)" aria-hidden="true" /></OwnButton>
      <OwnButton type="button" className={styles.tool} aria-label="Collapse all" title="Collapse all" onClick={collapseAll}><ChevronsDownUp size="var(--rams-detail-json-toolbar-glyph-size)" strokeWidth="var(--rams-detail-json-glyph-stroke)" aria-hidden="true" /></OwnButton>
    </div> : null}

    <LayoutGroup id={uid}>
      <motion.div ref={treeRef} layoutScroll id={`${uid}-tree`} role="tree" aria-label={label} className={styles.tree} onKeyDown={onTreeKeyDown}>
        <AnimatePresence initial={false}>
          {rows.map(row => {
            const isActive = row.id === active;
            const branch = isBranch(row.type);
            const matched = !!search && row.kind === "node" && matchSet.has(row.id);
            const isCurrentMatch = row.id === currentMatch;
            const mark = matched ? needle : "";
            return <MotionPresenceDiv key={row.id} ref={(node: HTMLDivElement | null) => { if (node) rowRefs.current.set(row.id, node); else rowRefs.current.delete(row.id); }}
              role="treeitem" tabIndex={isActive ? 0 : -1} aria-level={row.level} aria-posinset={row.posinset} aria-setsize={row.setsize}
              aria-expanded={row.kind === "node" && branch ? row.open : undefined} aria-selected={isActive} aria-label={describe(row)}
              className={styles.row} data-kind={row.kind} data-active={isActive || undefined} style={{ "--rams-detail-level": row.level - 1 } as CSSProperties}
              initial={reduced ? false : { height: 0, opacity: 0, overflow: "hidden" }} animate={{ height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } }} exit={{ height: 0, opacity: 0, overflow: "hidden" }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : rowTransition}
              onFocus={event => { if (event.target === event.currentTarget && row.id !== active) setActiveRaw(row.id); }}
              onClick={() => {
                if (row.kind === "more") { showMore(row.parent!); moveTo(row.id); return; }
                if (branch) toggle(row.id);
                moveTo(row.id);
              }}>
              {isActive ? <motion.span layoutId="json-active" className={styles.highlight} transition={reduced || folded ? { duration: motionTokens.reduced.duration } : scrollSpring} aria-hidden="true" /> : null}
              <span className={styles.line}>
                {row.kind === "more" ? <span className={styles.more}>
                  <span className={styles.moreLabel}>Show {Math.min(pageSize, row.hidden ?? 0)} more</span>
                  <span className={styles.muted}>{row.hidden} hidden</span>
                </span> : <>
                  <span className={styles.chevron} data-open={row.open || undefined} data-branch={branch || undefined} aria-hidden="true">{branch ? <ChevronRight size="var(--rams-detail-json-chevron-size)" strokeWidth="var(--rams-detail-json-glyph-stroke)" /> : null}</span>
                  <span className={typeof row.name === "number" ? styles.index : styles.key}>
                    {row.name === null ? rootName : typeof row.name === "number" ? row.name : <Highlight text={row.name} needle={mark} current={isCurrentMatch} />}
                  </span>
                  <span className={styles.colon} aria-hidden="true">{row.name === null && branch ? "" : ":"}</span>
                  {branch
                    ? <span className={styles.summary}>
                        {!row.open ? <span className={styles.preview}>{row.type === "array" ? "[…]" : `{ ${entries(row.value).slice(0, collectionPresentation.jsonCollapsedKeys).map(([key]) => key).join(", ")}${row.count > collectionPresentation.jsonCollapsedKeys ? ", …" : ""} }`}</span> : null}
                        <span className={styles.countLabel}>{countLabel(row)}</span>
                      </span>
                    : <span className={styles.value} data-type={row.type} title={row.type === "string" && (row.value as string).length > collectionPresentation.jsonStringTitleThreshold ? row.value as string : undefined}>
                        {row.type === "string" ? <>&quot;<Highlight text={row.value as string} needle={mark} current={isCurrentMatch} />&quot;</> : <Highlight text={primitiveText(row.value, row.type)} needle={mark} current={isCurrentMatch} />}
                      </span>}
                  {copyable ? <span className={styles.actions}>
                    <CopyButton label="Copy value" icon={<Copy size="var(--rams-detail-json-copy-glyph-size)" strokeWidth="var(--rams-detail-json-glyph-stroke)" aria-hidden="true" />} reduced={reduced} onCopy={() => copy(row, "value")} />
                    <CopyButton label="Copy path" icon={<Link2 size="var(--rams-detail-json-copy-glyph-size)" strokeWidth="var(--rams-detail-json-glyph-stroke)" aria-hidden="true" />} reduced={reduced} onCopy={() => copy(row, "path")} />
                  </span> : null}
                </>}
              </span>
            </MotionPresenceDiv>;
          })}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>

    {showPath && activeRow ? <div ref={footerRef} className={styles.pathBar} onFocusCapture={() => setFooterFocused(true)} onBlurCapture={event => setFooterFocused(event.currentTarget.contains(event.relatedTarget as Node | null))}>
      <code className={styles.path} title={activeRow.kind === "node" ? activeRow.id : activeRow.parent ?? ""}>{activeRow.kind === "node" ? activeRow.id : activeRow.parent}</code>
      <span className={styles.pathType}>{activeRow.kind === "node" ? isBranch(activeRow.type) ? `${activeRow.type}, ${countLabel(activeRow)}` : activeRow.type : "page"}</span>
      {copyable && (activeRow.kind === "node" || footerFocused) ? <CopyButton resetKey={activeRow.id} focusable className={styles.pathCopy} label="Copy path" icon={<Copy size="var(--rams-detail-json-copy-glyph-size)" strokeWidth="var(--rams-detail-json-glyph-stroke)" aria-hidden="true" />} reduced={reduced} onCopy={() => { const revision = footerRevision.current; return copy(activeRow, "path", () => footerRevision.current === revision, true); }} /> : null}
    </div> : null}
    <span className={styles.srOnly} role="status">{announcement}</span>
  </div>;
});

export default JsonViewer;
