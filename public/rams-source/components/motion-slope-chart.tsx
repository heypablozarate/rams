"use client";
import "./motion-fields.css";

import { useImperativeHandle, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type Ref } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useSpring } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import { motionTokens } from "./motion-tokens";
import { slopeChartGeometry } from "./slope-chart-geometry";
import styles from "./motion-slope-chart.module.css";

export interface SlopeItem {
  /** Stable identity. An item keeps its line across datasets, so switching morphs it. */
  key: string;
  /** Name beside the start value, in the tooltip, and in the table. */
  label: string;
  /** Value in the first period. */
  start: number;
  /** Value in the second period. */
  end: number;
}

/** Use a slope chart to show how several items changed between exactly two moments, and how their order changed. */
export interface SlopeChartProps {
  data: SlopeItem[];
  /** What is measured, such as "Conversion rate by channel". Names the chart for assistive technology. */
  label: string;
  /** Heading of the first column, such as "Q1". */
  startLabel: string;
  /** Heading of the second column, such as "Q2". */
  endLabel: string;
  formatValue?: (value: number) => string;
  /** Formats the change in the tooltip. Defaults to the difference in formatValue's terms. */
  formatChange?: (change: number, item: SlopeItem) => string;
  /** Plot height in pixels. Defaults to a token-based measure scaled for the number of items and text size. */
  height?: number;
  /** The item drawn in the accent, such as the one the story is about. */
  highlightKey?: string | null;
  /** Controlled item in focus. The others fade while one is in focus. */
  activeKey?: string | null;
  onActiveChange?: (key: string | null) => void;
  /** Rank movement beside each end value. */
  ranks?: boolean;
  emptyLabel?: string;
  ref?: Ref<HTMLElement>;
  className?: string;
}

type Row = { item: SlopeItem; y0: number; y1: number; l0: number; l1: number; rank0: number; rank1: number; order: number };

const { spring } = motionTokens;
const follow = { stiffness: motionTokens.keyframes.slopeChart.followStiffness, damping: motionTokens.keyframes.slopeChart.followDamping, restDelta: motionTokens.keyframes.slopeChart.followRestDelta };
const { labelBlockPx: LABEL_GAP, verticalInsetPx: PAD, headingBlockPx: HEAD } = slopeChartGeometry;
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

const subscribeNothing = () => () => {};
function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

/** Moves labels apart just enough to stop overlaps: touching labels form a group centred on where its members want to be. */
function spread(wanted: number[], gap: number, low: number, high: number): number[] {
  const order = wanted.map((y, index) => ({ y, index })).sort((a, b) => a.y - b.y);
  let groups = order.map(entry => ({ members: [entry], top: entry.y }));
  for (let changed = true; changed;) {
    changed = false;
    const next: typeof groups = [];
    for (const group of groups) {
      const prev = next[next.length - 1];
      if (prev && prev.top + prev.members.length * gap > group.top) {
        const members = [...prev.members, ...group.members];
        next[next.length - 1] = { members, top: members.reduce((sum, member, k) => sum + member.y - k * gap, 0) / members.length };
        changed = true;
      } else next.push(group);
    }
    groups = next.map(group => ({ ...group, top: clamp(group.top, low, Math.max(low, high - (group.members.length - 1) * gap)) }));
  }
  const out = new Array<number>(wanted.length);
  groups.forEach(group => group.members.forEach((member, k) => { out[member.index] = group.top + k * gap; }));
  return out;
}

/** Rank change arrow: up, down, or level. The number rolls in when it changes. */
function Rank({ move, reduced }: { move: number; reduced: boolean }) {
  const text = move === 0 ? "=" : `${Math.abs(move)}`;
  return <span className={styles.rank} data-move={move > 0 ? "up" : move < 0 ? "down" : "level"} aria-hidden="true">
    {move !== 0 && <svg width="var(--rams-detail-slope-rank-glyph-size)" height="var(--rams-detail-slope-rank-glyph-size)" viewBox="0 0 8 8"><path d={move > 0 ? "M4 7V1M1.5 3.5 4 1l2.5 2.5" : "M4 1v6M1.5 4.5 4 7l2.5-2.5"} fill="none" stroke="currentColor" strokeWidth="var(--rams-detail-slope-rank-glyph-stroke)" /></svg>}
    <span className={styles.rankSwap}>
      {reduced ? <span>{text}</span> : <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={text} initial={{ opacity: 0, y: move >= 0 ? motionTokens.keyframes.slopeChart.rankTravelPx : -motionTokens.keyframes.slopeChart.rankTravelPx }}
          animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: move >= 0 ? -motionTokens.keyframes.slopeChart.rankTravelPx : motionTokens.keyframes.slopeChart.rankTravelPx }}
          transition={spring.snappy}>{text}</motion.span>
      </AnimatePresence>}
    </span>
  </span>;
}

export function SlopeChart({ data, label, startLabel, endLabel, formatValue, formatChange, height, highlightKey = null, activeKey, onActiveChange, ranks = true, emptyLabel = "No data", ref, className }: SlopeChartProps) {
  const reduced = useReducedMotionSafe();
  const figure = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => figure.current as HTMLElement);
  const inView = useInView(figure, { once: true, amount: motionTokens.keyframes.slopeChart.inViewAmount });
  const empty = data.length === 0;
  const [typeScale, setTypeScale] = useState(1);
  useLayoutEffect(() => {
    const column = figure.current?.querySelector<HTMLElement>(`.${styles.column}`);
    if (!column) return;
    const measure = () => setTypeScale(Math.max(1, Number.parseFloat(getComputedStyle(column).fontSize) / slopeChartGeometry.typeReferencePx));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure); observer.observe(column);
    return () => observer.disconnect();
  });
  const plotHeight = height ?? Math.max(slopeChartGeometry.minPlotHeightPx, data.length * slopeChartGeometry.rowHeightPx) * typeScale;

  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const node = stage.current;
    if (!node) return;
    const container = figure.current?.parentElement;
    const read = () => setWidth(container?.clientWidth ?? node.clientWidth);
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(container ?? node);
    return () => observer.disconnect();
  }, []);
  const narrow = width < slopeChartGeometry.compactBreakpointPx;
  // Text gutters and the space between period headings are independent reserves.
  // A constrained figure scrolls locally instead of compressing one into the other.
  const leftRoom = slopeChartGeometry.startReservePx * typeScale, rightRoom = (ranks ? (narrow ? slopeChartGeometry.compactRankReservePx : slopeChartGeometry.rankReservePx) : slopeChartGeometry.endReservePx) * typeScale;
  const plotSpan = slopeChartGeometry.plotSpanPx * typeScale;
  const plotWidth = Math.max(width, leftRoom + plotSpan + rightRoom);
  const x0 = leftRoom, x1 = plotWidth - rightRoom;

  // One shared value axis for both columns, padded so dots never touch the edges.
  const values = data.flatMap(item => [item.start, item.end]);
  let lo = Math.min(...values), hi = Math.max(...values);
  if (!Number.isFinite(lo)) { lo = 0; hi = 1; }
  if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
  const labelReserve = Math.max(PAD, slopeChartGeometry.compactLabelGapPx * typeScale);
  const yOf = (value: number) => labelReserve + (1 - (value - lo) / (hi - lo)) * (plotHeight - labelReserve * 2);
  const rankOf = (field: "start" | "end") => { const sorted = [...data].sort((a, b) => b[field] - a[field]); return (item: SlopeItem) => sorted.indexOf(item) + 1; };
  const r0 = rankOf("start"), r1 = rankOf("end");
  const l0 = spread(data.map(item => yOf(item.start)), (narrow ? slopeChartGeometry.compactLabelGapPx : LABEL_GAP) * typeScale, labelReserve, plotHeight - labelReserve);
  const l1 = spread(data.map(item => yOf(item.end)), LABEL_GAP * typeScale, labelReserve, plotHeight - labelReserve);
  const rows: Row[] = data.map((item, i) => ({ item, y0: yOf(item.start), y1: yOf(item.end), l0: l0[i]!, l1: l1[i]!, rank0: r0(item), rank1: r1(item), order: 0 }));
  const byEnd = [...rows].sort((a, b) => a.rank1 - b.rank1);
  byEnd.forEach((row, k) => { row.order = k; });

  const [ownActive, setOwnActive] = useState<string | null>(null);
  const wanted = activeKey !== undefined ? activeKey : ownActive;
  const active = wanted && data.some(item => item.key === wanted) ? wanted : null;
  const setActive = (key: string | null) => { if (activeKey === undefined) setOwnActive(key); if (key !== active) onActiveChange?.(key); };

  // The tooltip glides to the middle of the line in focus and stays inside the chart.
  const tipX = useMotionValue(0), tipY = useMotionValue(0);
  const tipSpringX = useSpring(tipX, follow), tipSpringY = useSpring(tipY, follow);
  const wasShown = useRef(false);
  const activeRow = rows.find(row => row.item.key === active) ?? null;
  // The tooltip keeps the last item's content while it fades out, so it never collapses to an empty box mid-fade.
  const [shownKey, setShownKey] = useState<string | null>(null);
  if (active && active !== shownKey) setShownKey(active);
  const tipRow = activeRow ?? rows.find(row => row.item.key === shownKey) ?? null;
  const positionTooltip = (immediate = false) => {
    const bubble = tip.current;
    if (!activeRow || !bubble || !width) { wasShown.current = false; return; }
    const tw = bubble.offsetWidth, th = bubble.offsetHeight;
    const mid = (activeRow.y0 + activeRow.y1) / 2, cx = (x0 + x1) / 2;
    const above = mid - th - slopeChartGeometry.tooltipOffsetPx >= 0;
    const viewport = figure.current;
    const viewportLeft = viewport && stage.current ? viewport.getBoundingClientRect().left + viewport.clientLeft - stage.current.getBoundingClientRect().left : 0;
    const visibleWidth = viewport?.clientWidth ?? plotWidth;
    const left = viewportLeft + clamp(cx - tw / 2 - viewportLeft, 0, Math.max(0, visibleWidth - tw));
    const top = clamp(HEAD + (above ? mid - th - slopeChartGeometry.tooltipOffsetPx : mid + slopeChartGeometry.tooltipOffsetPx), 0, Math.max(0, plotHeight + HEAD - th));
    tipX.set(left); tipY.set(top);
    if (!wasShown.current || reduced || immediate) { tipSpringX.jump(left); tipSpringY.jump(top); }
    wasShown.current = true;
  };
  useLayoutEffect(() => { positionTooltip(); });

  // The line nearest the pointer, measured at the pointer's position along the plot.
  const nearest = (clientX: number, clientY: number) => {
    const rect = stage.current?.getBoundingClientRect();
    if (!rect || empty) return null;
    const x = clamp(clientX - rect.left, x0, x1), y = clientY - rect.top - HEAD;
    const t = (x - x0) / Math.max(1, x1 - x0);
    let best: Row | null = null, distance = Infinity;
    for (const row of rows) {
      const inLine = Math.abs(row.y0 + (row.y1 - row.y0) * t - y);
      const onLabel = clientX - rect.left < x0 ? Math.abs(row.l0 - y) : clientX - rect.left > x1 ? Math.abs(row.l1 - y) : Infinity;
      const d = Math.min(inLine, onLabel);
      if (d < distance) { distance = d; best = row; }
    }
    return distance <= slopeChartGeometry.pointerHitRadiusPx ? best?.item.key ?? null : null;
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => { if (event.pointerType === "mouse" || event.buttons) setActive(nearest(event.clientX, event.clientY)); };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (empty) return;
    if (event.shiftKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
      event.preventDefault();
      figure.current?.scrollBy({ left: event.key === "ArrowRight" ? slopeChartGeometry.keyboardScrollStepPx : -slopeChartGeometry.keyboardScrollStepPx, behavior: "instant" });
      return;
    }
    if (event.key === "Escape" && active) { event.preventDefault(); setActive(null); return; }
    const at = activeRow ? activeRow.order : -1;
    const moves: Record<string, number> = { ArrowDown: at + 1, ArrowRight: at + 1, ArrowUp: at < 0 ? 0 : at - 1, ArrowLeft: at < 0 ? 0 : at - 1, Home: 0, End: byEnd.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    setActive(byEnd[clamp(moves[event.key]!, 0, byEnd.length - 1)]!.item.key);
  };

  const format = (value: number) => formatValue ? formatValue(value) : grouped.format(value);
  const change = (item: SlopeItem) => formatChange ? formatChange(item.end - item.start, item) : `${item.end >= item.start ? "+" : "−"}${format(Math.abs(item.end - item.start))}`;
  const rankText = (row: Row) => row.rank0 === row.rank1 ? "same rank" : row.rank1 < row.rank0 ? `up ${row.rank0 - row.rank1} to rank ${row.rank1}` : `down ${row.rank1 - row.rank0} to rank ${row.rank1}`;
  const announce = activeRow ? `${activeRow.item.label}, ${startLabel} ${format(activeRow.item.start)}, ${endLabel} ${format(activeRow.item.end)}, ${change(activeRow.item)}, ${rankText(activeRow)}` : "";
  const summary = empty ? `${label}. ${emptyLabel}.` : `${label}, ${startLabel} to ${endLabel}. ${byEnd.map(row => `${row.item.label} ${format(row.item.start)} to ${format(row.item.end)}`).join(", ")}.`;
  const settle = reduced ? { duration: motionTokens.reduced.duration } : spring.morph;
  const drawn = inView || reduced;

  return <figure ref={figure} className={[styles.figure, className].filter(Boolean).join(" ")} style={{ width: width || undefined }} data-scroll={plotWidth > width || undefined} aria-label={label} onScroll={() => positionTooltip(true)}>
    <div ref={stage} className={styles.stage} style={{ width: plotWidth || undefined }} data-narrow={narrow || undefined} data-active={active ? true : undefined} data-scroll={plotWidth > width || undefined}
      role="group" tabIndex={empty ? -1 : 0} aria-roledescription="slope chart" aria-label={`${label}. Use up and down arrows to move between items in ${endLabel} order.${plotWidth > width ? " Hold Shift and use left and right arrows to scroll the chart." : ""}`}
      onPointerMove={onPointerMove} onPointerDown={event => { if (event.pointerType !== "mouse") { event.currentTarget.setPointerCapture?.(event.pointerId); setActive(nearest(event.clientX, event.clientY)); } }}
      onPointerUp={event => { if (event.pointerType !== "mouse") setActive(null); }} onPointerCancel={() => setActive(null)} onPointerLeave={event => { if (event.pointerType === "mouse") setActive(null); }}
      onKeyDown={onKeyDown} onBlur={() => setActive(null)} onFocus={event => { if (event.currentTarget.matches(":focus-visible") && !empty && !active) setActive(byEnd[0]!.item.key); }}>
      {width > 0 && <>
        <div className={styles.columns} aria-hidden="true">
          <span className={styles.column} style={{ right: plotWidth - x0 + slopeChartGeometry.endpointLabelGapPx }}>{startLabel}</span>
          <span className={styles.column} style={{ left: x1 + slopeChartGeometry.endpointLabelGapPx }}>{endLabel}</span>
        </div>
        <div className={styles.plot} style={{ height: plotHeight }}>
          <svg className={styles.svg} width={plotWidth} height={plotHeight} aria-hidden="true" focusable="false">
            <line className={styles.axis} x1={x0} x2={x0} y1={0} y2={plotHeight} />
            <line className={styles.axis} x1={x1} x2={x1} y1={0} y2={plotHeight} />
            {rows.map((row, i) => {
              const key = row.item.key, on = active === key, accent = highlightKey === key;
              const delay = reduced ? motionTokens.reduced.stagger : Math.min(i * motionTokens.stagger.item, motionTokens.sequence.maxStagger);
              return <g key={key} className={styles.item} data-on={on || undefined} data-accent={accent || undefined} data-dim={(active !== null && !on) || undefined}>
                <motion.path className={styles.leader} initial={false} animate={{ d: `M${x0 - slopeChartGeometry.leaderOuterOffsetPx},${row.l0}L${x0 - slopeChartGeometry.leaderInnerOffsetPx},${row.y0}` }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : settle} />
                <motion.path className={styles.leader} initial={false} animate={{ d: `M${x1 + slopeChartGeometry.leaderOuterOffsetPx},${row.l1}L${x1 + slopeChartGeometry.leaderInnerOffsetPx},${row.y1}` }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : settle} />
                <motion.line className={styles.line} x1={x0} x2={x1} initial={reduced ? false : { y1: row.y0, y2: row.y1, pathLength: 0 }} animate={{ y1: row.y0, y2: row.y1, pathLength: drawn ? 1 : 0 }}
                  transition={{ y1: settle, y2: settle, pathLength: reduced ? { duration: motionTokens.reduced.duration } : { duration: motionTokens.duration.data, ease: motionTokens.ease.inOut, delay: Math.min(motionTokens.sequence.handoff + delay, motionTokens.sequence.maxStagger) } }} />
                <motion.circle className={styles.dot} cx={x0} r={slopeChartGeometry.dotRadiusPx} initial={reduced ? false : { cy: row.y0, scale: 0 }} animate={{ cy: row.y0, scale: drawn ? 1 : 0 }} transition={{ cy: settle, scale: reduced ? { duration: motionTokens.reduced.duration } : { ...spring.snappy, delay } }} />
                <motion.circle className={styles.dot} cx={x1} r={slopeChartGeometry.dotRadiusPx} initial={reduced ? false : { cy: row.y1, scale: 0 }} animate={{ cy: row.y1, scale: drawn ? 1 : 0 }} transition={{ cy: settle, scale: reduced ? { duration: motionTokens.reduced.duration } : { ...spring.snappy, delay: Math.min(motionTokens.sequence.settle + delay, motionTokens.sequence.maxStagger) } }} />
              </g>;
            })}
          </svg>
          {rows.map((row, i) => {
            const key = row.item.key, on = active === key, accent = highlightKey === key;
            const delay = reduced ? motionTokens.reduced.stagger : Math.min(i * motionTokens.stagger.item, motionTokens.sequence.maxStagger);
            return <div key={key} className={styles.labels} data-on={on || undefined} data-accent={accent || undefined} data-dim={(active !== null && !on) || undefined} aria-hidden="true">
              <motion.span className={styles.start} style={{ right: plotWidth - x0 + slopeChartGeometry.endpointLabelGapPx, maxWidth: x0 - slopeChartGeometry.endpointLabelGapPx }} initial={reduced ? false : { y: row.l0, opacity: 0 }} animate={{ y: row.l0, opacity: drawn ? 1 : 0 }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : { y: settle, opacity: { duration: motionTokens.duration.standard, delay } }}>
                <span className={styles.name}>{row.item.label}</span>
                <span className={styles.value}>{format(row.item.start)}</span>
              </motion.span>
              <motion.span className={styles.end} style={{ left: x1 + slopeChartGeometry.endpointLabelGapPx }} initial={reduced ? false : { y: row.l1, opacity: 0 }} animate={{ y: row.l1, opacity: drawn ? 1 : 0 }} transition={reduced ? { duration: motionTokens.reduced.duration, delay: motionTokens.reduced.stagger } : { y: settle, opacity: { duration: motionTokens.duration.standard, delay: Math.min(motionTokens.sequence.settle + delay, motionTokens.sequence.maxStagger) } }}>
                <span className={styles.value}>{format(row.item.end)}</span>
                {ranks && <Rank move={row.rank0 - row.rank1} reduced={reduced} />}
              </motion.span>
            </div>;
          })}
        </div>
      </>}
      <motion.div ref={tip} className={styles.tooltip} style={{ x: reduced ? tipX : tipSpringX, y: reduced ? tipY : tipSpringY }} aria-hidden="true">
        <p className={styles.tipTitle}>{tipRow?.item.label ?? ""}</p>
        <p className={styles.tipRow}><span className={styles.tipName}>{startLabel}</span><span className={styles.tipValue}>{tipRow ? format(tipRow.item.start) : ""}</span></p>
        <p className={styles.tipRow}><span className={styles.tipName}>{endLabel}</span><span className={styles.tipValue}>{tipRow ? format(tipRow.item.end) : ""}</span></p>
        <p className={styles.tipMeta}>{tipRow && <><span data-rams-numeric>{change(tipRow.item)}</span>, {rankText(tipRow)}</>}</p>
      </motion.div>
      {empty && <p className={styles.message}>{emptyLabel}</p>}
    </div>
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announce}</p>
    <p className={styles.srOnly}>{summary}</p>
    {!empty && <div className={styles.srOnly}><table>
      <caption>{label}</caption>
      <thead><tr><th scope="col">Item</th><th scope="col">{startLabel}</th><th scope="col">{endLabel}</th><th scope="col">Change</th><th scope="col">Rank</th></tr></thead>
      <tbody>{byEnd.map(row => <tr key={row.item.key}><th scope="row">{row.item.label}</th><td>{format(row.item.start)}</td><td>{format(row.item.end)}</td><td>{change(row.item)}</td><td>{row.rank0} to {row.rank1}</td></tr>)}</tbody>
    </table></div>}
  </figure>;
}

export default SlopeChart;
