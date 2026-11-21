/**
 * A small visual that proves the number beside it. Every kind is optional; a stat without one is just the number.
 * - `trend`: a sparkline of a series, oldest first, such as twelve monthly totals.
 * - `uptime`: one bar per day as a percentage. Full days are full height; a day with downtime is visibly shorter.
 * - `distribution`: a histogram of equal width bins across `0..max`, with the bars below `marker` (the median) inked.
 * - `map`: a dotted world with a dot lit for each [longitude, latitude] point.
 */
export type StatVisual =
  | { kind: "trend"; values: number[] }
  | { kind: "uptime"; days: number[] }
  | { kind: "distribution"; bins: number[]; max: number; marker: number }
  | { kind: "map"; points: [number, number][] };

export interface Stat {
  /** The final number. The band counts up to it. */
  value: number;
  /** Text before the number, such as "$". */
  prefix?: string;
  /** Text after the number, such as "%", "ms", or "+". */
  suffix?: string;
  /** Digits after the decimal point. Defaults to 0. */
  decimals?: number;
  /** `compact` shortens large numbers to 2.3M or 12K. The unit renders like a suffix. Defaults to `standard`. */
  notation?: "standard" | "compact";
  label: string;
  /** One short supporting line under the number. */
  detail?: string;
  /** Additional context revealed in a reserved row on hover or focus; detail stays visible and stationary. */
  context?: string;
  /** A tiny chart that draws in after the number lands. */
  visual?: StatVisual;
}

/** Original fictional booklet worksheet; no production or service measurements. */
const trimOffsetSamples = [0.08,0.11,0.14,0.17,0.20,0.23,0.26,0.29,0.32,0.38];
const median = (trimOffsetSamples[4]! + trimOffsetSamples[5]!) / 2;
const bins = Array.from({length:10},()=>0);
for(const value of trimOffsetSamples){const i=Math.min(9,Math.floor(value/0.5*10));bins[i]=bins[i]!+1;}
export const stats: Stat[] = [
 {value:240,suffix:" copies",label:"Edition 08 print run",detail:"Sample worksheet quantity",context:"The six sample edition counts rise from 120 copies in Edition 03 to 240 in Edition 08.",visual:{kind:"trend",values:[120,144,168,192,216,240]}},
 {value:960,suffix:" sheets",label:"Paper sheets planned",detail:"240 copies × 4 imposed sheets",context:"A 16-page sample booklet uses four sheets per copy in this worksheet calculation."},
 {value:median,suffix:" mm",decimals:3,label:"Median trim offset",detail:"10 sample mark measurements",context:"Sample offsets range from 0.08 to 0.38 mm; this is descriptive, not a tolerance.",visual:{kind:"distribution",bins,max:0.5,marker:median}},
];
