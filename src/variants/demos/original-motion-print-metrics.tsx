"use client";

import type { ReactNode } from "react";
import { printPreviewGeometry } from "@/variants/print-preview-geometry";
import { MetricCard } from "@/variants/vendor/registry/components/metric-card/metric-card";
import Sparkline from "@/variants/vendor/registry/components/sparkline/sparkline";
import {
  Gauge,
  type GaugeThreshold,
} from "@/variants/vendor/registry/components/gauge/gauge";

const ink = "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))";
const muted = "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))";

const worksheet = {
  previousSevenRuns: [108, 112, 115, 114, 121, 124, 126],
  currentSevenRuns: [130, 128, 139, 142, 146, 157, 164],
} as const;

const total = (values: readonly number[]) =>
  values.reduce((sum, value) => sum + value, 0);
const previousTotal = total(worksheet.previousSevenRuns);
const currentTotal = total(worksheet.currentSevenRuns);
const weeklyChange = (currentTotal - previousTotal) / previousTotal;
const signedPercent = new Intl.NumberFormat("en-US", {
  style: "percent",
  signDisplay: "always",
  maximumFractionDigits: 1,
}).format(weeklyChange);

const spoiledSheets = [8, 7, 9, 6, 6, 4, 3];
const runLabels = ["Run 08", "Run 09", "Run 10", "Run 11", "Run 12", "Run 13", "Run 14"];
const spoilageChange =
  (spoiledSheets.at(-1)! - spoiledSheets[0]!) / spoiledSheets[0]!;
const signedSpoilageChange = new Intl.NumberFormat("en-US", {
  style: "percent",
  signDisplay: "always",
  maximumFractionDigits: 1,
})
  .format(spoilageChange)
  .replace("-", "−");

const registrationThresholds: GaugeThreshold[] = [
  { from: 0, tone: "success", label: "Within tolerance" },
  { from: 0.25, tone: "warning", label: "Adjust register" },
  { from: 0.4, tone: "danger", label: "Stop and realign" },
];

const sceneStyle = {
  display: "grid",
  width: "100%",
  maxWidth: "var(--rams-detail-preview-print-metrics-measure)",
  minWidth: 0,
  gap: "var(--rams-detail-space-4, var(--rams-detail-preview-scene-gap))",
  marginInline: "auto",
  color: ink,
  fontSize: "var(--type-body-size, var(--rams-detail-native-body-size-fallback))",
  lineHeight: "var(--rams-detail-preview-print-chart-leading)",
};

const noteStyle = {
  margin: 0,
  color: muted,
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
  children: ReactNode;
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

export function MetricCardDemo() {
  return (
    <Scene title="Edition 08 · accepted sheets" place="Rosario">
      <MetricCard
        label="Sheets approved · 7 runs"
        value={currentTotal}
        change={signedPercent}
        context={`Current 7 runs: ${currentTotal.toLocaleString("en-US")}; previous 7: ${previousTotal.toLocaleString("en-US")}.`}
      />
      <p style={noteStyle}>
        Sample worksheet, runs 01–14. Current values: {worksheet.currentSevenRuns.join(", ")}.
        Previous values: {worksheet.previousSevenRuns.join(", ")}.
      </p>
    </Scene>
  );
}

export function SparklineDemo() {
  return (
    <Scene title="Spoiled sheets · edition 08" place="Córdoba">
      <Sparkline
        data={spoiledSheets}
        label="Spoiled sheets per proof run"
        labels={runLabels}
        value={`${spoiledSheets.at(-1)} sheets`}
        change={signedSpoilageChange}
        changeTone="success"
        width={printPreviewGeometry.sparkline.width}
        height={printPreviewGeometry.sparkline.height}
        formatValue={(value) => `${value} sheets`}
        interactive
      />
      <p style={noteStyle}>
        Fewer spoiled sheets is favorable. Runs 08–14: {spoiledSheets.join(", ")} sheets. Scrub the plot to inspect
        each labelled run.
      </p>
    </Scene>
  );
}

export function GaugeDemo() {
  return (
    <Scene title="Plate registration drift · edition 12" place="Mendoza">
      <div style={{ display: "grid", justifyItems: "center", gap: "var(--rams-detail-preview-gauge-scene-gap)" }}>
        <Gauge
          value={0.18}
          min={0}
          max={0.5}
          label="Registration drift"
          detail="Target < 0.25 mm"
          formatValue={(value) => `${value.toFixed(2)} mm`}
          thresholds={registrationThresholds}
        />
        <ul
          style={{
            display: "grid",
            gap: "var(--rams-detail-preview-gauge-legend-gap)",
            margin: 0,
            paddingInlineStart: "var(--rams-detail-preview-gauge-legend-indent)",
            color: muted,
            fontSize: "var(--type-caption-size, var(--rams-detail-preview-print-chart-caption-size-fallback))",
          }}
        >
          <li>0–0.24 mm: within tolerance</li>
          <li>0.25–0.39 mm: adjust register</li>
          <li>0.40 mm or more: stop and realign</li>
        </ul>
        <p style={noteStyle}>0.18 mm uses 36% of the 0.50 mm reference range.</p>
      </div>
    </Scene>
  );
}
