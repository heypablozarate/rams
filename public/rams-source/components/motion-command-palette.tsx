"use client";
import "./motion-fields.css";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import { Button, buttonVariants } from "./button";
import { MotionPresenceButton, MotionPresenceDiv } from "./presence-controls";
import type { Transition, ValueAnimationTransition, Variants } from "motion/react";
import { Command as CommandIcon, Search, X } from "lucide-react";
import { motionTokens } from "./motion-tokens";
import styles from "./motion-command-palette.module.css";

export interface CommandItem { id: string; label: string; description?: string; group?: string; keywords?: string[]; icon?: ReactNode; shortcut?: string; }
export interface CommandPaletteProps { items: CommandItem[]; placeholder?: string; onSelect?: (item: CommandItem) => void; onClose?: () => void; label?: string; /** Focus the search field on mount, for a palette that opens on demand. */ autoFocus?: boolean; }

const enter: Transition = { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] };
const leave: Transition = { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] };
const GLIDE_ROWS = motionTokens.keyframes.commandPalette.glideRowLimit;
/** Rows fade out while the rest glide into their place; when the list snaps they leave at once so nothing overlaps the new rows. */
const rowExit: Variants = { exit: (glide: boolean) => ({ opacity: 0, transition: glide ? leave : { duration: motionTokens.reduced.duration } }) };

export function CommandPalette({ items, placeholder = "Search commands", onSelect, onClose, label = "Command palette", autoFocus = false }: CommandPaletteProps) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [listHeight, setListHeight] = useState<number | "auto">("auto");
  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const pointer = useRef(false);
  const lastPointer = useRef({ x: -1, y: -1 });
  const highlightShown = useRef(false);
  const highlightY = useMotionValue(0);
  const highlightHeight = useMotionValue(0);
  const highlightOpacity = useMotionValue(0);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter(item => [item.label, item.description, item.group, ...(item.keywords ?? [])].filter(Boolean).join(" ").toLowerCase().includes(normalized));
  }, [items, query]);
  const groupedItems = useMemo(() => {
    const grouped = new Map<string, Array<{ item: CommandItem; index: number }>>();
    filtered.forEach((item, index) => {
      const group = item.group ?? "Actions";
      const entries = grouped.get(group) ?? [];
      entries.push({ item, index });
      grouped.set(group, entries);
    });
    return [...grouped.entries()];
  }, [filtered]);
  // When every remaining row moves within about a viewport, the list closes its gaps with a glide. A long jump (the first letters typed into a long list) snaps like a search result list instead of streaking rows through the frame; only the frame height morphs.
  const [shift, setShift] = useState({ list: filtered, glide: true });
  if (shift.list !== filtered) {
    const before = new Map(shift.list.map((item, index) => [item.id, index]));
    setShift({ list: filtered, glide: filtered.every((item, index) => Math.abs((before.get(item.id) ?? index) - index) <= GLIDE_ROWS) });
  }
  const glide = shift.glide && !reduced;
  const safeActiveIndex = activeIndex === null
    ? -1
    : Math.min(activeIndex, Math.max(filtered.length - 1, 0));
  const activeId = filtered[safeActiveIndex]?.id;

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  useEffect(() => {
    const focusShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", focusShortcut);
    return () => document.removeEventListener("keydown", focusShortcut);
  }, []);

  // The results frame follows the list height, so filtering closes or opens the gap instead of snapping.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(([entry]) => setListHeight(Math.round(entry?.borderBoxSize?.[0]?.blockSize ?? list.offsetHeight)));
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  // One highlight follows the active result: a spring for the pointer, a 70ms slide for arrow keys, a fade when it first appears.
  useLayoutEffect(() => {
    const node = activeId ? document.getElementById(`${inputId}-${activeId}`) : null;
    if (!node) {
      highlightShown.current = false;
      animate(highlightOpacity, 0, { duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.instant });
      return;
    }
    const move: ValueAnimationTransition<number> = !highlightShown.current || reduced ? { duration: motionTokens.reduced.duration } : pointer.current ? motionTokens.spring.snappy : { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.enter] };
    // Rows sit inside positioned groups, so their offset is summed up to the list (layout transforms stay out of it).
    let top = 0;
    for (let element: HTMLElement | null = node; element && element !== listRef.current; element = element.offsetParent as HTMLElement | null) top += element.offsetTop + (element === node ? 0 : element.clientTop);
    animate(highlightY, top, move);
    animate(highlightHeight, node.offsetHeight, move);
    animate(highlightOpacity, 1, { duration: reduced ? motionTokens.reduced.duration : motionTokens.duration.instant });
    highlightShown.current = true;
  }, [activeId, inputId, reduced, highlightY, highlightHeight, highlightOpacity]);

  useEffect(() => {
    if (!activeId) return;
    document.getElementById(`${inputId}-${activeId}`)?.scrollIntoView({ block: "nearest" });
  }, [activeId, inputId]);

  function choose(item: CommandItem) {
    onSelect?.(item);
    setQuery("");
    setActiveIndex(null);
    inputRef.current?.focus();
  }
  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    pointer.current = false;
    if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex(index => Math.min((index ?? -1) + 1, Math.max(filtered.length - 1, 0))); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex(index => Math.max((index ?? filtered.length) - 1, 0)); }
    if (event.key === "Home") { event.preventDefault(); setActiveIndex(0); }
    if (event.key === "End") { event.preventDefault(); setActiveIndex(Math.max(filtered.length - 1, 0)); }
    // Enter runs the highlighted result; after typing, with nothing highlighted yet, it runs the top match.
    const target = filtered[safeActiveIndex] ?? (query ? filtered[0] : undefined);
    if (event.key === "Enter" && target) { event.preventDefault(); choose(target); }
    if (event.key === "Escape") {
      event.preventDefault();
      if (query) { setQuery(""); setActiveIndex(null); }
      else onClose?.();
    }
  }

  return <motion.div className={styles.palette} initial={reduced ? false : { opacity: 0, y: motionTokens.keyframes.commandPalette.entryOffsetPx, scale: motionTokens.keyframes.commandPalette.entryScale }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={reduced ? { duration: motionTokens.reduced.duration } : { default: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.enter] } }}>
    <div className={styles.searchRow}>
      <span className={styles.searchIcon}><Search width="var(--rams-detail-command-search-glyph-size)" height="var(--rams-detail-command-search-glyph-size)" strokeWidth="var(--rams-detail-command-search-glyph-stroke)" aria-hidden="true"/></span>
      <label className={styles.visuallyHidden} htmlFor={inputId}>{label}</label>
      <input ref={inputRef} id={inputId} role="combobox" aria-autocomplete="list" aria-expanded="true" aria-controls={`${inputId}-results`} aria-activedescendant={activeId ? `${inputId}-${activeId}` : undefined} value={query} onChange={event => { setQuery(event.target.value); setActiveIndex(null); }} onKeyDown={handleKeyDown} placeholder={placeholder} autoComplete="off"/>
      <AnimatePresence mode="popLayout" initial={false}>
        {query ? <MotionPresenceButton key="clear" className={buttonVariants({ variant: "ghost", size: "icon-xs", className: styles.clearButton })} variant="ghost" size="icon-xs" type="button" aria-label="Clear search" onClick={() => { setQuery(""); setActiveIndex(null); inputRef.current?.focus(); }} initial={reduced ? false : { opacity: 0, scale: motionTokens.keyframes.commandPalette.clearScale, filter: `blur(${motionTokens.blur.subtle}px)` }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={reduced ? { opacity: 0, transition: { duration: motionTokens.reduced.duration } } : { opacity: 0, scale: motionTokens.keyframes.commandPalette.clearScale, filter: `blur(${motionTokens.blur.subtle}px)`, transition: leave }} transition={reduced ? { duration: motionTokens.reduced.duration } : { default: motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.instant } }}><X width="var(--rams-detail-command-clear-glyph-fallback-size)" height="var(--rams-detail-command-clear-glyph-fallback-size)" aria-hidden="true"/></MotionPresenceButton> : null}
      </AnimatePresence>
      {onClose ? <Button className={styles.closeButton} variant="ghost" size="xs" type="button" aria-label="Close command palette" onClick={onClose}>Esc</Button> : null}
      <kbd className={styles.commandKey}>⌘ K</kbd>
    </div>
    <motion.div className={styles.resultsFrame} initial={false} animate={{ height: listHeight }} transition={reduced ? { duration: motionTokens.reduced.duration } : motionTokens.spring.smooth}>
      <motion.div ref={listRef} layoutScroll id={`${inputId}-results`} className={styles.results} role="listbox" aria-label="Command results">
        <motion.span className={styles.highlight} style={{ y: highlightY, height: highlightHeight, opacity: highlightOpacity }} aria-hidden="true"/>
        {/* Results leave before the empty state arrives, so the frame makes one height change instead of two. */}
        <AnimatePresence mode="wait" initial={false}>
          {filtered.length ? <MotionPresenceDiv key="results" className={styles.resultSet} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduced ? { opacity: 0, transition: { duration: motionTokens.reduced.duration } } : { opacity: 0, transition: leave }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : enter}>
            {/* Filtered-out rows pop out of the flow as they fade, so the rest glide up and the frame starts closing on the same keystroke. */}
            <AnimatePresence mode="popLayout" initial={false} custom={glide}>
              {groupedItems.map(([group, entries]) => <MotionPresenceDiv layout={reduced ? false : glide ? "position" : false} className={styles.group} role="group" aria-label={group} key={group} variants={reduced ? ({ exit: (glide: boolean) => ({ opacity: 0, transition: glide ? ({ duration: motionTokens.reduced.duration, ease: [...motionTokens.ease.standard] }) : { duration: motionTokens.reduced.duration } }) }) : rowExit} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit="exit" transition={reduced ? { duration: motionTokens.reduced.duration } : { default: enter, layout: motionTokens.spring.smooth }}>
                <span className={styles.groupHeading} aria-hidden="true">{group}</span>
                <AnimatePresence mode="popLayout" initial={false} custom={glide}>{entries.map(({ item, index }) => <MotionPresenceButton layout={reduced ? false : glide ? "position" : false} key={item.id} id={`${inputId}-${item.id}`} className={buttonVariants({ variant: "ghost", size: "xs", className: `${styles.result} ${index === safeActiveIndex ? styles.activeResult : ""}` })} variant="ghost" size="xs" type="button" role="option" aria-selected={index === safeActiveIndex} onClick={() => choose(item)} onPointerMove={event => {
                  // Ignore the synthetic moves browsers send while the list scrolls under a still pointer.
                  if (event.clientX === lastPointer.current.x && event.clientY === lastPointer.current.y) return;
                  lastPointer.current = { x: event.clientX, y: event.clientY };
                  if (index !== safeActiveIndex) { pointer.current = true; setActiveIndex(index); }
                }} variants={reduced ? ({ exit: (glide: boolean) => ({ opacity: 0, transition: glide ? ({ duration: motionTokens.reduced.duration, ease: [...motionTokens.ease.standard] }) : { duration: motionTokens.reduced.duration } }) }) : rowExit} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit="exit" transition={reduced ? { duration: motionTokens.reduced.duration } : { default: enter, layout: motionTokens.spring.smooth }}><span className={styles.itemIcon} aria-hidden="true">{item.icon ?? <CommandIcon width="var(--rams-detail-command-result-glyph-size)" height="var(--rams-detail-command-result-glyph-size)"/>}</span><span className={styles.resultCopy}><strong dir="auto">{item.label}</strong>{item.description && <small dir="auto">{item.description}</small>}</span>{item.shortcut && <kbd className={styles.shortcut}>{item.shortcut}</kbd>}</MotionPresenceButton>)}</AnimatePresence>
              </MotionPresenceDiv>)}
            </AnimatePresence>
          </MotionPresenceDiv> : <MotionPresenceDiv key="empty" className={styles.empty} initial={reduced ? false : { opacity: 0, y: motionTokens.keyframes.commandPalette.emptyEnterOffsetPx, filter: `blur(${motionTokens.blur.subtle}px)` }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduced ? { opacity: 0, transition: { duration: motionTokens.reduced.duration } } : { opacity: 0, y: motionTokens.keyframes.commandPalette.emptyExitOffsetPx, transition: leave }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : enter}><span><Search width="var(--rams-detail-command-empty-glyph-size)" height="var(--rams-detail-command-empty-glyph-size)" aria-hidden="true"/></span><strong>No matching actions</strong><small>Try a different word or clear the search.</small></MotionPresenceDiv>}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  </motion.div>;
}

export default CommandPalette;
