"use client";

import * as React from "react";
import { BrushChart } from "@/variants/vendor/registry/components/brush-chart/brush-chart";
import { Ridgeline } from "@/variants/vendor/registry/components/ridgeline/ridgeline";
import { SlopeChart } from "@/variants/vendor/registry/components/slope-chart/slope-chart";
import {
  Streamgraph,
  type StreamgraphDatum,
} from "@/variants/vendor/registry/components/streamgraph/streamgraph";
import {
  Treemap,
  type TreemapNode,
} from "@/variants/vendor/registry/components/treemap/treemap";
import { WaffleChart } from "@/variants/vendor/registry/components/waffle-chart/waffle-chart";

const sceneStyle: React.CSSProperties = {
  display: "grid",
  width: "100%",
  maxWidth: "var(--rams-detail-preview-print-chart-wide-measure)",
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

const inkSeries = [
  { key: "black", label: "Black plate" },
  { key: "cyan", label: "Cyan plate" },
  { key: "magenta", label: "Magenta plate" },
  { key: "yellow", label: "Yellow plate" },
] as const;

const inkRuns: StreamgraphDatum[] = [
  { key: "2026-04-06", label: "Week of Apr 6, 2026", axisLabel: "Apr 6", values: { black: 42, cyan: 12, magenta: 11, yellow: 9 } },
  { key: "2026-04-13", label: "Week of Apr 13, 2026", axisLabel: "Apr 13", values: { black: 41, cyan: 13, magenta: 10, yellow: 11 } },
  { key: "2026-04-20", label: "Week of Apr 20, 2026", axisLabel: "Apr 20", values: { black: 39, cyan: 11, magenta: 12, yellow: 10 } },
  { key: "2026-04-27", label: "Week of Apr 27, 2026", axisLabel: "Apr 27", values: { black: 44, cyan: 15, magenta: 13, yellow: 12 } },
  { key: "2026-05-04", label: "Week of May 4, 2026", axisLabel: "May 4", values: { black: 46, cyan: 15, magenta: 14, yellow: 13 } },
  { key: "2026-05-11", label: "Week of May 11, 2026", axisLabel: "May 11", values: { black: 43, cyan: 14, magenta: 13, yellow: 12 } },
  { key: "2026-05-18", label: "Week of May 18, 2026", axisLabel: "May 18", values: { black: 40, cyan: 12, magenta: 11, yellow: 10 } },
  { key: "2026-05-25", label: "Week of May 25, 2026", axisLabel: "May 25", values: { black: 38, cyan: 13, magenta: 10, yellow: 9 } },
];

export function PrintInkStreamgraphDemo() {
  return (
    <Scene title="Ink use by plate · eight press weeks" place="Rosario">
      <Streamgraph
        data={inkRuns}
        series={[...inkSeries]}
        label="Ink use by plate across eight press weeks"
        unit="litres"
        categoryLabel="Press week"
      />
      <p style={noteStyle}>
        Tonal colors distinguish plates; they do not represent ink hues. Sample
        press worksheet, April 6–May 31, 2026. The four plate totals are
        {" "}333 L black, 105 L cyan, 94 L magenta, and 86 L yellow; 618 L overall.
      </p>
    </Scene>
  );
}

const offcutByDay = [
  22, 25, 24, 30, 29, 8, 0,
  21, 28, 31, 27, 34, 9, 0,
  23, 26, 29, 32, 25, 7, 0,
  18, 22, 31, 33, 36, 10, 0,
  25, 29, 35, 31, 38, 12, 0,
  28, 32, 34, 39, 42, 11, 0,
  26, 31, 37, 35, 40, 13, 0,
  24, 30, 33, 41, 44, 12, 0,
] as const;
const firstOffcutDay = Date.UTC(2026, 5, 1);
const dayMs = 86_400_000;
const offcutData = offcutByDay.map((value, index) => ({
  date: firstOffcutDay + index * dayMs,
  value,
}));
const offcutAnnotations = [
  {
    date: Date.UTC(2026, 6, 2),
    label: "Edition 12",
    description: "Sample ledger marks the edition 12 press run.",
  },
  {
    date: Date.UTC(2026, 6, 15),
    label: "Collection",
    description: "Sample ledger records a recovered-paper collection.",
  },
];

export function PrintOffcutBrushChartDemo() {
  return (
    <Scene title="Paper offcuts recovered · eight weeks" place="Córdoba">
      <BrushChart
        data={offcutData}
        label="Paper offcuts recovered per day"
        unit="kg"
        annotations={offcutAnnotations}
        formatDate={(date) =>
          new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
          }).format(date)
        }
      />
      <p style={noteStyle}>
        Sample recovery log, June 1–July 26, 2026. Drag or resize the overview
        window to inspect a shorter date range. Double-click the overview, or
        focus a window handle and press Escape, to restore the full period.
      </p>
    </Scene>
  );
}

const trimLots = [
  { id: "lot-a", label: "Stock lot A", values: [-0.24, -0.18, -0.15, -0.11, -0.08, -0.05, -0.03, 0, 0.02, 0.04, 0.06, 0.08, 0.11, 0.14, 0.18, 0.23] },
  { id: "lot-b", label: "Stock lot B", values: [-0.38, -0.29, -0.22, -0.17, -0.12, -0.08, -0.03, 0.01, 0.04, 0.07, 0.1, 0.13, 0.18, 0.22, 0.29, 0.41] },
  { id: "lot-c", label: "Stock lot C", values: [-0.2, -0.15, -0.12, -0.1, -0.08, -0.04, -0.02, 0, 0.01, 0.03, 0.05, 0.08, 0.1, 0.13, 0.18, 0.24] },
];

export function PrintTrimRidgelineDemo() {
  return (
    <Scene title="Trim offset by stock lot" place="Mendoza">
      <Ridgeline
        series={trimLots}
        label="Trim offset measurements by paper stock lot"
        unit="mm"
        domain={[-0.5, 0.5]}
        formatValue={(value) => `${value.toFixed(2)} mm`}
      />
      <p style={noteStyle}>
        Sample measurements against the trim mark: 16 sheets per lot, in
        {" "}millimetres. Negative values fall before the mark; positive values
        fall beyond it.
      </p>
    </Scene>
  );
}

const paperRecovery: TreemapNode = {
  id: "edition-12",
  label: "Edition 12 recovery",
  children: [
    {
      id: "coated",
      label: "Coated paper",
      children: [
        { id: "poster", label: "Poster stock", value: 42, color: 88 },
        { id: "catalog", label: "Catalog stock", value: 28, color: 82 },
      ],
    },
    {
      id: "uncoated",
      label: "Uncoated paper",
      children: [
        { id: "journal", label: "Journal stock", value: 36, color: 91 },
        { id: "insert", label: "Insert stock", value: 18, color: 94 },
      ],
    },
    {
      id: "board",
      label: "Cover board",
      children: [
        { id: "binding", label: "Binding offcuts", value: 24, color: 76 },
        { id: "packaging", label: "Packaging offcuts", value: 12, color: 70 },
      ],
    },
  ],
};

export function PrintRecoveryTreemapDemo() {
  return (
    <Scene title="Recovered paper by stock and use" place="Buenos Aires">
      <Treemap
        data={paperRecovery}
        label="Recovered paper by stock and use"
        formatValue={(value) => `${value} kg`}
        colorLabel="Recorded recovery share"
        formatColor={(value) => `${value.toFixed(0)}%`}
        colorDomain={[70, 94]}
      />
      <p style={noteStyle}>
        Sample edition 12 reconciliation: 160 kg across six uses. Tile area is
        {" "}recovered mass; shading is the sample recovery share recorded for
        each use.
      </p>
    </Scene>
  );
}

const copyAllocation = [
  { key: "bookshops", label: "Bookshops", value: 420 },
  { key: "subscribers", label: "Subscribers", value: 260 },
  { key: "libraries", label: "Libraries", value: 180 },
  { key: "fair", label: "Print fair", value: 90 },
  { key: "archive", label: "Archive copies", value: 50 },
];

export function PrintCopyWaffleDemo() {
  return (
    <Scene title="Edition 18 · copy allocation" place="La Plata">
      <WaffleChart
        data={copyAllocation}
        label="Allocation of the edition 18 print run"
        unit="copies"
        rows={10}
        columns={10}
        decimals={0}
      />
      <p style={noteStyle}>
        Sample print plan: 1,000 copies — 420 for bookshops, 260 for
        subscribers, 180 for libraries, 90 for a print fair, and 50 archive
        copies. Each cell represents one percent of the run.
      </p>
    </Scene>
  );
}

const finishingTimes = [
  { key: "prepress", label: "Prepress", start: 18, end: 15 },
  { key: "plates", label: "Plate setup", start: 32, end: 27 },
  { key: "registration", label: "Press registration", start: 46, end: 38 },
  { key: "binding", label: "Binding setup", start: 25, end: 29 },
  { key: "packing", label: "Packing setup", start: 14, end: 12 },
];

export function PrintFinishingSlopeDemo() {
  return (
    <Scene title="Make-ready time by station" place="Rosario">
      <SlopeChart
        data={finishingTimes}
        label="Make-ready time by finishing station"
        startLabel="Edition 11"
        endLabel="Edition 12"
        formatValue={(value) => `${value} min`}
        formatChange={(change) =>
          `${change > 0 ? "+" : change < 0 ? "−" : ""}${Math.abs(change)} min`
        }
      />
      <p style={noteStyle}>
        Sample worksheets in minutes. Plate setup changes from 32 to 27 minutes;
        binding setup rises from 25 to 29. All other station times decrease in edition 12.
      </p>
    </Scene>
  );
}
