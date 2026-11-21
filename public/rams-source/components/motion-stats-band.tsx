"use client";
import "./motion-fields.css";

import { forwardRef, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import { animate, useInView } from "motion/react";
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from "./select";
import { motionTokens } from "./motion-tokens";
import { stats as exampleStats, type Stat, type StatVisual } from "./motion-stats-band-data";
import { WORLD, worldLand } from "./motion-stats-band-world";
import { statsBandGeometry } from "./stats-band-geometry";
import styles from "./motion-stats-band.module.css";

export type { Stat, StatVisual } from "./motion-stats-band-data";
export type StatsBandLayout = "plain" | "divided";

export interface StatsBandProps {
  /** Three or four stats read best. */
  stats?: Stat[];
  /** `plain` lets the stats float on whitespace; `divided` sets them in a hairline grid ruled above and below. */
  layout?: StatsBandLayout;
  title?: string;
  description?: string;
  /** Seconds each number takes to count up. Defaults to the shared data duration. */
  duration?: number;
  /** Number formatting locale. Fixed by default so server and client agree. */
  locale?: string;
  className?: string;
}

type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;
const STAGGER = motionTokens.stagger.item;

const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (onChange: () => void) => {
  const query = window.matchMedia(REDUCE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
/** Reduced motion, read after hydration so the server and first client render agree. CSS covers the first paint. */
function useReducedMotionSafe() {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCE).matches, () => false);
}

/**
 * Formats a stat's number, split from its compact unit so the unit can sit beside the digits like a suffix. A compact
 * stat counts inside its final unit (0.0M to 2.3M) instead of jumping from K to M halfway through.
 */
function useFormat(stat: Stat, locale: string) {
  return useMemo(() => {
    const decimals = stat.decimals ?? 0;
    const digits = new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals, numberingSystem: "latn" });
    if (stat.notation !== "compact") return { signBefore: "", compactPrefix: "", unit: "", exact: digits.format(stat.value), format: (value: number) => digits.format(value) };
    // Ask Intl for the final value's locale-specific unit and coefficient at high precision.
    // Holding this scale fixed keeps the unit stable throughout the count-up.
    const compactFormatter = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 20, numberingSystem: "latn" });
    const targetFormatter = new Intl.NumberFormat(locale, { notation: "compact", minimumFractionDigits: decimals, maximumFractionDigits: decimals, numberingSystem: "latn" });
    const magnitude = Math.abs(stat.value);
    const parts = targetFormatter.formatToParts(magnitude);
    const compactDigits = new Intl.NumberFormat(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals, numberingSystem: "latn", useGrouping: targetFormatter.resolvedOptions().useGrouping });
    const first = parts.findIndex(part => part.type === "integer");
    const last = parts.findLastIndex(part => part.type === "integer" || part.type === "fraction");
    const unitOf = (items: Intl.NumberFormatPart[]) => items.filter(part => part.type === "compact").map(part => part.value).join("");
    const coefficientOf = (items: Intl.NumberFormatPart[]) => {
      const integer = items.filter(part => part.type === "integer").map(part => part.value).join("");
      const fraction = items.find(part => part.type === "fraction")?.value;
      return Number(integer + (fraction ? `.${fraction}` : ""));
    };
    const compact = parts.some(part => part.type === "compact");
    const precise = compactFormatter.formatToParts(magnitude);
    const coefficient = coefficientOf(precise);
    let scale = compact && Number.isFinite(coefficient) && coefficient > 0 ? magnitude / coefficient : 1;
    // Rounding can promote the target into the next compact unit (999.9K → 1M).
    // Probe powers near the magnitude to recover that unit's actual divisor.
    if (compact && unitOf(precise) !== unitOf(parts) && magnitude > 0 && Number.isFinite(magnitude)) {
      const exponent = Math.floor(Math.log10(magnitude));
      for (let power = Math.max(0, exponent - 15); power <= Math.min(308, exponent + 1); power++) {
        const reference = 10 ** power;
        const candidate = compactFormatter.formatToParts(reference);
        const divisor = coefficientOf(candidate);
        if (unitOf(candidate) === unitOf(parts) && Number.isFinite(divisor) && divisor > 0) {
          scale = reference / divisor;
          break;
        }
      }
    }
    const compactPrefix = compact && first >= 0 ? parts.slice(0, first).map(part => part.value).join("") : "";
    const unit = compact && last >= 0 ? parts.slice(last + 1).map(part => part.value).join("") : "";
    const negativeParts = compact && stat.value < 0 ? targetFormatter.formatToParts(stat.value) : [];
    const compactIndex = negativeParts.findIndex(part => part.type === "compact");
    const numberIndex = negativeParts.findIndex(part => part.type === "integer");
    const minusIndex = negativeParts.findIndex(part => part.type === "minusSign");
    // A few locales place the unit before the number and the sign before that unit.
    const signBefore = minusIndex >= 0 && minusIndex < compactIndex && compactIndex < numberIndex
      ? negativeParts.slice(0, compactIndex).map(part => part.value).join("") : "";
    return { signBefore, compactPrefix, unit, exact: targetFormatter.format(stat.value), format: (value: number) => compactDigits.format((signBefore ? Math.abs(value) : value) / scale) };
  }, [stat.decimals, stat.notation, stat.value, locale]);
}

/**
 * One number that counts from zero to its value the first time the band is in view. The final value reserves the
 * width underneath, so the layout never moves while digits change. Screen readers only get the final value.
 */
function CountUp({ stat, run, delay, duration, reduced, locale }: { stat: Stat; run: boolean; delay: number; duration: number; reduced: boolean; locale: string }) {
  const live = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  const { signBefore, compactPrefix, unit, exact, format } = useFormat(stat, locale);
  const final = format(stat.value);
  const suffix = `${unit}${stat.suffix ?? ""}`;

  useLayoutEffect(() => {
    if (reduced || done.current || !live.current) return;
    live.current.textContent = format(0);
  }, [format, reduced]);

  useEffect(() => {
    const node = live.current;
    if (!node) return;
    if (reduced) { node.textContent = final; done.current = true; return; }
    if (!run || done.current) return;
    const controls = animate(0, stat.value, {
      duration,
      delay,
      ease: enter,
      onUpdate: latest => { node.textContent = format(latest); },
      onComplete: () => { node.textContent = final; done.current = true; },
    });
    return () => controls.stop();
  }, [run, reduced, stat.value, delay, duration, format, final]);

  return <>
    <span className={styles.srOnly}>{stat.prefix}{exact}{stat.suffix}</span>
    <span className={styles.number} aria-hidden="true">
      {stat.prefix && <span className={styles.prefix}>{stat.prefix}</span>}
      {signBefore && <span>{signBefore}</span>}
      {compactPrefix && <span className={styles.prefix}>{compactPrefix}</span>}
      <span className={styles.digits}>
        <span className={styles.sizer}>{final}</span>
        <span ref={live} className={styles.live}>{final}</span>
      </span>
      {suffix && <span className={styles.suffix}>{suffix}</span>}
    </span>
  </>;
}

/* Visuals. Each one is drawn at rest; CSS hides it until the band is in view, then draws it in. */

const trendViewHeight = 40;

function Trend({ values }: { values: number[] }) {
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const inset = trendViewHeight * statsBandGeometry.trendBlockInsetRatio;
  const baseline = trendViewHeight - inset;
  const plotHeight = trendViewHeight - 2 * inset;
  const points = values.map((value, index) => [
    values.length > 1 ? index / (values.length - 1) * 100 : 100,
    baseline - (value - min) / span * plotHeight,
  ] as const);
  const line = points.map(([x, y], index) => `${index ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const [endX, endY] = points[points.length - 1]!;
  return <div className={styles.trend}>
    <svg className={styles.draw} viewBox={`0 0 100 ${trendViewHeight}`} preserveAspectRatio="none">
      <path className={styles.area} d={`${line} L100 ${trendViewHeight} L0 ${trendViewHeight} Z`} />
      <path className={styles.line} d={line} vectorEffect="non-scaling-stroke" />
    </svg>
    <span className={styles.endDot} style={{ left: `${endX}%`, top: `${endY / trendViewHeight * 100}%` }} />
  </div>;
}

function Uptime({ days }: { days: number[] }) {
  return <div className={styles.bars} data-dense="">
    {days.map((uptime, index) => <span key={index} className={styles.bar} data-ink={uptime < 100 ? "" : undefined}
      style={{ "--rams-detail-j": index / days.length, "--rams-detail-uptime-loss": 100 - uptime } as CSSProperties} />)}
  </div>;
}

function Distribution({ bins, max, marker }: { bins: number[]; max: number; marker: number }) {
  const peak = Math.max(...bins) || 1;
  const width = max / bins.length;
  return <div className={styles.bars}>
    {bins.map((count, index) => <span key={index} className={styles.bar} data-ink={index * width < marker ? "" : undefined}
      style={{ "--rams-detail-j": index / bins.length, "--rams-detail-bin-share": count / peak } as CSSProperties} />)}
  </div>;
}

const cellOf = (lon: number, lat: number) => {
  const x = Math.floor((((lon - WORLD.west) % 360 + 360) % 360) / (WORLD.east - WORLD.west) * WORLD.columns);
  const y = Math.floor((WORLD.north - lat) / (WORLD.north - WORLD.south) * WORLD.rows);
  return [Math.min(WORLD.columns - 1, Math.max(0, x)), Math.min(WORLD.rows - 1, Math.max(0, y))] as const;
};

/** Snaps a point to the nearest land dot, so a coastal city never lights a dot in the sea. */
function nearestLand(lon: number, lat: number) {
  const [x, y] = cellOf(lon, lat);
  let best = y * WORLD.columns + x, distance = Infinity;
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    const cx = x + dx, cy = y + dy;
    if (cx < 0 || cy < 0 || cx >= WORLD.columns || cy >= WORLD.rows || !worldLand[cy * WORLD.columns + cx]) continue;
    const d = dx * dx + dy * dy;
    if (d < distance) { distance = d; best = cy * WORLD.columns + cx; }
  }
  return best;
}

function WorldMap({ points }: { points: [number, number][] }) {
  const lit = useMemo(() => new Set(points.map(([lon, lat]) => nearestLand(lon, lat))), [points]);
  return <div className={styles.map}>
    <svg className={styles.draw} viewBox={`0 0 ${WORLD.columns} ${WORLD.rows}`}>
      {worldLand.map((land, index) => land && !lit.has(index) && <circle key={index} className={styles.land} cx={index % WORLD.columns + .5} cy={Math.floor(index / WORLD.columns) + .5} r="var(--rams-detail-stats-band-map-land-radius)" />)}
      {[...lit].map(index => <circle key={index} className={styles.lit} cx={index % WORLD.columns + .5} cy={Math.floor(index / WORLD.columns) + .5} r="var(--rams-detail-stats-band-map-location-radius)" />)}
    </svg>
  </div>;
}

function Visual({ visual }: { visual: StatVisual }) {
  switch (visual.kind) {
    case "trend": return <Trend values={visual.values} />;
    case "uptime": return <Uptime days={visual.days} />;
    case "distribution": return <Distribution bins={visual.bins} max={visual.max} marker={visual.marker} />;
    case "map": return <WorldMap points={visual.points} />;
  }
}

/**
 * A band of three or four headline numbers, each with an optional tiny visual that proves it: a trend, an uptime strip,
 * a latency histogram, or a dotted world. The numbers count up in a staggered sequence the first time the band is in
 * view, then the visuals draw in. Hovering or focusing a stat reveals a separate, reserved context line and gives
 * its visual the accent without replacing or moving the detail. Numbers reserve their final width; screen readers get final values.
 */
export const StatsBand = forwardRef<HTMLElement, StatsBandProps>(function StatsBand({
  stats = exampleStats,
  layout = "plain",
  title,
  description,
  duration = motionTokens.duration.data,
  locale = "en-US",
  className,
}, ref) {
  const id = useId();
  const list = useRef<HTMLDListElement>(null);
  // A stacked band can exceed the viewport at enlarged text sizes; a fractional
  // threshold for the whole list could otherwise keep every figure invisible.
  const inView = useInView(list, { once: true, amount: "some" });
  const reduced = useReducedMotionSafe();
  const withVisuals = stats.some(stat => stat.visual);
  const columns = Math.min(stats.length, statsBandGeometry.maxColumns);
  return <section ref={ref} className={["rams-stats-band", styles.band, className].filter(Boolean).join(" ")} data-layout={layout} data-in-view={inView || reduced ? "" : undefined}
    aria-labelledby={title ? `${id}-title` : undefined} aria-label={title ? undefined : "Key numbers"}>
    <div className={styles.inner}>
      {(title || description) && <header className={styles.header}>
        {title && <h2 id={`${id}-title`} className={styles.title}>{title}</h2>}
        {description && <p className={styles.description}>{description}</p>}
      </header>}
      <dl ref={list} className={styles.stats} data-count={columns} data-visuals={withVisuals ? "" : undefined}
        style={{ "--rams-detail-count": columns, "--rams-detail-draw": `${Math.round(duration * 1000)}ms` } as CSSProperties}>
        {stats.map((stat, index) => <div key={`${stat.label}-${index}`} className={styles.stat} style={{ "--rams-detail-i": index } as CSSProperties}
          tabIndex={stat.context ? 0 : undefined} data-context={stat.context && stat.detail ? "" : undefined}>
          <dt className={styles.label}>{stat.label}</dt>
          <dd className={styles.figure}>
            <CountUp stat={stat} run={inView} delay={Math.min(index * STAGGER, motionTokens.sequence.maxStagger)} duration={duration} reduced={reduced} locale={locale} />
          </dd>
          {(stat.detail || stat.context) && <dd className={styles.caption}>
            {stat.detail && <span className={styles.detail}>{stat.detail}</span>}
            {stat.context && <span className={styles.context}>{stat.context}</span>}
          </dd>}
          {withVisuals && <dd className={styles.visual} aria-hidden="true">{stat.visual && <Visual visual={stat.visual} />}</dd>}
        </div>)}
      </dl>
    </div>
  </section>;
});

StatsBand.displayName = "StatsBand";

const layoutOptions = [{ value: "divided", label: "Divided" }, { value: "plain", label: "Plain" }];

/** Preview: the band in either layout. Switching layouts plays the sequence again. */
export function StatsBandBlock() {
  const [layout, setLayout] = useState<StatsBandLayout>("divided");
  return <div className={styles.preview}>
    <Select value={layout} onValueChange={next => setLayout(next as StatsBandLayout)}><SelectTrigger aria-label="Stats layout"><SelectValue/></SelectTrigger><SelectContent>{layoutOptions.map(option=><SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>
    <div className={styles.frame}>
      <StatsBand key={layout} layout={layout} title="Sample booklet worksheet" description="Three finite figures from an original Córdoba print worksheet." />
    </div>
  </div>;
}

export default StatsBandBlock;
