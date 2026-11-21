"use client";

import * as React from "react";
import { ActivityHeatmap } from "@/variants/vendor/registry/components/activity-heatmap/activity-heatmap";
import { BarChart } from "@/variants/vendor/registry/components/bar-chart/bar-chart";
import { DonutChart } from "@/variants/vendor/registry/components/donut-chart/donut-chart";
import {
  LineChart,
  type LineChartDatum,
} from "@/variants/vendor/registry/components/line-chart/line-chart";

const sceneStyle: React.CSSProperties = {
  display: "grid",
  width: "100%",
  maxWidth: "var(--rams-detail-preview-print-chart-measure)",
  minWidth: 0,
  gap: "var(--rams-detail-space-4, var(--rams-detail-preview-scene-gap))",
  marginInline: "auto",
  color: "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))",
  fontSize: "var(--type-body-size, var(--rams-detail-native-body-size-fallback))",
  lineHeight: "var(--rams-detail-preview-print-chart-leading)",
};

const noteStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))",
  fontSize: "var(--type-caption-size, var(--rams-detail-preview-print-chart-caption-size-fallback))",
  lineHeight: "var(--type-caption-leading)",
};

function Scene({
  title,
  place,
  children,
}: {
  title: string;
  place: string;
  children: React.ReactNode;
}) {
  return (
    <section style={sceneStyle} aria-label={`${place}: ${title}`}>
      <header>
        <p style={{ ...noteStyle, marginBottom: "var(--rams-detail-preview-kicker-gap)" }}>{place} · print room</p>
        <h2
          style={{
            margin: 0,
            fontSize: "var(--type-title-size, var(--rams-detail-preview-print-chart-title-size-fallback))",
            fontWeight: "var(--type-title-weight)",
            lineHeight: "var(--type-title-leading)",
            letterSpacing: "var(--type-title-tracking)",
          }}
        >
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

const trimWaste = [12, 9, 15, 8, 6, 10, 5] as const;
const pressRuns = trimWaste.map((value, index) => {
  const run = index + 1;
  return {
    key: `proof-${String(run).padStart(2, "0")}`,
    label: `Proof ${String(run).padStart(2, "0")}`,
    axisLabel: `P${String(run).padStart(2, "0")}`,
    value,
  };
});

export function PrintTrimWasteChartDemo() {
  return (
    <Scene title="Edition 12 · trim waste" place="Rosario">
      <BarChart
        data={pressRuns}
        label="Trim waste per proof run"
        period="Edition 12 · proofs 01–07"
        unit="sheets"
        averageLabel="Average waste"
        valueLabel="Waste"
        categoryLabel="Proof run"
        formatValue={(value) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value)}
      />
      <p style={noteStyle}>
        Sample press worksheet. Waste by proof run: {trimWaste.join(", ")} sheets;
        {" "}65 sheets total across seven runs.
      </p>
    </Scene>
  );
}

const proofWeeks = [
  [2, 3, 1, 4, 2, 1, 0],
  [2, 4, 3, 2, 5, 1, 0],
  [1, 3, 4, 2, 3, 2, 0],
  [2, 2, 5, 3, 4, 1, 0],
  [3, 4, 2, 5, 4, 2, 0],
  [1, 3, 2, 4, 2, 1, 0],
  [2, 4, 3, 5, 3, 2, 0],
  [1, 3, 2, 4, 2, 0, 0],
] as const;
const proofDays = proofWeeks.flatMap((week, weekIndex) =>
  week.map((count, dayIndex) => {
    const date = new Date(Date.UTC(2026, 0, 5 + weekIndex * 7 + dayIndex));
    return { date: date.toISOString().slice(0, 10), count };
  }),
);
const selectedProofDate = "2026-02-16";

export function PrintProofHeatmapDemo() {
  const [selected, setSelected] = React.useState<string | null>(selectedProofDate);
  const selectedCount = proofDays.find((day) => day.date === selected)?.count ?? 0;
  const selectedLabel = selected
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${selected}T00:00:00Z`))
    : "No day selected";

  return (
    <Scene title="Daily registration checks · proofs 01–08" place="Mendoza">
      <ActivityHeatmap
        days={proofDays}
        label="Registration checks per day, January 5 to March 1, 2026"
        period="January 5–March 1, 2026"
        unit={{ one: "registration check", other: "registration checks" }}
        thresholds={[1, 2, 4]}
        weekStartsOn={1}
        selectedDate={selected}
        onSelectDate={setSelected}
      />
      <p aria-live="polite" style={noteStyle}>
        {selectedLabel}: {selectedCount} registration {selectedCount === 1 ? "check" : "checks"}.
        {" "}The eight-week sample records {proofDays.reduce((sum, day) => sum + day.count, 0)} checks.
      </p>
      <p style={noteStyle}>Sample proof log; blank days represent no recorded checks.</p>
    </Scene>
  );
}

const registrationRows: LineChartDatum[] = [
  { key: "proof-01", label: "Proof 01", axisLabel: "P01", values: { plateA: 8, plateB: 11 } },
  { key: "proof-02", label: "Proof 02", axisLabel: "P02", values: { plateA: 7, plateB: 9 } },
  { key: "proof-03", label: "Proof 03", axisLabel: "P03", values: { plateA: 6, plateB: 10 } },
  { key: "proof-04", label: "Proof 04", axisLabel: "P04", values: { plateA: 9, plateB: 7 } },
  { key: "proof-05", label: "Proof 05", axisLabel: "P05", values: { plateA: 5, plateB: 7 } },
  { key: "proof-06", label: "Proof 06", axisLabel: "P06", values: { plateA: 4, plateB: 5 } },
  { key: "proof-07", label: "Proof 07", axisLabel: "P07", values: { plateA: 3, plateB: 4 } },
];

export function PrintRegistrationTrendDemo() {
  return (
    <Scene title="Plate registration · seven proofs" place="Córdoba">
      <LineChart
        data={registrationRows}
        series={[
          { key: "plateA", label: "Plate A" },
          { key: "plateB", label: "Plate B" },
        ]}
        label="Misregistered sheets per 20-sheet proof pull"
        unit="sheets"
        categoryLabel="Proof run"
        curve="linear"
      />
      <p style={noteStyle}>
        Sample counts of sheets outside the registration marks: Plate A, 8 to 3;
        {" "}Plate B, 11 to 4, across proofs 01–07.
      </p>
    </Scene>
  );
}

const stockAllocation = [
  { key: "cover", label: "Cover stock", value: 640 },
  { key: "text", label: "Text stock", value: 360 },
  { key: "proof", label: "Proof reserve", value: 120 },
  { key: "make-ready", label: "Make-ready", value: 80 },
] as const;

export function PrintStockAllocationDemo() {
  return (
    <Scene title="Edition 12 · paper allocation" place="Buenos Aires">
      <DonutChart
        data={stockAllocation.map((item) => ({ ...item }))}
        label="Paper allocation for edition 12"
        unit="sheets"
        totalLabel="Total"
      />
      <p style={noteStyle}>
        Sample print plan: 1,200 sheets total — 640 cover, 360 text, 120 proof
        reserve, and 80 make-ready sheets.
      </p>
    </Scene>
  );
}
