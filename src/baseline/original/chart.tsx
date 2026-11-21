"use client";
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { useChartMotion } from "../../variants/use-chart-motion";
import { printPreviewGeometry } from "../../variants/print-preview-geometry";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Text,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../../primitives/chart";
import { Label } from "../../primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../primitives/select";

const printLog = Array.from({ length: 90 }, (_, index) => ({
  day: new Date(Date.UTC(2026, 8, 1 + index)).toISOString().slice(0, 10),
  folded: 18 + ((index * 7) % 23) + (index % 7 === 2 ? 12 : 0),
  stitched: 9 + ((index * 11) % 17) + (index % 7 === 4 ? 8 : 0),
}));
const formats = {
  folded: { label: "Folded" },
  stitched: { label: "Stitched" },
} satisfies ChartConfig;
function accumulate(rows: typeof printLog) {
  let folded = 0,
    stitched = 0;
  return rows.map((row) => ({
    ...row,
    folded: (folded += row.folded),
    stitched: (stitched += row.stitched),
  }));
}
const issuedLog = accumulate(printLog);
function dayLabel(day: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}
function PrintLogChart({ kind }: { kind: "bar" | "area" | "line" }) {
  const id = useId(),
    motion = useChartMotion(),
    [series, setSeries] = useState<"folded" | "stitched">("folded"),
    [window, setWindow] = useState("90");
  // Recharts caches tick measurements. Re-read the actual label typography when
  // it changes, then remount only XAxis so it can calculate a fresh tick set.
  const chartNode = useRef<HTMLDivElement>(null);
  const tickNode = useRef<SVGTextElement | null>(null);
  const tickObserver = useRef<ResizeObserver | null>(null);
  const lastTypography = useRef<string | null>(null);
  const [axisRevision, setAxisRevision] = useState(0);
  const readTick = useCallback(() => {
    const node = tickNode.current;
    const style = node?.ownerDocument.defaultView?.getComputedStyle(node);
    if (!style) return;
    const signature = [style.fontSize, style.fontFamily, style.fontWeight, style.letterSpacing].join("|");
    if (lastTypography.current !== null && lastTypography.current !== signature) {
      setAxisRevision((current) => current + 1);
    }
    lastTypography.current = signature;
  }, []);
  const setFirstTick = useCallback((node: SVGTextElement | null) => {
    if (tickNode.current) tickObserver.current?.unobserve(tickNode.current);
    tickNode.current = node;
    if (node) {
      tickObserver.current?.observe(node);
      readTick();
    }
  }, [readTick]);
  useLayoutEffect(() => {
    const owner = chartNode.current?.ownerDocument;
    const view = owner?.defaultView;
    if (!owner || !view) return;
    const observer = typeof view.ResizeObserver === "undefined" ? null : new view.ResizeObserver(readTick);
    tickObserver.current = observer;
    if (tickNode.current) observer?.observe(tickNode.current);
    const fonts = owner.fonts;
    fonts?.addEventListener("loadingdone", readTick);
    view.addEventListener("resize", readTick);
    return () => {
      tickObserver.current = null;
      observer?.disconnect();
      fonts?.removeEventListener("loadingdone", readTick);
      view.removeEventListener("resize", readTick);
    };
  }, [readTick]);
  const chartGeometry = printPreviewGeometry.chart;
  const data = (kind === "area" ? issuedLog : printLog).slice(-Number(window));
  const total =
    kind === "area"
      ? data.at(-1)!.folded + data.at(-1)!.stitched
      : data.reduce((n, row) => n + row[series], 0);
  const heading =
    kind === "bar"
      ? "Daily edition output"
      : kind === "line"
        ? "Edition output over time"
        : "Cumulative issued sheets";
  const description =
    kind === "area"
      ? "Folded and stitched editions issued from the Rosario print room."
      : "Completed sheets from the Rosario print room, by edition format.";
  const axes = (
    <>
      <CartesianGrid vertical={false} />
      <XAxis
        key={axisRevision}
        dataKey="day"
        tick={(props) => (
          <Text
            {...props}
            className="recharts-cartesian-axis-tick-value rams-chart__category-tick"
            ref={props.index === 0 ? setFirstTick : undefined}
          >
            {dayLabel(props.payload.value)}
          </Text>
        )}
        tickFormatter={dayLabel}
        tickLine={false}
        axisLine={false}
        minTickGap={chartGeometry.axis.minTickGap}
        tickMargin={chartGeometry.axis.tickMargin}
        height={chartGeometry.axis.height}
      />
      <YAxis
        tick={{ className: "rams-chart__quantity-tick" }}
        width="auto"
        tickLine={false}
        axisLine={false}
        tickMargin={chartGeometry.axis.tickMargin}
        tickCount={chartGeometry.axis.quantityTicks}
      />
      <ChartTooltip
        content={
          <ChartTooltipContent
            labelFormatter={(label) => dayLabel(String(label))}
          />
        }
      />
    </>
  );
  const plotProps = {
    data,
    accessibilityLayer: true,
    "aria-label": heading,
    margin: { top: chartGeometry.plot.inset, right: chartGeometry.plot.inset, bottom: chartGeometry.plot.inset, left: 0 },
  };
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0,1fr)",
        gap: "var(--rams-detail-preview-scene-gap)",
        width: "100%",
        maxWidth: "var(--rams-detail-preview-native-chart-measure)",
      }}
      aria-label={heading}
    >
      <header style={{ display: "grid", gap: "calc(var(--rams-detail-preview-space-step-fallback) * 2)" }}>
        <h3 className="rams-chart__title">{heading}</h3>
        <p>{description}</p>
      </header>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--rams-detail-preview-scene-gap)",
          alignItems: "end",
        }}
      >
        {kind !== "area" && (
          <div
            style={{
              display: "grid",
              gap: "calc(var(--rams-detail-preview-space-step-fallback) * 2)",
              flex: "1 1 var(--rams-detail-preview-native-chart-control-basis)",
              minWidth: 0,
            }}
          >
            <Label htmlFor={`${id}-series`}>Edition format</Label>
            <Select
              value={series}
              onValueChange={(value) =>
                setSeries(value as "folded" | "stitched")
              }
            >
              <SelectTrigger id={`${id}-series`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="folded">Folded sheets</SelectItem>
                <SelectItem value="stitched">Stitched sheets</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div
          style={{
            display: "grid",
            gap: "calc(var(--rams-detail-preview-space-step-fallback) * 2)",
            flex: "1 1 var(--rams-detail-preview-native-chart-control-basis)",
            minWidth: 0,
          }}
        >
          <Label htmlFor={`${id}-window`}>Production window</Label>
          <Select value={window} onValueChange={setWindow}>
            <SelectTrigger id={`${id}-window`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90">90 sample days · Sep 1–Nov 29, 2026</SelectItem>
              <SelectItem value="30">30 sample days · Oct 31–Nov 29, 2026</SelectItem>
              <SelectItem value="7">7 sample days · Nov 23–29, 2026</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <output
        aria-live="polite"
        aria-label={kind === "area" ? "Cumulative sample sheets" : "Visible sample sheets"}
      >
        <span data-rams-numeric style={{ whiteSpace: "nowrap" }}>
          {total.toLocaleString("en-US")}
        </span>{" "}
        {kind === "area"
          ? "cumulative sheets in the sample"
          : `${formats[series].label.toLowerCase()} sheets`}
      </output>
      <ChartContainer
        ref={chartNode}
        config={formats}
        style={{ aspectRatio: "auto", height: "var(--rams-detail-preview-native-chart-height)" }}
      >
        {kind === "bar" ? (
          <BarChart key={`${window}-${series}`} {...plotProps}>
            {axes}
            <Bar
              dataKey={series}
              fill={`var(--color-${series})`}
              radius={[chartGeometry.marks.barCornerRadius, chartGeometry.marks.barCornerRadius, 0, 0]}
              {...motion}
            />
          </BarChart>
        ) : kind === "line" ? (
          <LineChart key={`${window}-${series}`} {...plotProps}>
            {axes}
            <Line
              type="monotone"
              dataKey={series}
              stroke={`var(--color-${series})`}
              strokeWidth={chartGeometry.marks.strokeWidth}
              dot={false}
              activeDot={{ r: chartGeometry.marks.activeDotRadius }}
              {...motion}
            />
          </LineChart>
        ) : (
          <AreaChart key={window} {...plotProps}>
            {axes}
            <Area
              type="monotone"
              dataKey="folded"
              stackId="issued"
              stroke="var(--color-folded)"
              fill="var(--color-folded)"
              fillOpacity={chartGeometry.marks.foldedFillOpacity}
              strokeWidth={chartGeometry.marks.strokeWidth}
              {...motion}
            />
            <Area
              type="monotone"
              dataKey="stitched"
              stackId="issued"
              stroke="var(--color-stitched)"
              fill="var(--color-stitched)"
              fillOpacity={chartGeometry.marks.stitchedFillOpacity}
              strokeWidth={chartGeometry.marks.strokeWidth}
              strokeDasharray={chartGeometry.marks.stitchedDash}
              {...motion}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        )}
      </ChartContainer>
      <p
        style={{
          fontSize: "var(--type-caption-size)",
          color: "var(--muted-foreground, var(--rams-muted))",
        }}
      >
        {dayLabel(data[0].day)}–{dayLabel(data.at(-1)!.day)}, 2026
      </p>
      <div className="rams-chart__sr">
        <table aria-label={`${heading} data`}>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Folded sheets</th>
              <th scope="col">Stitched sheets</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.day}>
                <th scope="row">{dayLabel(row.day)}</th>
                <td>{row.folded}</td>
                <td>{row.stitched}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
export function ChartBarInteractive() {
  return <PrintLogChart kind="bar" />;
}
export function ChartAreaInteractive() {
  return <PrintLogChart kind="area" />;
}
export function ChartLineInteractive() {
  return <PrintLogChart kind="line" />;
}
