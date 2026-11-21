"use client";

import { Fragment, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { FocusEvent, ReactNode, UIEvent } from "react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/primitives/dropdown-menu";
import { pageHeaderGeometry } from "@/primitives/page-header-geometry";
import { floatingPlacement } from "@/primitives/floating-placement";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/primitives/tabs";
import { MotionPresenceDiv } from "@/variants/presence-controls";
import { MotionListItem, MotionRegion } from "@/variants/motion-swap";
import { AnimatePresence, LayoutGroup, motion, visualElementStore, type Transition, type Variants } from "motion/react";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { motionTransition, observeReducedMotion } from "@/variants/motion-policy";
import { Archive, ArchiveRestore, CalendarDays, ClipboardList, Check, ChevronRight, Circle, CircleAlert, CircleCheck, CircleDashed, Ellipsis, FileSpreadsheet, FileText, Link2, Megaphone, Plus, type LucideIcon } from "rams-icons";
import { AnimatedCounter } from "@/variants/vendor/registry/components/animated-counter/animated-counter";
import { Avatar } from "@/variants/vendor/registry/components/avatar/avatar";
import { AvatarGroup } from "@/variants/vendor/registry/components/avatar-group/avatar-group";
import { Badge } from "@/variants/vendor/registry/components/badge/badge";
import { Button } from "@/variants/vendor/registry/components/button/button";
import { Progress } from "@/variants/vendor/registry/components/progress/progress";
import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
import styles from "./page-header.module.css";

const DONE_AT_START = 5;

// These initials identify production stations, so no portrait or personal identity is implied.
type PersonId = "prepress" | "press" | "packing" | "folding" | "local";
const people: Record<PersonId, { name: string }> = {
  prepress: { name: "Prepress bench" },
  press: { name: "Press bench" },
  packing: { name: "Packing bench" },
  folding: { name: "Folding bench" },
  local: { name: "Local worksheet" },
};
const members = Object.values(people);

type Section = "overview" | "issues" | "updates" | "files";
const sections: { value: Section; label: string }[] = [{ value: "overview", label: "Overview" }, { value: "issues", label: "Checks" }, { value: "updates", label: "Notes" }, { value: "files", label: "Files" }];
const order = (section: Section) => sections.findIndex(item => item.value === section);

type Issue = { id: string; title: string; owner: PersonId; label: string; fresh?: boolean };
const startingIssues: Issue[] = [
  { id: "F21-038", title: "Check the Rosario title panel against the folded dummy", owner: "folding", label: "Fold" },
  { id: "F21-036", title: "Measure the 3 mm bleed on both separations", owner: "prepress", label: "Trim" },
  { id: "F21-035", title: "Keep registration crosses outside the finished edge", owner: "prepress", label: "Plate" },
  { id: "F21-033", title: "Count 100 finished sheets for each station bundle", owner: "packing", label: "Count" },
  { id: "F21-031", title: "Check grey-pass alignment on the Mendoza canal grid", owner: "press", label: "Register" },
  { id: "F21-029", title: "Reserve ten spare sheets for each station", owner: "packing", label: "Stock" },
  { id: "F21-027", title: "Confirm grain runs parallel to the long fold", owner: "folding", label: "Paper" },
  { id: "F21-024", title: "Read Córdoba place names at finished size", owner: "prepress", label: "Type" },
  { id: "F21-022", title: "Check the reverse is dry before stacking", owner: "press", label: "Drying" },
];
const draftIssues = [
  "Check a final folded sheet against the A3 trim ticket",
  "Recount the spare sleeve after the packing check",
  "Check the grey plate edge against the black registration marks",
  "Read the station label against its packing-list row",
];

type Update = { id: string; author: PersonId; date: string; tone: "success" | "warning"; status: string; body: string; fresh?: boolean };
const startingUpdates: Update[] = [
  { id: "u4", author: "prepress", date: "Sep 19", tone: "success", status: "Proof record", body: "The Rosario fold dummy now includes the full 3 mm bleed and a 5 mm safe area for small type." },
  { id: "u3", author: "packing", date: "Sep 12", tone: "success", status: "Count record", body: "The packing worksheet allocates 100 finished sheets and ten spares each to Rosario, Córdoba and Mendoza." },
  { id: "u2", author: "press", date: "Sep 5", tone: "warning", status: "Check required", body: "The Mendoza grey pass needs a registration check before the remaining sheets use the second plate." },
  { id: "u1", author: "folding", date: "Aug 29", tone: "success", status: "Fold record", body: "The six-panel dummy opens from the title on the right. Grain direction is recorded along the 420 mm edge." },
];

const files: { name: string; kind: string; owner: PersonId; date: string; icon: LucideIcon; content: string }[] = [
  { name: "folio21-trim.txt", kind: "Text", owner: "prepress", date: "Sep 20", icon: FileText, content: "Folio21 / three-station edition\nTrim: 297 x 420 mm\nArtwork: 303 x 426 mm\nBleed: 3 mm on each edge\nSafe type: 5 mm inside trim\nFold positions: 99 / 198 mm\n" },
  { name: "station-allocation.csv", kind: "CSV", owner: "packing", date: "Sep 18", icon: FileSpreadsheet, content: "station,finished,spares,total_sheets\nRosario,100,10,110\nCórdoba,100,10,110\nMendoza,100,10,110\nTOTAL,300,30,330\n" },
  { name: "fold-sequence.txt", kind: "Text", owner: "folding", date: "Sep 16", icon: FileText, content: "Folio21 / six-panel fold\nOutside left to right: 5, 6, 1\nInside left to right: 2, 3, 4\nGrain parallel to long edge\nKeep panel numbers clear of the fold\n" },
  { name: "press-checks.txt", kind: "Text", owner: "press", date: "Sep 13", icon: FileText, content: "Folio21 / press sequence\n1. Check black plate against trim ticket\n2. Print black pass\n3. Check drying before stacking\n4. Align grey plate against registration marks\n5. Print grey pass\n6. Count finished sheets after trim\n" },
];

const milestoneIcons = { done: CircleCheck, active: CircleDashed, planned: Circle };
const milestones: { name: string; note: string; state: keyof typeof milestoneIcons }[] = [
  { name: "Fold dummy", note: "Recorded Aug 29", state: "done" },
  { name: "Two-pass proof", note: "Registration check open", state: "active" },
  { name: "Three station bundles", note: "Packing checks open", state: "planned" },
];
const activity: { who: PersonId; text: string; time: string }[] = [
  { who: "prepress", text: "recorded the A3 trim and safe-type dimensions", time: "Sep 20" },
  { who: "packing", text: "listed 330 input sheets for three bundles", time: "Sep 18" },
  { who: "press", text: "flagged the grey-pass registration check", time: "Sep 5" },
  { who: "folding", text: "recorded the six-panel reading order", time: "Aug 29" },
];

type Notice = { key: number; text: string; tone: "success" | "error" | "neutral" };
type MenuAction = { key: string; label: string; icon: ReactNode; onSelect: () => void; disabled?: boolean; separatorBefore?: boolean };

const still: Transition = { duration: motionTokens.reduced.duration };
const motionGeometry = motionTokens.keyframes.pageHeader;
const quick: Transition = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] };
const blur = (px: number) => `blur(${px}px)`;
const icon = {
  size: "var(--rams-detail-motion-button-glyph-size)",
  strokeWidth: "var(--rams-detail-motion-button-glyph-stroke)",
  "aria-hidden": true,
} as const;

/** Panels slide a few pixels in the direction of the tab that was chosen. */
const panelSlide: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * motionGeometry.panelEnterTravelPx }),
  center: { opacity: 1, x: 0, transition: { x: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } } },
  exit: (direction: number) => ({ opacity: 0, x: -direction * motionGeometry.panelExitTravelPx, transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] } }),
};

/** Rows open and close their own height, so the list closes the gap instead of jumping. */
function rowMotion(reduce: boolean) {
  return reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: motionTokens.reduced.duration } }
    : { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, exit: { opacity: 0, height: 0 }, transition: { height: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.standard] } } };
}

function StatusDot() {
  return <span className={styles.dot} />;
}

/** The overflow button never scales: it anchors the menu. A shared highlight glides between items under the pointer. */
function OverflowMenu({ actions, reduce }: { actions: MenuAction[]; reduce: boolean }) {
  const [highlight, setHighlight] = useState<{ top: number; height: number; glide: boolean } | null>(null);
  const pointer = useRef(false);
  const clearTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(clearTimer.current), []);
  function onFocus(event: FocusEvent<HTMLDivElement>) {
    const item = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[role="menuitem"]') : null;
    window.clearTimeout(clearTimer.current);
    if (!item) { clearTimer.current = window.setTimeout(() => setHighlight(null), pointer.current ? motionGeometry.pointerHighlightGraceMs : 0); return; }
    const glide = pointer.current;
    setHighlight(current => ({ top: item.offsetTop, height: item.offsetHeight, glide: glide && current !== null }));
  }
  return <DropdownMenu onOpenChange={open => { if (open) { window.clearTimeout(clearTimer.current); setHighlight(null); } }}>
    <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className={styles.iconButton} aria-label="More actions"><Ellipsis {...icon} /></Button></DropdownMenuTrigger>
      <DropdownMenuContent className={`${styles.menu} rams-page-header-menu`} align="end" sideOffset={floatingPlacement.motionDropdown.anchorGapPx} collisionPadding={floatingPlacement.motionDropdown.collisionInsetPx} loop onFocus={onFocus} onPointerMoveCapture={() => { pointer.current = true; }} onKeyDownCapture={() => { pointer.current = false; }}>
        <motion.span className={styles.highlight} aria-hidden="true" initial={false} animate={highlight ? { y: highlight.top, height: highlight.height, opacity: 1 } : { opacity: 0 }} transition={{ default: highlight?.glide && !reduce ? motionTokens.spring.snappy : still, opacity: { duration: reduce ? motionTokens.reduced.duration : motionTokens.duration.instant } }} />
        {actions.map(action => <Fragment key={action.key}>
          {action.separatorBefore && <DropdownMenuSeparator className={styles.separator} />}
          <DropdownMenuItem className={styles.item} disabled={action.disabled} onSelect={action.onSelect}>{action.icon}{action.label}</DropdownMenuItem>
        </Fragment>)}
      </DropdownMenuContent>
  </DropdownMenu>;
}

function OverviewPanel({ done, open }: { done: number; open: number }) {
  const total = done + open;
  return <div className={styles.overview}>
    <div className={styles.progress}><Progress value={done} max={total} label={`${done} of ${total} checks done`} showValue /></div>
    <div>
      <h3 className={styles.sectionTitle}>Milestones</h3>
      <ol className={styles.milestones}>{milestones.map(item => {
        const Icon = milestoneIcons[item.state];
        return <li className="rams-page-header-content-row" key={item.name} data-state={item.state}><Icon {...icon} /><span className={styles.milestoneName}>{item.name}</span><span className={styles.note}>{item.note}</span></li>;
      })}</ol>
    </div>
    <div>
      <h3 className={styles.sectionTitle}>Production record</h3>
      <ul className={styles.activity}>{activity.map(item => <li className="rams-page-header-content-row" key={`${item.who}-${item.text}`}><Avatar name={people[item.who].name} size="sm" /><p><strong>{people[item.who].name}</strong> {item.text}</p><span className={styles.note}>{item.time}</span></li>)}</ul>
    </div>
  </div>;
}

function IssuesPanel({ issues, reduce, onComplete, onReset, register }: { issues: Issue[]; reduce: boolean; onComplete: (issue: Issue) => void; onReset: () => void; register: (id: string, node: HTMLButtonElement | null) => void }) {
  const row = useMemo(() => rowMotion(reduce), [reduce]);
  return <>
    <ul className={styles.issues} aria-label="Open production checks">
      <AnimatePresence initial={false}>
        {issues.map(issue => {
          const owner = people[issue.owner];
          return <MotionListItem key={issue.id} className={`${styles.issue} rams-page-header-content-row`} data-fresh={issue.fresh || undefined} {...row}>
            <div className={`${styles.issueInner} rams-page-header-fresh-highlight`}>
              <button ref={node => register(issue.id, node)} type="button" className={`${styles.check} rams-page-header-check`} aria-label={`Mark ${issue.id} done`} onClick={() => onComplete(issue)}>
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.span key="open" className={styles.checkGlyph} initial={reduce ? { opacity: 0 } : { opacity: 0, scale: motionGeometry.checkAppearScale }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reduce ? 1 : motionGeometry.checkAppearScale, transition: quick }} transition={reduce ? ({ duration: motionTokens.reduced.duration }) : motionTokens.spring.snappy}>
                    <Circle {...icon} size="var(--rams-detail-page-header-check-glyph-size)" />
                  </motion.span>
                </AnimatePresence>
              </button>
              <span className={styles.issueText}><span className={styles.issueId}>{issue.id}</span><span className={styles.issueTitle}>{issue.title}</span></span>
              <span className={styles.issueLabel}>{issue.label}</span>
              <Avatar name={owner.name} size="sm" />
            </div>
          </MotionListItem>;
        })}
      </AnimatePresence>
    </ul>
    {issues.length === 0 && <motion.div className={styles.empty} initial={{ opacity: 0, y: reduce ? 0 : motionGeometry.emptyEntryTravelPx }} animate={{ opacity: 1, y: 0 }} transition={reduce ? { duration: motionTokens.reduced.duration } : motionTokens.spring.smooth}>
      <CircleCheck {...icon} size="var(--rams-detail-page-header-empty-glyph-size)" />
      <p>All listed checks completed</p>
      <span>This worksheet has no remaining checks.</span>
      <Button variant="outline" size="sm" onClick={onReset}>Restore initial checks</Button>
    </motion.div>}
  </>;
}

function UpdatesPanel({ updates, reduce }: { updates: Update[]; reduce: boolean }) {
  const row = useMemo(() => rowMotion(reduce), [reduce]);
  return <ol className={styles.updates} aria-label="Production notes">
    <AnimatePresence initial={false}>
      {updates.map(update => {
        const author = people[update.author];
        return <MotionListItem key={update.id} className={`${styles.update} rams-page-header-content-row`} data-fresh={update.fresh || undefined} {...row}>
          <article className={`${styles.updateInner} rams-page-header-fresh-highlight`}>
            <Avatar name={author.name} size="default" />
            <div>
              <div className={styles.updateHead}><span className={styles.author}>{author.name}</span><span className={styles.note}>{update.date}</span><Badge size="sm" tone={update.tone} icon={<StatusDot />}>{update.status}</Badge></div>
              <p>{update.body}</p>
            </div>
          </article>
        </MotionListItem>;
      })}
    </AnimatePresence>
  </ol>;
}

function FilesPanel() {
  return <ul className={styles.files} aria-label="Local production files">{files.map(file => {
    const Icon = file.icon;
    const owner = people[file.owner];
    const bytes = new TextEncoder().encode(file.content).length;
    return <li className="rams-page-header-content-row" key={file.name}><Icon {...icon} /><span className={styles.fileName}><a href={`data:text/plain;charset=utf-8,${encodeURIComponent(file.content)}`} download={file.name}>{file.name}</a><span className={styles.note}>{file.kind}, {bytes} bytes · download</span></span><Avatar name={owner.name} size="sm" /><span className={styles.fileDate}>{file.date}</span></li>;
  })}</ul>;
}

export function PageHeader() {
  const id = useId();
  const reduce = useReducedMotion() ?? false;
  const bar = useRef<HTMLDivElement>(null);
  const secondary = useRef<HTMLDivElement>(null);
  const trailing = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const tabList = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const compactRef = useRef<HTMLButtonElement>(null);
  const returnFocusToTitle = useRef(false);
  const toggles = useRef(new Map<string, HTMLButtonElement>());
  const focusRestoredChecks = useRef(false);
  const counters = useRef({ issue: 0, update: 0, notice: 0 });
  const [view, setView] = useState<{ section: Section; direction: number }>({ section: "overview", direction: 1 });
  const [condensed, setCondensed] = useState(false);
  const [layout, setLayout] = useState({ measured: false, collapsed: false, animate: false });
  const [archived, setArchived] = useState(false);
  const [issues, setIssues] = useState(startingIssues);
  const [done, setDone] = useState(DONE_AT_START);
  const [updates, setUpdates] = useState(startingUpdates);
  const [notice, setNotice] = useState<Notice | null>(null);

  // Only the header width is observed, so action content never folds its own control.
  // The first measurement applies at once; later width changes fold the actions with a spring.
  useEffect(() => {
    const row = bar.current, folded = secondary.current, fixed = trailing.current;
    if (!row || !folded || !fixed || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const room = row.clientWidth - folded.offsetWidth - fixed.offsetWidth - pageHeaderGeometry.leadReservedPx;
      const fold = pageHeaderGeometry.leadFoldPx;
      const restore = pageHeaderGeometry.leadRestorePx;
      setLayout(current => {
        const collapsed = current.measured && current.collapsed ? room < restore : room < fold;
        return current.measured && current.collapsed === collapsed ? current : { measured: true, collapsed, animate: current.measured };
      });
    });
    observer.observe(row);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const handle = window.setTimeout(() => setNotice(null), motionGeometry.noticeDwellMs);
    return () => window.clearTimeout(handle);
  }, [notice]);

  // Keep the chosen tab in view when the list scrolls sideways on narrow screens.
  useEffect(() => {
    const list = tabList.current;
    const tab = list?.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    if (!list || !tab) return;
    const inset = pageHeaderGeometry.tabScrollInsetPx;
    const view = list.getBoundingClientRect();
    const target = tab.getBoundingClientRect();
    const start = target.left - view.left - inset;
    const end = target.right - view.right + inset;
    const delta = start < 0 ? start : Math.max(0, end);
    if (delta) list.scrollBy({ left: delta, behavior: reduce ? "instant" : "smooth" });
  }, [view.section, reduce]);


  useEffect(() => {
    if (!reduce) return;
    for (const node of [scroller.current, tabList.current]) node?.scrollTo({ top: node.scrollTop, left: node.scrollLeft, behavior: "instant" });
  }, [reduce]);

  function notify(text: string, tone: Notice["tone"] = "success") {
    counters.current.notice += 1;
    setNotice({ key: counters.current.notice, text, tone });
  }

  /** Switching sections while condensed shows the top of the new panel and keeps the compact bar. */
  function selectSection(next: Section, reveal = false) {
    setView(current => current.section === next ? current : { section: next, direction: order(next) > order(current.section) ? 1 : -1 });
    const node = scroller.current;
    if (node && (reveal || next !== view.section)) {
      const sectionStart = pageHeaderGeometry.condenseScrollPx + 1;
      if (node.scrollTop > sectionStart) node.scrollTop = sectionStart;
    }
  }

  function onScroll(event: UIEvent<HTMLDivElement>) {
    const top = event.currentTarget.scrollTop;
    const condense = pageHeaderGeometry.condenseScrollPx;
    const expand = pageHeaderGeometry.expandScrollPx;
    setCondensed(current => top > (current ? expand : condense));
  }

  useLayoutEffect(() => {
    if (condensed || !returnFocusToTitle.current) return;
    returnFocusToTitle.current = false;
    const active = document.activeElement;
    if (active === compactRef.current || active === document.body)
      titleRef.current?.focus({ preventScroll: true });
  }, [condensed]);

  useLayoutEffect(() => {
    const view = bar.current?.ownerDocument.defaultView;
    if (!view || typeof view.matchMedia !== "function") return;
    const settle = (reduced: boolean) => {
      if (!reduced) return;
      const frame = bar.current?.closest(".rams-page-header-frame");
      if (!frame) return;
      const compact = frame.querySelector<HTMLElement>(`.${styles.compact}`);
      const isCondensed = compact ? !compact.inert : false;
      const nodes = frame.querySelectorAll<HTMLElement>(`.${styles.crumbs}, .${styles.compact}, .${styles.intro}, .${styles.titleRow}, .${styles.details}, .${styles.issue}, .${styles.update}, .${styles.toast}`);
      for (const node of nodes) {
        const visual = visualElementStore.get(node);
        const isIntro = node.classList.contains(styles.intro);
        const isRow = node.classList.contains(styles.issue) || node.classList.contains(styles.update);
        const hidden = node.classList.contains(styles.crumbs) || node.classList.contains(styles.titleRow) || node.classList.contains(styles.details) ? isCondensed : node.classList.contains(styles.compact) ? !isCondensed : node.inert;
        if (isIntro) visual?.getValue("height")?.jump(isCondensed ? 0 : "auto");
        else {
          if (isRow && hidden) visual?.getValue("height")?.jump(0);
          else if (isRow) visual?.getValue("height")?.jump("auto");
          visual?.getValue("opacity")?.jump(hidden ? 0 : 1);
          visual?.getValue("y")?.jump(0);
          visual?.getValue("scale")?.jump(1);
          visual?.getValue("filter")?.jump("blur(0px)");
        }
        visual?.render();
      }
    };
    return observeReducedMotion(settle, view);
  }, []);

  useLayoutEffect(() => {
    if (!reduce) return;
    const frame = bar.current?.closest(".rams-page-header-frame");
    if (frame) {
      const nodes = frame.querySelectorAll<HTMLElement>(`.${styles.crumbs}, .${styles.compact}, .${styles.intro}, .${styles.titleRow}, .${styles.details}`);
      for (const node of nodes) {
        const visual = visualElementStore.get(node);
        const isIntro = node.classList.contains(styles.intro);
        const hidden = node.classList.contains(styles.crumbs) || node.classList.contains(styles.titleRow) || node.classList.contains(styles.details) ? condensed : node.classList.contains(styles.compact) ? !condensed : false;
        if (isIntro) visual?.getValue("height")?.jump(condensed ? 0 : "auto");
        else {
          visual?.getValue("opacity")?.jump(hidden ? 0 : 1);
          visual?.getValue("y")?.jump(0);
          visual?.getValue("scale")?.jump(1);
          visual?.getValue("filter")?.jump("blur(0px)");
        }
        visual?.render();
      }
    }
    for (const panel of scroller.current?.querySelectorAll<HTMLElement>('[role="tabpanel"]') ?? []) {
      const visual = visualElementStore.get(panel);
      visual?.getValue("x")?.jump(0);
      visual?.getValue("opacity")?.jump(panel.inert ? 0 : 1);
      visual?.render();
    }
  }, [reduce, condensed]);

  function backToTop() {
    returnFocusToTitle.current = document.activeElement === compactRef.current;
    scroller.current?.scrollTo({ top: 0, behavior: reduce ? "instant" : "smooth" });
  }

  function reviewChecks() { selectSection("issues", true); }

  function recordSnapshot() {
    if (archived) return;
    const index = counters.current.update++;
    setUpdates(list => [{
      id: `snapshot-${index}`, author: "local", date: "This visit", tone: "success", status: "Local snapshot",
      body: `${done} of ${done + issues.length} checks completed; ${issues.length} still open. Remaining: ${issues.length ? issues.map(issue => issue.id).join(", ") : "none"}.`,
    }, ...list]);
    selectSection("updates", true);
    notify("Worksheet counts added to Notes for this visit");
  }

  function createIssue() {
    if (archived) return;
    const index = counters.current.issue++;
    const issue: Issue = { id: `F21-${39 + index}`, title: draftIssues[index % draftIssues.length]!, owner: "local", label: "Recheck" };
    setIssues(list => [issue, ...list]);
    selectSection("issues", true);
    notify(`${issue.id} added to this worksheet`);
  }

  function completeIssue(issue: Issue) {
    if (!issues.some(item => item.id === issue.id)) return;
    const index = issues.findIndex(item => item.id === issue.id);
    const remaining = issues.filter(item => item.id !== issue.id);
    const neighbor = remaining[Math.min(index, remaining.length - 1)];
    const hadFocus = document.activeElement === toggles.current.get(issue.id);
    // Commit the worksheet change immediately; exit animation never gates the count.
    setIssues(remaining);
    setDone(count => count + 1);
    notify(`${issue.id} completed in this worksheet`);
    if (hadFocus) {
      if (neighbor) toggles.current.get(neighbor.id)?.focus();
      else scroller.current?.querySelector<HTMLElement>('[role="tabpanel"][data-state="active"]')?.focus();
    }
  }

  useEffect(() => {
    if (!focusRestoredChecks.current) return;
    focusRestoredChecks.current = false;
    toggles.current.get(startingIssues[0]!.id)?.focus();
  }, [issues]);

  function resetIssues() {
    focusRestoredChecks.current = true;
    setIssues(startingIssues);
    setDone(DONE_AT_START);
    notify("Initial checks and completion count restored", "neutral");
  }

  function toggleArchive() {
    const next = !archived;
    setArchived(next);
    notify(next ? "Worksheet frozen. Adding checks and snapshots is paused." : "Worksheet resumed", "neutral");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("Current page address copied");
    } catch {
      notify("Couldn't copy the link. Try again from the address bar.", "error");
    }
  }


  const status = archived ? { tone: "neutral" as const, label: "Frozen" } : { tone: "success" as const, label: "Working copy" };
  const menuActions: MenuAction[] = [
    ...(layout.collapsed ? [
      { key: "checks", label: "Review checks", icon: <ClipboardList {...icon} />, onSelect: reviewChecks },
      { key: "snapshot", label: "Record snapshot", icon: <Megaphone {...icon} />, onSelect: recordSnapshot, disabled: archived },
    ] : []),
    { key: "copy", label: "Copy page address", icon: <Link2 {...icon} />, onSelect: copyLink, separatorBefore: layout.collapsed },
    { key: "archive", label: archived ? "Resume worksheet" : "Freeze worksheet", icon: archived ? <ArchiveRestore {...icon} /> : <Archive {...icon} />, onSelect: toggleArchive },
  ];

  /** Leaving copy fades fast; arriving copy settles on the smooth spring with a short blur. */
  const swap = (entering: boolean): Transition => reduce ? ({ duration: motionTokens.reduced.duration }) : { ...motionTokens.spring.smooth, opacity: { duration: entering ? motionTokens.duration.standard : motionTokens.duration.fast, ease: [...motionTokens.ease.standard], delay: entering ? Math.min(motionTokens.stagger.word, motionTokens.sequence.maxStagger) : motionTokens.reduced.stagger }, filter: { duration: entering ? motionTokens.duration.standard : motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } };
  const shown = { opacity: 1, y: 0, scale: 1, filter: blur(0) };

  return (
    <Tabs asChild value={view.section} onValueChange={value => selectSection(value as Section)}>
      <section className={`${styles.frame} rams-page-header-frame`} aria-labelledby={`${id}-title`} data-measured={layout.measured || undefined}>
        <header className={`${styles.header} rams-page-header-header`}>
          <div ref={bar} className={styles.bar}>
            <div className={styles.lead}>
              <motion.nav className={styles.crumbs} aria-label="Breadcrumb" inert={condensed} initial={false} animate={condensed ? { opacity: 0, y: -motionGeometry.breadcrumbsExitTravelPx, filter: blur(motionTokens.blur.subtle) } : shown} transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : swap(!condensed)}>
                <ol>
                  <li className={styles.rootCrumb}><span className={styles.crumb}>Folio21</span><ChevronRight {...icon} size="var(--rams-detail-page-header-supporting-glyph-size)" /></li>
                  <li><span className={styles.crumb}>Production</span><ChevronRight {...icon} size="var(--rams-detail-page-header-supporting-glyph-size)" /></li>
                  <li><span className={styles.current} aria-current="page">Three-station print edition</span></li>
                </ol>
              </motion.nav>
              <motion.button ref={compactRef} type="button" className={`${styles.compact} rams-page-header-compact`} inert={!condensed} aria-label="Three-station print edition, back to top" onClick={backToTop} initial={false} animate={condensed ? shown : { opacity: 0, y: motionGeometry.compactTitleEnterTravelPx, filter: blur(motionTokens.blur.soft) }} transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : swap(condensed)}>
                <span className={styles.compactTitle}>Three-station print edition</span>
                <Badge className={styles.compactBadge} size="sm" tone={status.tone} icon={<StatusDot />}>{status.label}</Badge>
              </motion.button>
            </div>

            <div className={styles.actions}>
              <motion.div className={styles.secondary} inert={layout.collapsed} initial={false} animate={layout.collapsed ? { width: 0, opacity: 0 } : { width: "auto", opacity: 1 }} transition={layout.animate && !reduce ? { width: motionTokens.spring.smooth, opacity: { duration: layout.collapsed ? motionTokens.duration.fast : motionTokens.duration.standard, ease: [...motionTokens.ease.standard], delay: Math.min(layout.collapsed ? motionTokens.stagger.word : motionTokens.sequence.handoff, motionTokens.sequence.maxStagger) } } : still}>
                <div ref={secondary} className={styles.secondaryInner}>
                  <Button variant="outline" size="sm" onClick={reviewChecks}><ClipboardList {...icon} /> Review checks</Button>
                  <Button variant="outline" size="sm" disabled={archived} onClick={recordSnapshot}><Megaphone {...icon} /> Record snapshot</Button>
                </div>
              </motion.div>
              <div ref={trailing} className={styles.trailing}>
                <OverflowMenu actions={menuActions} reduce={reduce} />
                <Button className={styles.create} size="sm" aria-label="Add production recheck" disabled={archived} onClick={createIssue}><Plus {...icon} /><span className={styles.createText}>Add recheck</span></Button>
              </div>
            </div>
          </div>

          <motion.div className={styles.intro} initial={false} animate={{ height: condensed ? 0 : "auto" }} transition={reduce ? ({ duration: motionTokens.reduced.duration }) : motionTokens.spring.smooth}>
            <div className={styles.introInner}>
              <motion.div className={styles.titleRow} initial={false} animate={condensed ? { opacity: 0, y: -motionGeometry.headingExitTravelPx, scale: motionGeometry.headingExitScale, filter: blur(motionTokens.blur.subtle) } : shown} transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : swap(!condensed)}>
                <h2 ref={titleRef} id={`${id}-title`} className={styles.title} tabIndex={-1}>Three-station print edition</h2>
                <Badge tone={status.tone} icon={<StatusDot />}>{status.label}</Badge>
              </motion.div>
              <motion.div className={styles.details} initial={false} animate={condensed ? { opacity: 0, y: -motionGeometry.descriptionExitTravelPx } : { opacity: 1, y: 0 }} transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : swap(!condensed)}>
                <p className={styles.description}>A3 walking-map studies for Rosario, Córdoba and Mendoza. Complete checks, record count snapshots and download the job files. Changes stay in this worksheet until it is closed.</p>
                <div className={styles.meta}>
                  <AvatarGroup members={members} size="sm" label="Production stations" />
                  <span><strong>300 finished sheets · 30 spares</strong></span>
                  <span className={styles.metaIcon}><CalendarDays {...icon} size="var(--rams-detail-page-header-supporting-glyph-size)" />Proof record · Sep 20</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <LayoutGroup id={id}>
            <TabsList variant="line" asChild aria-label="Production worksheet sections">
              <motion.div ref={tabList} layoutScroll className={`${styles.tabs} rams-page-header-tabs`}>
                {sections.map(item => {
                  const count = item.value === "issues" ? issues.length : item.value === "updates" ? updates.length : item.value === "files" ? files.length : null;
                  return <TabsTrigger key={item.value} value={item.value} className={`${styles.tab} rams-page-header-tab`}>
                    <span className={styles.tabLabel}>{item.label}</span>
                    {count !== null && <span className={styles.count}><AnimatedCounter value={count} /></span>}
                    {view.section === item.value && <motion.span className={styles.indicator} layoutId={reduce ? undefined : "indicator"} layoutDependency={view.section} transition={motionTransition("selection", reduce)} aria-hidden="true" />}
                  </TabsTrigger>;
                })}
              </motion.div>
            </TabsList>
          </LayoutGroup>
        </header>

        <div ref={scroller} className={`${styles.scroller} rams-page-header-scroller`} onScroll={onScroll}>
          <AnimatePresence initial={false} mode="popLayout" custom={view.direction}>
            <TabsContent key={view.section} value={view.section} forceMount asChild>
              <MotionPresenceDiv className={styles.panel} tabIndex={-1} custom={view.direction} variants={reduce ? ({ enter: { opacity: 1, x: 0 }, center: { opacity: 1, x: 0, transition: { duration: motionTokens.reduced.duration } }, exit: { opacity: 0, x: 0, transition: { duration: motionTokens.reduced.duration } } }) : panelSlide} initial="enter" animate="center" exit="exit" transition={reduce ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : undefined}>
                {view.section === "overview" && <OverviewPanel done={done} open={issues.length} />}
                {view.section === "issues" && <IssuesPanel issues={issues} reduce={reduce} onComplete={completeIssue} onReset={resetIssues} register={(key, node) => { if (node) toggles.current.set(key, node); else toggles.current.delete(key); }} />}
                {view.section === "updates" && <UpdatesPanel updates={updates} reduce={reduce} />}
                {view.section === "files" && <FilesPanel />}
              </MotionPresenceDiv>
            </TabsContent>
          </AnimatePresence>
        </div>

        <div className={`${styles.toastLayer} rams-page-header-toast-layer`} aria-hidden="true">
          <AnimatePresence initial={false}>
            {notice && <MotionRegion key={notice.key} className={`${styles.toast} rams-page-header-toast`} data-tone={notice.tone} initial={reduce ? { opacity: 0 } : { opacity: 0, y: motionGeometry.noticeEntryTravelPx, filter: blur(motionTokens.blur.soft) }} animate={{ opacity: 1, y: 0, filter: blur(0) }} exit={reduce ? { opacity: 0, transition: ({ duration: motionTokens.reduced.duration }) } : { opacity: 0, y: motionGeometry.noticeExitTravelPx, filter: blur(motionTokens.blur.subtle), transition: quick }} transition={reduce ? { duration: motionTokens.reduced.duration } : { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] }, filter: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }}>
              {notice.tone === "success" ? <Check {...icon} /> : notice.tone === "error" ? <CircleAlert {...icon} /> : null}
              <span>{notice.text}</span>
            </MotionRegion>}
          </AnimatePresence>
        </div>
        <p className={styles.srOnly} role="status" aria-live="polite">{notice?.text}</p>
      </section>
    </Tabs>
  );
}

export default PageHeader;
