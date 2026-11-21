"use client";
import "./motion-fields.css";

import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
type StaticImageData = { src: string; width: number; height: number; blurDataURL?: string };
import { AnimatePresence, motion, useAnimationControls, usePresence, type Transition, type Variants } from "motion/react";
import { MotionPresenceButton } from "./presence-controls";
import { motionTransition } from "./motion-policy";
import { useReducedMotion } from "./use-motion-preference";
import { useShapeRadius } from "./use-radius";
import { Check, ChevronDown, Download } from "lucide-react";
import { CopyButton } from "./motion-copy-button";
import { motionTokens } from "./motion-tokens";
import styles from "./motion-changelog-feed.module.css";

export type ChangelogKind = "new" | "improved" | "fixed";
type Kind = ChangelogKind;
export type ChangelogMedia =
  | { type: "photo"; src: StaticImageData | string; alt: string; caption: string; /** Pixel size, needed when `src` is a URL rather than an imported image. */ width?: number; height?: number }
  | { type: "code"; file: string; code: string };
type Media = ChangelogMedia;
export type ChangelogEntry = { id: string; month: string; date: string; iso: string; version: string; kind: Kind; title: string; summary: string; details: string[]; media?: Media };
export type ChangelogMonth = { key: string; label: string; short: string };
type Entry = ChangelogEntry;
type Month = ChangelogMonth;

const kinds: { id: Kind; label: string }[] = [
  { id: "new", label: "New" },
  { id: "improved", label: "Improved" },
  { id: "fixed", label: "Fixed" },
];

const exampleMonths: Month[] = [
  { key: "2026-09", label: "September 2026", short: "Sep" },
  { key: "2026-08", label: "August 2026", short: "Aug" },
  { key: "2026-07", label: "July 2026", short: "Jul" },
  { key: "2026-06", label: "June 2026", short: "Jun" },
];

const impositionSnippet = `FOLIO21 / ROSARIO WALKING MAP
Trim:          297 x 420 mm
Bleed:         3 mm on every edge
Artwork:       303 x 426 mm
Safe type:     5 mm inside trim
Paper grain:   parallel to 420 mm edge
Fold:          two parallel folds at 99 / 198 mm`;

const allocationSnippet = `station,finished,spares,total_sheets
Rosario,100,10,110
Córdoba,100,10,110
Mendoza,100,10,110
TOTAL,300,30,330`;

const exampleEntries: Entry[] = [
  { id: "trim-map", month: "2026-09", date: "Sep 18", iso: "2026-09-18", version: "1.6", kind: "new", title: "A3 trim map added", summary: "The Rosario sheet now carries a separate trim and fold specification.", details: ["Artwork extends 3 mm beyond the finished edge.", "Keep small type 5 mm inside trim so the same file can be checked before folding."], media: { type: "code", file: "rosario-trim.txt", code: impositionSnippet } },
  { id: "rack-sequence", month: "2026-09", date: "Sep 18", iso: "2026-09-18", version: "1.6", kind: "improved", title: "Drying rack sequence clarified", summary: "Duotone sheets move through black, rest and grey in a fixed order.", details: ["Each rack label includes the sheet count and pass number.", "A new pile starts only after the previous pile has been checked for offsetting."] },
  { id: "fold-index", month: "2026-09", date: "Sep 9", iso: "2026-09-09", version: "1.5.1", kind: "fixed", title: "Fold index moved away from the crease", summary: "The Córdoba panel number clears the first fold by 6 mm.", details: ["The page number stays readable when the walking map is closed.", "The trim dimensions and page sequence are unchanged."] },
  { id: "allocation", month: "2026-09", date: "Sep 2", iso: "2026-09-02", version: "1.5", kind: "new", title: "Station allocations recorded", summary: "Three equal bundles reserve ten spare sheets per station.", details: ["The 300 finished-sheet allocation requires 330 sheets before trim.", "Copy the CSV to reuse the count at the packing bench."], media: { type: "code", file: "station-allocation.csv", code: allocationSnippet } },
  { id: "tonal-key", month: "2026-08", date: "Aug 26", iso: "2026-08-26", version: "1.4", kind: "new", title: "A second tonal separation", summary: "Mendoza canal paths use a grey pass behind the black route marks.", details: ["Both separations use the same registration crosses.", "The key also names the line styles so the route remains readable without tonal differences."], media: { type: "code", file: "separations.txt", code: `PLATE 1 / BLACK
Route: solid line
Stops: filled circle

PLATE 2 / GREY
Canal: dashed line
Shade: open hatch` } },
  { id: "bundle-label", month: "2026-08", date: "Aug 26", iso: "2026-08-26", version: "1.4", kind: "improved", title: "Bundle labels list the sheet range", summary: "Packing labels distinguish finished sheets from reserved spares.", details: ["A label records station, edition and quantity.", "Spare sheets stay in a separate labelled sleeve."] },
  { id: "grain", month: "2026-08", date: "Aug 14", iso: "2026-08-14", version: "1.3.1", kind: "fixed", title: "Paper grain direction corrected", summary: "The stock note now aligns the grain with the long fold.", details: ["The former cross-grain note was removed from the job sheet.", "A folded blank is retained with the paper specification."] },
  { id: "proof-order", month: "2026-08", date: "Aug 5", iso: "2026-08-05", version: "1.3", kind: "improved", title: "Proof checks follow the sheet path", summary: "Check size, registration, drying and trim in production order.", details: ["The sequence reduces repeated handling of a wet sheet.", "Record the result beside the relevant step before moving to the next station."] },
  { id: "fold-dummy", month: "2026-07", date: "Jul 22", iso: "2026-07-22", version: "1.2", kind: "new", title: "Six-panel fold dummy", summary: "The Rosario map has a numbered front and reverse layout.", details: ["The outside starts with the title panel on the right.", "The reverse reads as one continuous route when fully opened."], media: { type: "code", file: "fold-dummy.txt", code: `OUTSIDE
+---------+---------+---------+
| panel 5 | panel 6 | panel 1 |
+---------+---------+---------+
INSIDE
+---------+---------+---------+
| panel 2 | panel 3 | panel 4 |
+---------+---------+---------+` } },
  { id: "scale-bar", month: "2026-07", date: "Jul 10", iso: "2026-07-10", version: "1.1.1", kind: "fixed", title: "Scale bar units restored", summary: "The map key labels its 250 m reference explicitly.", details: ["The route illustration is a print study, not a navigation survey.", "The reference bar remains attached to the map artwork when resized."] },
  { id: "type-proof", month: "2026-07", date: "Jul 3", iso: "2026-07-03", version: "1.1", kind: "improved", title: "Small type checked at finished size", summary: "A full-size proof replaces screen-only checks of the colophon.", details: ["The minimum annotation size is recorded with the proof.", "Station names retain their accents: Córdoba and Río Paraná."] },
  { id: "job-ticket", month: "2026-06", date: "Jun 24", iso: "2026-06-24", version: "1.0", kind: "new", title: "First job ticket", summary: "Folio21 begins with three station studies and one A3 format.", details: ["Rosario studies quay lines, Córdoba studies stone steps and Mendoza studies canal grids.", "Every study shares trim dimensions so the set can be packed together."] },
  { id: "accent-proof", month: "2026-06", date: "Jun 12", iso: "2026-06-12", version: "0.9.1", kind: "fixed", title: "Station names use UTF-8", summary: "The plain-text packing list preserves accented place names.", details: ["The CSV and job ticket use the same names.", "Check the exported text before printing bundle labels."] },
  { id: "sheet-log", month: "2026-06", date: "Jun 3", iso: "2026-06-03", version: "0.9", kind: "improved", title: "Sheet log separates losses", summary: "Setup sheets and damaged sheets now have separate tally columns.", details: ["Finished sheets are counted after trim.", "The total input equals finished sheets plus setup and damaged sheets."], media: { type: "code", file: "sheet-log.csv", code: `station,input,setup,damaged,finished
Rosario,110,6,4,100
Córdoba,110,7,3,100
Mendoza,110,5,5,100` } },
];

const blurSoft = `blur(${motionTokens.blur.soft}px)`;
const blurSubtle = `blur(${motionTokens.blur.subtle}px)`;
const none = "blur(0px)";
const instant: Transition = { duration: motionTokens.reduced.duration };
const exitSpring: Transition = { type: "spring", visualDuration: motionTokens.spring.snappy.visualDuration, bounce: motionTokens.spring.snappy.bounce };

/** Values rise when they grow and fall when they shrink; the outgoing value leaves the opposite way. */
const roll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * motionTokens.changelog.rollPercent}%`, filter: blurSubtle }),
  center: { opacity: 1, y: "0%", filter: none },
  exit: (direction: number) => ({ opacity: 0, y: `${direction * -motionTokens.changelog.rollPercent}%`, filter: blurSubtle }),
};
const rise: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: direction * motionTokens.changelog.monthTravel, filter: blurSoft }),
  center: { opacity: 1, y: 0, filter: none },
  exit: (direction: number) => ({ opacity: 0, y: direction * -motionTokens.changelog.monthTravel, filter: blurSoft, transition: { duration: motionTokens.duration.exit, ease: [...motionTokens.ease.standard] } }),
};

function RollingNumber({ value, reduce }: { value: number; reduce: boolean }) {
  const [state, setState] = useState({ value, direction: 1 });
  if (state.value !== value) setState({ value, direction: value > state.value ? 1 : -1 });
  return <span className={styles.roll}>
    {reduce ? <span>{value}</span> : <AnimatePresence mode="popLayout" initial={false} custom={state.direction}>
      <motion.span key={value} custom={state.direction} variants={roll} initial="enter" animate="center" exit="exit" transition={motionTokens.spring.snappy}>{value}</motion.span>
    </AnimatePresence>}
  </span>;
}

/** Export the visible records as a real local Markdown file. The shell follows the label width. */
function ExportControl({ entries, title, reduce }: { entries: Entry[]; title: string; reduce: boolean }) {
  const radius = useShapeRadius("pill");
  const [downloaded, setDownloaded] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  function download() {
    try {
      const content = entries.map(entry => `## ${entry.date} · ${entry.title}\n\n${entry.summary}\n\n${entry.details.map(detail => `- ${detail}`).join("\n")}${entry.media?.type === "code" ? `\n\n${entry.media.file}\n\n\u0060\u0060\u0060\n${entry.media.code}\n\u0060\u0060\u0060` : ""}`).join("\n\n");
      const url = URL.createObjectURL(new Blob([`# ${title}\n\n${content}\n`], { type: "text/markdown;charset=utf-8" }));
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = "production-notes.md";
      document.body.append(anchor); anchor.click(); anchor.remove();
      URL.revokeObjectURL(url);
      setDownloaded(entries.length);
      setFailed(false);
    } catch { setFailed(true); }
  }
  return <div className={styles.exportWrap}>
    <motion.button layout style={{ borderRadius: radius }} type="button" className={styles.exportButton} onClick={download} disabled={!entries.length} transition={reduce ? instant : motionTokens.spring.morph}>
      <motion.span layout="position" aria-hidden="true"><Download size={motionTokens.changelog.exportIconSize} /></motion.span>
      {reduce ? <span>{downloaded === null ? "Export notes" : "Export again"}</span> : <AnimatePresence initial={false} mode="popLayout"><motion.span layout="position" key={downloaded === null ? "initial" : "again"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: motionTokens.duration.fast }}>{downloaded === null ? "Export notes" : "Export again"}</motion.span></AnimatePresence>}
    </motion.button>
    <p className={styles.exportNote} role="status">{failed ? "Could not export. Try again." : downloaded === null ? "Markdown · visible entries" : `${downloaded} notes sent to browser download`}</p>
  </div>;
}

function EntryMedia({ media }: { media: Media }) {
  if (media.type === "photo") {
    return <figure className={styles.photo}>
      <div className={styles.photoFrame}><img src={typeof media.src === "string" ? media.src : media.src.src} alt={media.alt} width={typeof media.src === "string" ? media.width : media.src.width} height={typeof media.src === "string" ? media.height : media.src.height} loading="lazy" /></div>
      <figcaption>{media.caption}</figcaption>
    </figure>;
  }
  return <div className={styles.code}>
    <div className={styles.codeHead}><span>{media.file}</span><CopyButton value={media.code} label={`Copy ${media.file}`} iconOnly variant="ghost" /></div>
    <pre><code>{media.code}</code></pre>
  </div>;
}

function EntryPanel({ id, children }: { id: string; children: ReactNode }) {
  const reduced = useReducedMotion() ?? false;
  const [present, safeToRemove] = usePresence();
  const controls = useAnimationControls();
  useLayoutEffect(() => {
    let current = true;
    controls.stop();
    if (reduced) controls.set({ height: present ? "auto" : 0 });
    else if (present) void controls.start({ height: "auto", transition: motionTokens.spring.smooth });
    else void controls.start({ height: 0, transition: exitSpring }).then(() => { if (current) safeToRemove?.(); });
    return () => { current = false; controls.stop(); };
  }, [present, reduced, controls, safeToRemove]);
  useEffect(() => { if (!present && reduced) safeToRemove?.(); }, [present, reduced, safeToRemove]);
  return <motion.div id={id} className={styles.panel} inert={!present || undefined} aria-hidden={!present || undefined}
    initial={reduced ? false : { height: 0 }} animate={controls}>{children}</motion.div>;
}

function EntryContent({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion() ?? false;
  const [present, safeToRemove] = usePresence();
  const controls = useAnimationControls();
  useLayoutEffect(() => {
    let current = true;
    controls.stop();
    if (reduced) controls.set({ opacity: present ? 1 : 0, y: 0, filter: none });
    else if (present) void controls.start({ opacity: 1, y: 0, filter: none, transition: { y: { ...motionTokens.spring.smooth, delay: Math.min(motionTokens.stagger.word, motionTokens.sequence.maxStagger) }, opacity: { duration: motionTokens.duration.standard, delay: Math.min(motionTokens.stagger.word, motionTokens.sequence.maxStagger) }, filter: { duration: motionTokens.duration.standard, delay: Math.min(motionTokens.stagger.word, motionTokens.sequence.maxStagger) } } });
    else void controls.start({ opacity: 0, transition: { duration: motionTokens.duration.instant } }).then(() => { if (current) safeToRemove?.(); });
    return () => { current = false; controls.stop(); };
  }, [present, reduced, controls, safeToRemove]);
  useEffect(() => { if (!present && reduced) safeToRemove?.(); }, [present, reduced, safeToRemove]);
  return <motion.div className={styles.panelInner} initial={reduced ? false : { opacity: 0, y: motionTokens.changelog.panelTravel, filter: blurSoft }} animate={controls}>{children}</motion.div>;
}

function EntryRow({ entry, open, onToggle, reduce }: { entry: Entry; open: boolean; onToggle: () => void; reduce: boolean }) {
  const panelId = useId();
  const kind = kinds.find((item) => item.id === entry.kind)!;
  const liveReduced = useReducedMotion() ?? false;
  const [present, safeToRemove] = usePresence();
  const controls = useAnimationControls();
  useLayoutEffect(() => {
    let current = true;
    controls.stop();
    if (liveReduced) controls.set(present ? { opacity: 1, scale: 1, filter: none } : { opacity: 0, scale: 1, filter: none });
    else if (present) void controls.start({ opacity: 1, scale: 1, filter: none, transition: { opacity: { duration: motionTokens.duration.standard }, filter: { duration: motionTokens.duration.standard } } });
    else void controls.start({ opacity: 0, scale: motionTokens.changelog.entryExitScale, filter: blurSubtle, transition: { duration: motionTokens.duration.exit, ease: [...motionTokens.ease.standard] } }).then(() => { if (current) safeToRemove?.(); });
    return () => { current = false; controls.stop(); };
  }, [present, liveReduced, controls, safeToRemove]);
  useEffect(() => { if (!present && liveReduced) safeToRemove?.(); }, [present, liveReduced, safeToRemove]);
  const layout: Transition = liveReduced ? ({ duration: motionTokens.reduced.duration }) : motionTokens.spring.smooth;
  return <motion.li
    layout="position"
    className={styles.entry}
    data-open={open || undefined}
    inert={!present || undefined}
    aria-hidden={!present || undefined}
    initial={liveReduced ? { opacity: 0 } : { opacity: 0, filter: blurSubtle }}
    animate={controls}
    transition={{ layout }}
  >
    <button type="button" className={styles.row} aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
      <span className={styles.meta}>
        <time dateTime={entry.iso}>{entry.date}</time>
        <span className={styles.version}>v{entry.version}</span>
      </span>
      <span className={styles.body}>
        <span className={styles.kind} data-kind={entry.kind}><i aria-hidden="true" />{kind.label}</span>
        <span className={styles.title}>{entry.title}</span>
        <span className={styles.summary}>{entry.summary}</span>
      </span>
      {reduce ? <span className={styles.chevron} aria-hidden="true" style={{ transform: `rotate(${open ? motionTokens.changelog.chevronRotation : 0}deg)` }}><ChevronDown size={motionTokens.changelog.iconSize} /></span> : <motion.span className={styles.chevron} aria-hidden="true" initial={false} animate={{ rotate: open ? motionTokens.changelog.chevronRotation : 0 }} transition={motionTokens.spring.snappy}><ChevronDown size={motionTokens.changelog.iconSize} /></motion.span>}
    </button>
    <AnimatePresence initial={false}>
      {open && <EntryPanel key="panel" id={panelId}>
        <EntryContent>
          <ul className={styles.details}>{entry.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
          {entry.media && <EntryMedia media={entry.media} />}
        </EntryContent>
      </EntryPanel>}
    </AnimatePresence>
  </motion.li>;
}

const EntryGroup = forwardRef<HTMLElement, { labelledBy: string; children: ReactNode }>(function EntryGroup({ labelledBy, children }, ref) {
  const reduced = useReducedMotion() ?? false;
  const [present, safeToRemove] = usePresence();
  const controls = useAnimationControls();
  useLayoutEffect(() => {
    let current = true;
    controls.stop();
    if (reduced) controls.set({ opacity: present ? 1 : 0 });
    else if (present) void controls.start({ opacity: 1, transition: { duration: motionTokens.duration.standard } });
    else void controls.start({ opacity: 0, transition: { duration: motionTokens.duration.exit } }).then(() => { if (current) safeToRemove?.(); });
    return () => { current = false; controls.stop(); };
  }, [present, reduced, controls, safeToRemove]);
  useEffect(() => { if (!present && reduced) safeToRemove?.(); }, [present, reduced, safeToRemove]);
  return <motion.section ref={ref} layout="position" className={styles.group} aria-labelledby={labelledBy}
    inert={!present || undefined} aria-hidden={!present || undefined}
    initial={reduced ? false : { opacity: 0 }} animate={controls}
    transition={{ layout: reduced ? { duration: motionTokens.reduced.duration } : motionTokens.spring.smooth }}>{children}</motion.section>;
});

function ClearControl({ onClear }: { onClear: () => void }) {
  const reduced = useReducedMotion() ?? false;
  const [present, safeToRemove] = usePresence();
  const controls = useAnimationControls();
  useLayoutEffect(() => {
    let current = true;
    controls.stop();
    if (reduced) controls.set({ opacity: present ? 1 : 0, x: 0, filter: none });
    else if (present) void controls.start({ opacity: 1, x: 0, filter: none, transition: motionTokens.spring.snappy });
    else void controls.start({ opacity: 0, x: motionTokens.changelog.clearExit, filter: blurSubtle, transition: { duration: motionTokens.duration.instant } }).then(() => { if (current) safeToRemove?.(); });
    return () => { current = false; controls.stop(); };
  }, [present, reduced, controls, safeToRemove]);
  useEffect(() => { if (!present && reduced) safeToRemove?.(); }, [present, reduced, safeToRemove]);
  return <MotionPresenceButton type="button" className={styles.clear} onClick={event => {
    const group = event.currentTarget.closest('[role="group"]');
    const target = group?.querySelector<HTMLButtonElement>('button[data-kind][aria-pressed="true"]') ?? group?.querySelector<HTMLButtonElement>('button[data-kind]');
    if (document.activeElement === event.currentTarget) target?.focus({ preventScroll: true });
    onClear();
  }} initial={reduced ? false : { opacity: 0, x: motionTokens.changelog.clearEnter, filter: blurSubtle }} animate={controls}>Show all</MotionPresenceButton>;
}

export interface ChangelogFeedProps {
  /** Release notes, newest first. Each entry belongs to one of `months` by key. */
  entries?: ChangelogEntry[];
  /** Months shown in the month bar, newest first. */
  months?: ChangelogMonth[];
  title?: string;
  /** One line under the title, such as the latest release. */
  subtitle?: string;
  /** Closing line at the end of the list. */
  endNote?: string;
  /** Entry ids open on first render. Defaults to the newest entry. */
  defaultOpen?: string[];
  className?: string;
}

export function ChangelogFeed({
  entries = exampleEntries,
  months = exampleMonths,
  title = "Folio21 · production notes",
  subtitle = "Trim, fold and packing revisions for the three-station print edition.",
  endNote = "First proof to final sheet · end of the production record.",
  defaultOpen,
  className,
}: ChangelogFeedProps = {}) {
  const uid = useId();
  const totalCount = entries.length;
  const kindCounts = useMemo(() => kinds.reduce<Record<Kind, number>>((counts, kind) => ({ ...counts, [kind.id]: entries.filter((entry) => entry.kind === kind.id).length }), { new: 0, improved: 0, fixed: 0 }), [entries]);
  const monthOrder = useCallback((key: string) => months.findIndex((month) => month.key === key), [months]);
  const reduce = useReducedMotion() ?? false;
  const [filters, setFilters] = useState<Kind[]>([]);
  const [open, setOpen] = useState<string[]>(() => defaultOpen ?? (entries[0] ? [entries[0].id] : []));
  const [active, setActive] = useState({ key: months[0]?.key ?? "", direction: 1 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef(new Map<string, HTMLElement>());
  const frame = useRef(0);

  const visible = useMemo(() => entries.filter((entry) => filters.length === 0 || filters.includes(entry.kind)), [entries, filters]);
  const groups = useMemo(() => months.map((month) => ({ ...month, items: visible.filter((entry) => entry.month === month.key) })).filter((group) => group.items.length > 0), [months, visible]);
  const current = groups.find((group) => group.key === active.key) ?? groups[0];

  const sync = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller || groups.length === 0) return;
    const line = scroller.getBoundingClientRect().top + motionTokens.changelog.scrollActivationInset;
    let key = groups[0]!.key;
    for (const group of groups) {
      const element = groupRefs.current.get(group.key);
      if (element && element.getBoundingClientRect().top <= line) key = group.key;
    }
    if (scroller.scrollTop > 0 && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - motionTokens.changelog.scrollEndTolerance) key = groups[groups.length - 1]!.key;
    setActive((previous) => previous.key === key ? previous : { key, direction: monthOrder(key) > monthOrder(previous.key) ? 1 : -1 });
  }, [groups, monthOrder]);

  const onScroll = useCallback(() => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => { frame.current = 0; sync(); });
  }, [sync]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(() => onScroll());
    observer.observe(list);
    return () => observer.disconnect();
  }, [onScroll]);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  useEffect(() => {
    const node = scrollRef.current;
    if (reduce && node) node.scrollTo({ top: node.scrollTop, left: node.scrollLeft, behavior: "instant" });
  }, [reduce]);

  function toggleFilter(kind: Kind) { setFilters((previous) => previous.includes(kind) ? previous.filter((item) => item !== kind) : [...previous, kind]); }
  function toggleEntry(id: string) { setOpen((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]); }
  function jumpTo(key: string) {
    const scroller = scrollRef.current;
    const element = groupRefs.current.get(key);
    if (!scroller || !element) return;
    // Layout projection moves the painted group; navigation targets its committed flow position.
    const top = element.offsetTop + (listRef.current?.offsetTop ?? 0);
    scroller.scrollTo({ top: Math.max(0, top - motionTokens.changelog.scrollTargetInset), behavior: reduce ? "auto" : "smooth" });
  }

  const shownLabel = filters.length === 0 ? `${totalCount} updates` : `${visible.length} of ${totalCount} updates`;
  const layout: Transition = reduce ? ({ duration: motionTokens.reduced.duration }) : motionTokens.spring.smooth;

  return <section className={[styles.feed, className].filter(Boolean).join(" ")} aria-labelledby={`${uid}-title`}>
    <header className={styles.header}>
      <div className={styles.heading}>
        <h2 id={`${uid}-title`}>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <ExportControl entries={visible} title={title} reduce={reduce} />
    </header>

    <div className={styles.toolbar}>
      <div className={styles.chips} role="group" aria-label="Filter by type">
        {kinds.map((kind) => {
          const on = filters.includes(kind.id);
          return <button key={kind.id} type="button" className={styles.chip} data-kind={kind.id} aria-pressed={on} onClick={() => toggleFilter(kind.id)}>
            {reduce ? <span className={styles.chipMark} aria-hidden="true" style={{ width: on ? motionTokens.changelog.markerSelected : motionTokens.changelog.markerRest, height: on ? motionTokens.changelog.markerSelected : motionTokens.changelog.markerRest }}>
              <span className={styles.chipTick} style={{ opacity: on ? 1 : 0, transform: `scale(${on ? 1 : motionTokens.changelog.tickRestScale})` }}><Check size={motionTokens.changelog.tickSize} strokeWidth={motionTokens.changelog.tickStroke} /></span>
            </span> : <motion.span className={styles.chipMark} aria-hidden="true" initial={false} animate={{ width: on ? motionTokens.changelog.markerSelected : motionTokens.changelog.markerRest, height: on ? motionTokens.changelog.markerSelected : motionTokens.changelog.markerRest }} transition={motionTransition("selection", reduce)}>
              <motion.span className={styles.chipTick} initial={false} animate={{ opacity: on ? 1 : 0, scale: on ? 1 : motionTokens.changelog.tickRestScale }} transition={{ ...motionTokens.spring.snappy, delay: on ? Math.min(motionTokens.stagger.word, motionTokens.sequence.maxStagger) : motionTokens.reduced.stagger }}><Check size={motionTokens.changelog.tickSize} strokeWidth={motionTokens.changelog.tickStroke} /></motion.span>
            </motion.span>}
            <span>{kind.label}</span>
            <span className={styles.chipCount}>{kindCounts[kind.id]}</span>
          </button>;
        })}
        <AnimatePresence initial={false}>
          {filters.length > 0 && <ClearControl key="clear" onClear={() => setFilters([])} />}
        </AnimatePresence>
      </div>
      <p className={styles.shown} aria-hidden="true">
        <motion.span className={styles.shownCount} layout="position" transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : layout}><RollingNumber value={visible.length} reduce={reduce} /></motion.span>
        {reduce ? <span>{filters.length === 0 ? "updates" : `of ${totalCount} updates`}</span> : <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={filters.length === 0 ? "all" : "some"} initial={{ opacity: 0, filter: blurSubtle }} animate={{ opacity: 1, filter: none }} exit={{ opacity: 0, transition: { duration: motionTokens.duration.instant } }} transition={{ duration: motionTokens.duration.standard }}>{filters.length === 0 ? "updates" : `of ${totalCount} updates`}</motion.span>
        </AnimatePresence>}
      </p>
      <p className={styles.srOnly} role="status" aria-live="polite">{`Showing ${shownLabel}`}</p>
    </div>

    <div className={styles.monthBar}>
      <div className={styles.monthLabel} aria-hidden="true">
        <span className={styles.monthText}>
          {reduce ? <span>{current ? <>{current.label.split(" ")[0]}<span className={styles.monthYear}> {current.label.split(" ")[1]}</span></> : "No updates"}</span> : <AnimatePresence mode="popLayout" initial={false} custom={active.direction}>
            <motion.span key={current?.key ?? "none"} custom={active.direction} variants={rise} initial="enter" animate="center" exit="exit" transition={motionTokens.spring.morph}>{current ? <>{current.label.split(" ")[0]}<span className={styles.monthYear}> {current.label.split(" ")[1]}</span></> : "No updates"}</motion.span>
          </AnimatePresence>}
        </span>
        <motion.span className={styles.monthCount} layout="position" transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : layout}><RollingNumber value={current?.items.length ?? 0} reduce={reduce} />{current?.items.length === 1 ? "update" : "updates"}</motion.span>
      </div>
      <nav className={styles.monthNav} aria-label="Jump to month">
        {groups.map((group) => {
          const selected = group.key === current?.key;
          return <button key={group.key} type="button" aria-label={`Jump to ${group.label}`} aria-current={selected ? "true" : undefined} onClick={() => jumpTo(group.key)}>
            {selected && <motion.span layoutId={reduce ? undefined : `${uid}-month`} className={styles.monthPill} transition={motionTransition("selection", reduce)} />}
            <span className={styles.monthShort}>{group.short}</span>
          </button>;
        })}
      </nav>
    </div>

    <motion.div layoutScroll ref={scrollRef} className={styles.scroller} onScroll={onScroll} tabIndex={0} aria-label="Production notes">
      <div ref={listRef} className={styles.list}>
        <AnimatePresence mode="popLayout" initial={false}>
          {groups.map((group, index) => <EntryGroup
            key={group.key}
            labelledBy={`${uid}-${group.key}`}
            ref={(element: HTMLElement | null) => { if (element) groupRefs.current.set(group.key, element); else groupRefs.current.delete(group.key); }}
          >
            <h3 id={`${uid}-${group.key}`} className={index === 0 ? styles.srOnly : styles.groupTitle}>{group.label}</h3>
            <ul className={styles.entries}>
              <AnimatePresence mode="popLayout" initial={false}>
                {group.items.map((entry) => <EntryRow key={entry.id} entry={entry} open={open.includes(entry.id)} onToggle={() => toggleEntry(entry.id)} reduce={reduce} />)}
              </AnimatePresence>
            </ul>
          </EntryGroup>)}
        </AnimatePresence>
        <motion.p layout="position" transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : { layout }} className={styles.endCap}>{groups.length ? endNote : filters.length ? "No entries match these filters. Choose Show all to restore the list." : "No entries in this record."}</motion.p>
      </div>
    </motion.div>
  </section>;
}

export default ChangelogFeed;
