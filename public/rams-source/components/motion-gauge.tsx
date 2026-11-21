"use client";
import "./motion-fields.css";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useMotionValueEvent, useTransform, type Variants } from "motion/react";
import { useReducedMotion } from "./use-motion-preference";
import { MotionSwap } from "./motion-swap";
import { motionTokens } from "./motion-tokens";
import { gaugeGeometry } from "./gauge-geometry";
import styles from "./motion-gauge.module.css";

type GaugeTone = "accent" | "success" | "warning" | "danger";
/** A band that starts at `from`: the highest band the value reaches sets the tone and names the state, so it never rests on color alone. */
export interface GaugeThreshold { from: number; tone: GaugeTone; label: string; }
export interface GaugeProps { value: number; min?: number; max?: number; label: string; detail?: string; tone?: GaugeTone; thresholds?: GaugeThreshold[]; /** Format the actual measured value instead of its percentage of the reference range. */ formatValue?: (value: number) => string; }

/** Copy enters from the side the value moved toward: a rise comes up from below, a fall drops from above. */
const rise: Variants = { hidden: (direction: number) => ({ opacity: 0, y: `${motionTokens.keyframes.gauge.labelTravelEm * direction}em`, filter: `blur(${motionTokens.blur.soft}px)` }), shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } }, gone: (direction: number) => ({ opacity: 0, y: `${-motionTokens.keyframes.gauge.labelTravelEm * direction}em`, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } }) };
/** The first fill is slower and never overshoots, like a ring closing when the view opens. */
const reveal = { ...motionTokens.spring.smooth, visualDuration: motionTokens.duration.data };

/** New copy rises in while the old copy leaves, popped out of flow so the line never holds both. */
function Swap({ text, direction = 1 }: { text: string; direction?: number }) {
  return <span className={styles.swap}><AnimatePresence mode="popLayout" initial={false} custom={direction}><MotionSwap key={text} className={styles.text} custom={direction} variants={rise} initial="hidden" animate="shown" exit="gone">{text}</MotionSwap></AnimatePresence></span>;
}

/** A 270 degree ring open at the bottom, drawn clockwise from its lower left end. Redrawn from the sweep every frame so the round cap stays exact. */
const radius = gaugeGeometry.radiusUnits, span = gaugeGeometry.sweepDeg, start = -span / 2;
function arcFor(sweep: number) {
  const end = start + span * Math.min(1, Math.max(0, sweep));
  const at = (angle: number) => `${(50 + radius * Math.sin((angle * Math.PI) / 180)).toFixed(3)} ${(50 - radius * Math.cos((angle * Math.PI) / 180)).toFixed(3)}`;
  return `M ${at(start)} A ${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${at(end)}`;
}
const track = arcFor(1);

export function Gauge({ value, min = 0, max = 100, label, detail, tone = "accent", thresholds, formatValue }: GaugeProps) {
  const safeMax = max > min ? max : min + 1;
  const percentage = Math.min(1, Math.max(0, (value - min) / (safeMax - min)));
  const displayValue = Math.round(percentage * 100);
  const displayedAmount = formatValue ? formatValue(Math.min(safeMax, Math.max(min, value))) : String(displayValue);
  const bands = [...thresholds ?? []].sort((a, b) => a.from - b.from);
  const bandAt = (at: number) => bands.filter(threshold => at >= threshold.from - 1e-6).pop();
  const band = bandAt(value);
  const ref = useRef<HTMLElement>(null);
  const sizer = useRef<HTMLSpanElement>(null);
  const statusSizer = useRef<HTMLSpanElement>(null);
  const unitRef = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const [readoutOutside, setReadoutOutside] = useState(false);
  const inView = useInView(ref, { once: true, amount: motionTokens.keyframes.gauge.drawViewportShare });
  const reduceMotion = !!useReducedMotion();
  const sweep = useMotionValue(0);
  const count = useMotionValue(0);
  const digitsWidth = useMotionValue<number | "auto">("auto");
  const [filled, setFilled] = useState(false);
  const [live, setLive] = useState(band);
  const path = useTransform(sweep, arcFor);
  // The cap fades in over the first sliver instead of popping in as a dot.
  const arcOpacity = useTransform(sweep, current => Math.min(1, Math.max(0, current / motionTokens.keyframes.gauge.capFadeSweepShare)));
  const digits = useTransform(count, current => formatValue ? formatValue(min + Math.min(1, Math.max(0, current / 100)) * (safeMax - min)) : String(Math.round(Math.min(100, Math.max(0, current)))));
  const [moved, setMoved] = useState({ value: displayValue, direction: 1 });
  if (moved.value !== displayValue) setMoved({ value: displayValue, direction: displayValue < moved.value ? -1 : 1 });

  // The ring fills once it is seen, then springs to each new value with a little life; the count follows without overshooting.
  useEffect(() => {
    // Reduced motion lands on the value at once; the state appears a frame later, after hydration has matched the server.
    if (reduceMotion) { sweep.jump(percentage); count.jump(percentage * 100); const frame = requestAnimationFrame(() => setFilled(true)); return () => cancelAnimationFrame(frame); }
    if (!inView) return;
    const arc = animate(sweep, percentage, filled ? motionTokens.spring.morph : reveal);
    const number = animate(count, percentage * 100, { ...(filled ? motionTokens.spring.smooth : reveal), onComplete: () => setFilled(true) });
    return () => { arc.stop(); number.stop(); };
  }, [count, filled, inView, percentage, reduceMotion, sweep]);

  // The state arrives as the first fill lands. After that it follows the number on screen, so the color and label change exactly as the count crosses a threshold.
  useMotionValueEvent(count, "change", current => {
    const next = bandAt(min + (current / 100) * (safeMax - min));
    const changed = next?.from !== live?.from || next?.label !== live?.label;
    if (filled) { if (changed) setLive(next); }
    else if (inView && Math.abs(current - percentage * 100) < 1) { if (changed) setLive(next); setFilled(true); }
  });
  const shown = reduceMotion || !filled ? band : live;
  const activeTone = shown?.tone ?? tone;

  // Digits are right aligned in a box sized to the target number, so the ones column never jumps while counting and the group recentres on a spring.
  useEffect(() => {
    const node = sizer.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let measured: string | null = null;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = entry.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth;
      if (measured !== null && measured !== node.textContent && !reduceMotion) animate(digitsWidth, next, motionTokens.spring.smooth);
      else digitsWidth.jump(next);
      measured = node.textContent;
    });
    observer.observe(node);
    return () => { observer.disconnect(); digitsWidth.stop(); };
  }, [digitsWidth, reduceMotion]);

  // Compare stable target text and ring geometry, not the animated width or
  // the layout container, so moving the readout cannot cause a resize loop.
  useLayoutEffect(() => {
    const svg = svgRef.current, number = sizer.current, readout = readoutRef.current;
    if (!svg || !number || !readout) return;
    const update = () => {
      const ring = svg.getBoundingClientRect().width;
      const stroke = parseFloat(getComputedStyle(svg.querySelector('path')!).strokeWidth);
      const innerRadius = ring * Math.max(0, radius - stroke / 2) / 100;
      const n = number.getBoundingClientRect(), unit = unitRef.current?.getBoundingClientRect();
      const status = statusSizer.current?.getBoundingClientRect();
      const gap = parseFloat(getComputedStyle(readout).rowGap) || 0;
      const unitGap = unitRef.current ? parseFloat(getComputedStyle(unitRef.current).marginInlineStart) || 0 : 0;
      const textWidth = Math.max(n.width + (unit?.width ?? 0) + unitGap, status?.width ?? 0);
      const textHeight = Math.max(n.height, unit?.height ?? 0) + (status ? gap + status.height : 0);
      const halfHeight = textHeight / 2;
      const opening = 2 * Math.sqrt(Math.max(0, innerRadius ** 2 - halfHeight ** 2));
      setReadoutOutside(textWidth > opening);
    };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    [svg, number, unitRef.current, statusSizer.current].forEach(node => { if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, [displayedAmount, shown?.label, thresholds, formatValue]);

  return <figure ref={ref} className={[styles.figure, styles[activeTone]].join(" ")} aria-label={`${label}: ${value} of ${safeMax}${band ? `, ${band.label}` : ""}`}>
    <div className={styles.visual} data-readout-overflow={readoutOutside || undefined} role="meter" aria-label={label} aria-valuemin={min} aria-valuemax={safeMax} aria-valuenow={Math.min(safeMax, Math.max(min, value))} aria-valuetext={`${formatValue ? displayedAmount : `${displayValue}%`}${band ? `, ${band.label}` : ""}`}>
      <svg ref={svgRef} viewBox="0 0 100 90" aria-hidden="true" focusable="false"><path className={styles.track} d={track} /><motion.path className={styles.arc} d={path} style={{ opacity: arcOpacity }} /></svg>
      <div ref={readoutRef} className={styles.readout} aria-hidden="true">
        <span className={styles.number}><motion.span className={styles.digits} style={{ width: digitsWidth }}>{digits}</motion.span>{!formatValue && <span ref={unitRef} className={styles.unit}>%</span>}<span ref={sizer} className={styles.sizer}>{displayedAmount}</span></span>
        {thresholds && <span className={styles.status}><Swap text={filled ? shown?.label ?? "" : ""} direction={moved.direction} /><span ref={statusSizer} className={styles.sizer}>{shown?.label ?? ""}</span></span>}
      </div>
    </div>
    <figcaption><strong><Swap text={label} /></strong>{detail && <span className={styles.detail}><Swap text={detail} direction={moved.direction} /></span>}</figcaption>
  </figure>;
}

export default Gauge;
