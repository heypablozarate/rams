import { printPreviewGeometry } from "@/variants/print-preview-geometry";
"use client";

import { useState } from "react";
import type { CommandItem } from "@/variants/vendor/registry/components/command-palette/command-palette";
import CommandPalette from "@/variants/vendor/registry/components/command-palette/command-palette";
import { ContextMenu } from "@/variants/vendor/registry/components/context-menu/context-menu";
import { DropdownMenu } from "@/variants/vendor/registry/components/dropdown-menu/dropdown-menu";

// Supporting artwork stays subordinate to the actual interactive control.
const previewFeedbackStyle = {
  display: "block", width: "min(100%, var(--rams-detail-preview-proof-artwork-inline-max))",
  height: "var(--rams-detail-preview-proof-artwork-block-max)",
  minWidth: 0, objectFit: "contain", justifySelf: "start",
} as const;

const ink = "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))";
const paper = "var(--background, var(--rams-surface, var(--rams-detail-native-surface-fill-fallback)))";
const gap = "var(--rams-detail-space-1)";

export function DropdownMenuDemo() {
  const [cropGuides, setCropGuides] = useState(true);
  const [reversed, setReversed] = useState(false);
  const markColor = reversed ? paper : ink;
  const groundColor = reversed ? ink : paper;

  return (
    <section
      style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap, width: "100%", minWidth: 0 }}
      aria-label="Print proof commands"
    >
      <DropdownMenu
        label="Proof settings"
        items={[
          { label: cropGuides ? "Hide crop guides" : "Show crop guides", onSelect: () => setCropGuides((shown) => !shown) },
          { label: reversed ? "Restore ink on paper" : "Reverse ink and paper", onSelect: () => setReversed((value) => !value) },
          {
            label: "Reset proof",
            separatorBefore: true,
            onSelect: () => {
              setCropGuides(true);
              setReversed(false);
            },
          },
        ]}
      />
      <svg
        viewBox="0 0 360 240"
        role="img"
        aria-label={`${cropGuides ? "Proof with crop guides" : "Proof without crop guides"}; ${reversed ? "light ink on dark paper" : "dark ink on light paper"}`}
        style={{ ...previewFeedbackStyle, color: ink }}
      >
        <rect width="360" height="240" fill={groundColor} />
        <rect x="38" y="30" width="284" height="180" fill="none" stroke={markColor} strokeWidth="var(--rams-detail-preview-plate-frame-stroke)" />
        <path d="M56 171 112 98l44 49 51-71 39 45 36-25 22 75H56Z" fill={markColor} fillOpacity="var(--rams-detail-preview-plate-relief-opacity)" stroke={markColor} strokeWidth="var(--rams-detail-preview-plate-relief-stroke)" />
        <circle cx="261" cy="74" r="20" fill={markColor} fillOpacity="var(--rams-detail-preview-plate-disc-opacity)" stroke={markColor} strokeWidth="var(--rams-detail-preview-plate-disc-stroke)" />
        {cropGuides && (
          <g fill="none" stroke={markColor} strokeWidth="var(--rams-detail-preview-plate-trim-stroke)">
            <path d="M18 42h28M32 28v28M314 42h28m-14-14v28M18 198h28m-14-14v28M314 198h28m-14-14v28" />
            <circle cx="32" cy="120" r="5" />
            <circle cx="328" cy="120" r="5" />
          </g>
        )}
      </svg>
      <p role="status" style={{ margin: 0, color: "var(--muted-foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))" }}>
        {cropGuides ? "Crop guides shown" : "Crop guides hidden"} · {reversed ? "Light ink on dark paper" : "Dark ink on light paper"}
      </p>
    </section>
  );
}

type PlateOrientation = "portrait" | "landscape";
type PlateMargin = "wide" | "narrow";

export function ContextMenuDemo() {
  const [orientation, setOrientation] = useState<PlateOrientation>("portrait");
  const [margin, setMargin] = useState<PlateMargin>("wide");
  const { shortEdge, longEdge, narrowMarginShare, wideMarginShare } = printPreviewGeometry.plateLayout;
  const width = orientation === "portrait" ? shortEdge : longEdge;
  const height = orientation === "portrait" ? longEdge : shortEdge;
  const inset = margin === "wide" ? wideMarginShare : narrowMarginShare;
  const frameX = width * inset;
  const frameY = height * inset;
  const frameWidth = width * (1 - inset * 2);
  const frameHeight = height * (1 - inset * 2);
  const centerX = width / 2;
  const centerY = height / 2;

  return (
    <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap, width: "100%", minWidth: 0 }} aria-label="Plate layout context menu">
      <ContextMenu
        label="Plate layout options"
        items={[
          { id: "portrait", label: "Set portrait orientation", onSelect: () => setOrientation("portrait") },
          { id: "landscape", label: "Set landscape orientation", onSelect: () => setOrientation("landscape") },
          { id: "wide", label: "Use wide margins", onSelect: () => setMargin("wide") },
          { id: "narrow", label: "Use narrow margins", onSelect: () => setMargin("narrow") },
        ]}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${orientation} print plate with ${margin} margins`}
          style={{ display: "block", width: "100%", height: "auto", maxWidth: "var(--rams-detail-context-plate-inline-size)", color: ink }}
        >
          <rect width={width} height={height} fill={paper} />
          <rect x={frameX} y={frameY} width={frameWidth} height={frameHeight} fill="none" stroke={ink} strokeWidth="var(--rams-detail-preview-plate-frame-stroke)" />
          <path d={`M${frameX + frameWidth * 0.08} ${frameY + frameHeight * 0.78} Q${centerX} ${frameY + frameHeight * 0.12} ${frameX + frameWidth * 0.92} ${frameY + frameHeight * 0.72}`} fill="none" stroke={ink} strokeWidth="var(--rams-detail-preview-plate-curve-stroke)" strokeLinecap="round" />
          <path d={`M${frameX + frameWidth * 0.08} ${frameY + frameHeight * 0.84}H${frameX + frameWidth * 0.92}`} fill="none" stroke={ink} strokeWidth="var(--rams-detail-preview-plate-baseline-stroke)" strokeDasharray="var(--rams-detail-preview-plate-baseline-dash)" />
          <circle cx={frameX + frameWidth * 0.72} cy={frameY + frameHeight * 0.28} r={Math.min(frameWidth, frameHeight) * 0.09} fill={ink} fillOpacity="var(--rams-detail-preview-plate-point-opacity)" stroke={ink} strokeWidth="var(--rams-detail-preview-plate-disc-stroke)" />
          <path d={`M${centerX} ${frameY + frameHeight * 0.45}v${frameHeight * 0.18}`} stroke={ink} strokeWidth="var(--rams-detail-preview-plate-cross-stroke)" />
        </svg>
      </ContextMenu>
      <p role="status" style={{ margin: 0, color: "var(--rams-detail-text-muted)" }}>
        {orientation === "portrait" ? "Portrait" : "Landscape"} · {margin} margins. Right-click the plate or focus it and press Shift+F10 for layout actions.
      </p>
    </section>
  );
}

const plateRecords = [
  { id: "delta-04", title: "Delta fold · proof 04", city: "Rosario", process: "Relief", paper: "Cotton rag", gsm: 280, path: "M48 176 112 80l48 58 64-86 72 124H48Z" },
  { id: "river-05", title: "River bend · proof 05", city: "Paraná", process: "Linocut", paper: "Uncoated book", gsm: 220, path: "M42 142c54-82 94-83 138 0s86 84 138 0M42 172c54-82 94-83 138 0s86 84 138 0" },
  { id: "harbor-06", title: "Harbor map · proof 06", city: "Buenos Aires", process: "Screenprint", paper: "Recycled cover", gsm: 300, path: "M58 58h244v124H58zM58 100h244M118 58v124M238 58v124" },
  { id: "hill-07", title: "Hill line · proof 07", city: "Córdoba", process: "Drypoint", paper: "Cotton rag", gsm: 250, path: "M48 180 112 114l52 30 60-80 72 116H48Z" },
  { id: "orchard-08", title: "Orchard study · proof 08", city: "Mendoza", process: "Monotype", paper: "Linen finish", gsm: 240, path: "M76 184V88m54 96V62m54 122V100m54 84V72m54 112V92M55 184h250" },
];

const commandItems: CommandItem[] = plateRecords.map((record) => ({
  id: record.id,
  label: `Open ${record.title}`,
  description: `${record.city} · ${record.process} · ${record.paper}, ${record.gsm} gsm`,
  group: "Print records",
  keywords: [record.city, record.process, record.paper, String(record.gsm)],
}));

export function CommandPaletteDemo() {
  const [selected, setSelected] = useState(plateRecords[0]!);

  return (
    <section
      style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--rams-detail-space-3)", width: "100%", minWidth: 0 }}
      aria-label="Search and open print records"
    >
      <div aria-live="polite" aria-atomic="true" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap, minWidth: 0 }}>
        <h2 style={{ margin: 0 }}>{selected.title}</h2>
        <svg
          viewBox="0 0 360 240"
          role="img"
          aria-label={`${selected.title} original print mark`}
          style={{ ...previewFeedbackStyle, color: ink }}
        >
          <rect width="360" height="240" fill={paper} />
          <rect x="28" y="24" width="304" height="192" fill="none" stroke={ink} strokeWidth="var(--rams-detail-preview-plate-frame-stroke)" />
          <path d={selected.path} fill={ink} fillOpacity="var(--rams-detail-preview-record-proof-opacity)" stroke={ink} strokeWidth="var(--rams-detail-preview-plate-relief-stroke)" strokeLinejoin="round" />
          <circle cx="292" cy="67" r="15" fill={ink} fillOpacity="var(--rams-detail-preview-record-stamp-opacity)" stroke={ink} strokeWidth="var(--rams-detail-preview-plate-disc-stroke)" />
          <path d="M46 192h268" stroke={ink} strokeOpacity="var(--rams-detail-preview-record-rule-opacity)" strokeWidth="var(--rams-detail-preview-record-rule-stroke)" strokeDasharray="var(--rams-detail-preview-record-rule-dash)" />
        </svg>
        <dl style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap, margin: 0, minWidth: 0 }}>
          <div><dt>City</dt><dd style={{ marginInlineStart: 0 }}>{selected.city}</dd></div>
          <div><dt>Process</dt><dd style={{ marginInlineStart: 0 }}>{selected.process}</dd></div>
          <div><dt>Paper</dt><dd style={{ marginInlineStart: 0 }}>{selected.paper} · {selected.gsm} gsm</dd></div>
        </dl>
      </div>
      <CommandPalette
        label="Search print records"
        placeholder="Find…"
        items={commandItems}
        onSelect={(item) => {
          const record = plateRecords.find((candidate) => candidate.id === item.id);
          if (record) setSelected(record);
        }}
      />
    </section>
  );
}
