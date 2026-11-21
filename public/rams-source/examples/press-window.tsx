"use client";
import { useId, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import type { DateRange } from "react-day-picker";
import { Button } from "../components/button";
import { Calendar } from "../components/calendar";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "../components/chart";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "../components/empty";
import { pressWindowGeometry } from "../components/press-window-geometry";
import "./press-window.css";
const records = [
  { key: "2026-11-02", week: "Nov 2", folded: 24, flat: 17 },
  { key: "2026-11-09", week: "Nov 9", folded: 31, flat: 23 },
  { key: "2026-11-16", week: "Nov 16", folded: 28, flat: 19 },
  { key: "2026-11-23", week: "Nov 23", folded: 36, flat: 25 },
  { key: "2026-11-30", week: "Nov 30", folded: 33, flat: 22 },
  { key: "2026-12-07", week: "Dec 7", folded: 41, flat: 29 },
];
function date(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function Solid() {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true">
      <path d="M1 8h22" stroke="currentColor" strokeWidth={pressWindowGeometry.seriesStroke} />
    </svg>
  );
}
function Dashed() {
  return (
    <svg viewBox="0 0 24 16" aria-hidden="true">
      <path
        d="M1 8h22"
        stroke="currentColor"
        strokeWidth={pressWindowGeometry.seriesStroke}
        strokeDasharray={pressWindowGeometry.legendDash.join(" ")}
      />
    </svg>
  );
}
const config = {
  folded: { label: "Folded sheets", icon: Solid },
  flat: { label: "Flat sheets", icon: Dashed },
} satisfies ChartConfig;
const dateLabel = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
export function PressWindow() {
  const id = useId(),
    [legendNode, setLegendNode] = useState<HTMLDivElement | null>(null),
    [range, setRange] = useState<DateRange | undefined>({
      from: date(records[0].key),
      to: date(records.at(-1)!.key),
    });
  const from = range?.from?.getTime() ?? -Infinity,
    to = range?.to?.getTime() ?? Infinity,
    rows = records.filter(
      (row) => date(row.key).getTime() >= from && date(row.key).getTime() <= to,
    );
  const label = range?.from
    ? dateLabel.format(range.from) +
      (range.to ? " – " + dateLabel.format(range.to) : " onward")
    : "All six weeks";
  return (
    <main className="press-window">
      <header>
        <p>Workshop ledger · Rosario</p>
        <h1 className="rams-editorial-title">Ready for the bindery</h1>
      </header>
      <section aria-labelledby={id + "-window"}>
        <div className="press-window-heading">
          <h2 id={id + "-window"}>Production window</h2>
          <Button variant="outline" onClick={() => setRange(undefined)}>
            Clear dates
          </Button>
        </div>
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          defaultMonth={date("2026-11-01")}
          numberOfMonths={2}
          aria-label="Production dates"
        />
        <p role="status">{label}</p>
      </section>
      <section aria-labelledby={id + "-output"} className="press-output">
        <h2 id={id + "-output"}>Sheets ready each week</h2>
        {rows.length ? (
          <>
            <ChartContainer
              config={config}
              className="press-chart"
              aria-label="Weekly sheets prepared for binding"
            >
              <LineChart
                aria-label="Weekly sheets prepared for binding"
                data={rows}
                accessibilityLayer
                margin={pressWindowGeometry.margin}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="week"
                  ticks={[...new Set([rows[0].week, rows.at(-1)!.week])]}
                  height={pressWindowGeometry.weekAxisHeight}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  width="auto"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" />}
                />
                <ChartLegend
                  portal={legendNode ?? undefined}
                  content={<ChartLegendContent />}
                />
                <Line
                  dataKey="folded"
                  name="folded"
                  type="monotone"
                  stroke="var(--color-folded)"
                  strokeWidth={pressWindowGeometry.seriesStroke}
                  isAnimationActive={false}
                  dot={{ r: pressWindowGeometry.pointRadius }}
                />
                <Line
                  dataKey="flat"
                  name="flat"
                  type="monotone"
                  stroke="var(--color-flat)"
                  strokeWidth={pressWindowGeometry.seriesStroke}
                  strokeDasharray={pressWindowGeometry.seriesDash.join(" ")}
                  isAnimationActive={false}
                  dot={{ r: pressWindowGeometry.pointRadius }}
                />
              </LineChart>
            </ChartContainer>
            <div ref={setLegendNode} className="press-legend" />
            <p>
              {rows.length}{" "}
              {rows.length === 1 ? "weekly record" : "weekly records"}
            </p>
          </>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No weekly records in this window</EmptyTitle>
              <EmptyDescription>
                Choose a week between November 2 and December 7.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>
    </main>
  );
}
