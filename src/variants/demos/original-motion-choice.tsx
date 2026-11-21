"use client";

import { useId, useState } from "react";
import { NativeSelect } from "@/primitives/native-select";
import { Checkbox } from "@/variants/vendor/registry/components/checkbox/checkbox";
import { Rating } from "@/variants/vendor/registry/components/rating/rating";
import SegmentedControl from "@/variants/vendor/registry/components/segmented-control/segmented-control";

// Supporting artwork stays subordinate to the actual interactive control.
const previewFeedbackStyle = {
  display: "block",
  width: "min(100%, var(--rams-detail-preview-proof-artwork-inline-max))",
  height: "var(--rams-detail-preview-proof-artwork-block-max)",
  minWidth: 0, objectFit: "contain", justifySelf: "start",
} as const;

const frameStyle = {
  display: "grid",
  gap: "var(--rams-detail-space-3)",
  gridTemplateColumns: "minmax(0, 1fr)",
  minWidth: 0,
  width: "100%",
  maxWidth: "var(--rams-detail-preview-measure-extra-wide)",
};

const paperColor = "var(--background, var(--rams-surface, var(--rams-detail-native-surface-fill-fallback)))";
const inkColor = "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))";

export function CheckboxDemo() {
  const checkboxId = useId();
  const [includeMarks, setIncludeMarks] = useState(true);
  const [tone, setTone] = useState<"accent" | "neutral">("accent");

  return (
    <section
      aria-label="Registration mark selection"
      style={{
        display: "grid",
        gap: "var(--rams-detail-space-3)",
        gridTemplateColumns: "minmax(0, 1fr)",
        minInlineSize: 0,
        inlineSize: "100%",
        maxInlineSize: "var(--rams-detail-preview-measure)",
      }}
    >
      <label style={{ display: "grid", gap: "var(--rams-detail-space-1)", justifySelf: "start", maxInlineSize: "100%" }}>
        <span
          style={{
            fontFamily: "var(--type-control-family)",
            fontSize: "var(--type-control-size)",
            lineHeight: "var(--type-control-leading)",
            letterSpacing: "var(--type-control-tracking)",
            fontWeight: "var(--rams-detail-label-weight)",
          }}
        >
          Selection tone
        </span>
        <NativeSelect value={tone} onChange={event => setTone(event.target.value as "accent" | "neutral")}>
          <option value="accent">System selection</option>
          <option value="neutral">Surface ink</option>
        </NativeSelect>
      </label>
      <Checkbox
        id={checkboxId}
        tone={tone}
        label="Include registration marks"
        checked={includeMarks}
        onCheckedChange={(next) => setIncludeMarks(next === true)}
      />
      <figure style={{ display: "grid", gap: "var(--rams-detail-space-1)", margin: 0, minInlineSize: 0, color: "var(--rams-detail-foreground)" }}>
        <svg
          viewBox="0 0 320 200"
          role="img"
          aria-label={includeMarks ? "Print sheet with registration marks" : "Print sheet without registration marks"}
          style={{
            display: "block",
            inlineSize: "100%",
            maxInlineSize: "var(--rams-detail-preview-proof-artwork-inline-max)",
            blockSize: "auto",
          }}
        >
          <rect x="12" y="12" width="296" height="176" fill="var(--rams-detail-surface)" stroke="currentColor" />
          <rect x="42" y="34" width="236" height="132" fill="none" stroke="currentColor" strokeWidth="var(--rams-detail-preview-sheet-view-frame-stroke)" />
          <path d="M76 137 135 72l42 47 29-31 39 49H76Z" fill="none" stroke="currentColor" strokeWidth="var(--rams-detail-preview-sheet-view-image-stroke)" />
          <circle cx="150" cy="58" r="11" fill="none" stroke="currentColor" strokeWidth="var(--rams-detail-preview-sheet-view-image-stroke)" />
          {includeMarks && (
            <g fill="none" stroke="currentColor" strokeWidth="var(--rams-detail-preview-sheet-view-frame-stroke)">
              <path d="M20 28h16m-8-8v16M284 28h16m-8-8v16M20 172h16m-8-8v16M284 172h16m-8-8v16" />
              <circle cx="28" cy="100" r="5" />
              <circle cx="292" cy="100" r="5" />
            </g>
          )}
        </svg>
        <figcaption
          style={{
            color: "var(--rams-detail-text-muted)",
            fontFamily: "var(--type-caption-family)",
            fontSize: "var(--type-caption-size)",
            lineHeight: "var(--type-caption-leading)",
          }}
        >
          {includeMarks ? "Registration marks are printed." : "Registration marks are omitted."}
        </figcaption>
      </figure>
    </section>
  );
}

const sheetViews = {
  front: {
    title: "Front plate",
    description: "A dark contour sits over a broad unprinted margin.",
    path: "M54 143 112 72l42 48 32-36 54 59H54Z",
    circle: true,
  },
  reverse: {
    title: "Reverse side",
    description: "The paper back carries only a small edition mark.",
    path: "M85 128h150M85 140h94",
    circle: false,
  },
  detail: {
    title: "Plate detail",
    description: "A close view shows the crosshatch used at the edge of the plate.",
    path: "M70 145 112 65m2 82 42-82m2 82 42-82m2 82 42-82",
    circle: false,
  },
} as const;

type SheetView = keyof typeof sheetViews;

export function SegmentedControlDemo() {
  const [view, setView] = useState<SheetView>("front");
  const selected = sheetViews[view];

  return (
    <section style={frameStyle} aria-label="Print sheet views">
      <SegmentedControl
        options={[
          { value: "front", label: "Front" },
          { value: "reverse", label: "Reverse" },
          { value: "detail", label: "Detail" },
        ]}
        value={view}
        onValueChange={(next) => {
          if (next in sheetViews) setView(next as SheetView);
        }}
        label="Choose a sheet view"
      />
      <div
        aria-live="polite"
        style={{ display: "grid", gap: "var(--rams-detail-space-1)", minWidth: 0 }}
      >
        <h3 style={{ margin: 0 }}>{selected.title}</h3>
        <p style={{ margin: 0 }}>{selected.description}</p>
        <svg
          viewBox="0 0 320 200"
          role="img"
          aria-label={`${selected.title} print illustration`}
          style={previewFeedbackStyle}
        >
          <rect x="12" y="12" width="296" height="176" fill={paperColor} stroke={inkColor} />
          <rect x="42" y="34" width="236" height="132" fill="none" stroke={inkColor} strokeWidth="var(--rams-detail-preview-sheet-view-frame-stroke)" />
          <path d={selected.path} fill="none" stroke={inkColor} strokeWidth="var(--rams-detail-preview-sheet-view-image-stroke)" />
          {selected.circle && <circle cx="151" cy="61" r="12" fill="none" stroke={inkColor} strokeWidth="var(--rams-detail-preview-sheet-view-image-stroke)" />}
        </svg>
      </div>
    </section>
  );
}

export function RatingDemo() {
  const [score, setScore] = useState(0);

  return (
    <section style={frameStyle} aria-label="Print inspection rating">
      <figure style={{ margin: 0, minWidth: 0 }}>
        <svg
          viewBox="0 0 320 160"
          role="img"
          aria-label="Two ink contours aligned on a print proof"
          style={previewFeedbackStyle}
        >
          <rect x="12" y="12" width="296" height="136" fill={paperColor} stroke={inkColor} />
          <path d="M82 116 143 43l48 58 24-27 39 42H82Z" fill="none" stroke={inkColor} strokeWidth="var(--rams-detail-preview-sheet-view-image-stroke)" />
          <path d="M88 119 149 46l48 58 24-27 39 42" fill="none" stroke="currentColor" strokeWidth="var(--rams-detail-preview-sheet-view-registration-stroke)" strokeDasharray="var(--rams-detail-preview-sheet-view-registration-dash)" />
        </svg>
        <figcaption style={{ marginTop: "var(--rams-detail-space-1)" }}>
          Proof sheet 04
        </figcaption>
      </figure>
      <Rating
        label="Impression alignment"
        description="Score how closely the two contours align."
        value={score}
        onValueChange={setScore}
        allowClear
        valueLabels={["Misaligned", "Uneven", "Close", "Aligned", "Exact"]}
        emptyLabel="Not rated"
      />
      <p style={{ margin: 0 }}>
        Rating: {score === 0 ? "Not rated" : `${score} of 5`}
      </p>
    </section>
  );
}
