"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { Slider } from "@/variants/vendor/registry/components/slider/slider";
import { NumberField } from "@/variants/vendor/registry/components/number-field/number-field";
import { ElasticSlider } from "@/variants/vendor/registry/components/elastic-slider/elastic-slider";

// Supporting artwork stays subordinate to the actual interactive control.
const previewFeedbackStyle = {
  display: "block",
  width: "min(100%, var(--rams-detail-preview-proof-artwork-inline-max))",
  height: "var(--rams-detail-preview-proof-artwork-block-max)",
  minWidth: 0, objectFit: "contain", justifySelf: "start",
} as const;

const layout: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: "var(--rams-detail-space-4)",
  width: "100%",
  minWidth: 0,
  color: "var(--rams-detail-foreground)",
  fontSize: "var(--type-body-size)",
  lineHeight: "var(--type-body-leading)",
  overflowWrap: "anywhere",
};
const sheet: CSSProperties = {
  ...previewFeedbackStyle,
  color: "var(--rams-detail-foreground)",
  background: "var(--rams-detail-background)",
  border: "var(--rams-detail-primitive-border-width) solid var(--rams-detail-border)",
  borderRadius: "var(--radius-control)",
};
const outputStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: "var(--rams-detail-preview-print-study-copy-gap)",
  minWidth: 0,
  fontSize: "var(--type-caption-size)",
  color: "var(--rams-detail-text-muted)",
  fontVariantNumeric: "var(--rams-detail-numeric-column-variant)",
  overflowWrap: "anywhere",
};

function PrintStudy({
  id,
  place,
  title,
  children,
}: {
  id: string;
  place: string;
  title: string;
  children: ReactNode;
}) {
  const heading = useId();
  return (
    <section style={layout} data-range-scene={id} aria-labelledby={heading}>
      <header
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: "var(--rams-detail-preview-print-study-copy-gap)",
          minWidth: 0,
        }}
      >
        <span
          style={{
            color: "var(--rams-detail-text-muted)",
            fontSize: "var(--type-caption-size)",
          }}
        >
          {place} / print room
        </span>
        <h2
          id={heading}
          style={{ margin: 0, fontFamily: "var(--type-title-family)", fontSize: "var(--type-title-size)", fontWeight: "var(--type-title-weight)", lineHeight: "var(--type-title-leading)", letterSpacing: "var(--type-title-tracking)" }}
        >
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

/** Margin is measured in the same millimetre coordinate system as the sheet. */
export function MotionPrintMarginSliderDemo() {
  const [margin, setMargin] = useState(12);
  const printableWidth = 210 - margin * 2;
  const printableHeight = 148 - margin * 2;
  return (
    <PrintStudy id="print-margin" place="Rosario" title="Room around the river">
      <svg
        role="img"
        aria-label={`Rosario river print, ${margin} millimetre margin and ${printableWidth} by ${printableHeight} millimetre printable area.`}
        viewBox="0 0 210 148"
        style={sheet}
      >
        <rect
          x="1"
          y="1"
          width="208"
          height="146"
          fill="none"
          stroke="currentColor"
          strokeWidth="var(--rams-detail-preview-margin-study-line-stroke)"
        />
        <g transform={`translate(${margin} ${margin})`}>
          <rect
            data-printable-area="true"
            width={printableWidth}
            height={printableHeight}
            fill="currentColor"
            opacity="var(--rams-detail-preview-margin-study-printable-wash)"
          />
          <path
            d={`M0 ${printableHeight * 0.7}Q${printableWidth * 0.25} ${printableHeight * 0.08} ${printableWidth * 0.5} ${printableHeight * 0.5}T${printableWidth} ${printableHeight * 0.4}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="var(--rams-detail-preview-margin-study-river-stroke)"
          />
          <path
            d={`M0 ${printableHeight * 0.82}Q${printableWidth * 0.25} ${printableHeight * 0.2} ${printableWidth * 0.5} ${printableHeight * 0.62}T${printableWidth} ${printableHeight * 0.52}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="var(--rams-detail-preview-margin-study-line-stroke)"
          />
          <path
            d={`M${printableWidth * 0.1} ${printableHeight * 0.18}h${printableWidth * 0.3}M${printableWidth * 0.1} ${printableHeight * 0.24}h${printableWidth * 0.18}`}
            stroke="currentColor"
            strokeWidth="var(--rams-detail-preview-margin-study-text-stroke)"
          />
        </g>
        <rect
          x={margin}
          y={margin}
          width={printableWidth}
          height={printableHeight}
          fill="none"
          stroke="currentColor"
          strokeWidth="var(--rams-detail-preview-margin-study-line-stroke)"
          strokeDasharray="var(--rams-detail-preview-margin-study-guide-dash)"
        />
      </svg>
      <Slider
        label="Margin"
        value={margin}
        onValueChange={setMargin}
        min={6}
        max={24}
        step={1}
        largeStep={6}
        marks={[6, 12, 18, 24]}
        showValue={false}
        format={(value) => `${value} mm`}
      />
      <output aria-live="polite" style={outputStyle}>
        <span>Margin: {margin} mm on each side.</span>
        <span>
          Printable area: {printableWidth} × {printableHeight} mm.
        </span>
        <span>Sheet: 210 × 148 mm.</span>
      </output>
    </PrintStudy>
  );
}

/** Each accepted integer adds one actual separation to the local print artwork. */
export function MotionInkPassNumberFieldDemo() {
  const [passes, setPasses] = useState(3);
  const impressions = 60 * passes;
  return (
    <PrintStudy id="ink-passes" place="Córdoba" title="Build the overprint">
      <div
        style={
          {
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            minWidth: 0,
            "--rams-detail-number-field-width": "var(--rams-detail-preview-fluid-field-width)",
          } as CSSProperties
        }
      >
        <NumberField
          label="Passes"
          value={passes}
          onValueChange={setPasses}
          min={1}
          max={8}
          step={1}
          largeStep={2}
          description="One pass per ink layer."
          formatOptions={{ useGrouping: false }}
        />
      </div>
      <svg
        role="img"
        aria-label={`Córdoba overprint study with ${passes} ink ${passes === 1 ? "layer" : "layers"}.`}
        viewBox="0 0 320 220"
        style={{ ...sheet, maxHeight: "var(--rams-detail-preview-overprint-artwork-max)" }}
      >
        <rect
          x="20"
          y="20"
          width="280"
          height="180"
          fill="none"
          stroke="currentColor"
        />
        {Array.from({ length: passes }, (_, index) => (
          <g
            key={index}
            data-ink-layer={index + 1}
            transform={`translate(${54 + index * 28} ${104 + (index % 2) * 20})`}
          >
            <circle
              r="31"
              fill="currentColor"
              style={{
                opacity: `calc(var(--rams-detail-preview-overprint-layer-fill-base) + ${index} * var(--rams-detail-preview-overprint-layer-fill-increment))`,
              }}
            />
            <circle
              r="31"
              fill="none"
              stroke="currentColor"
              strokeWidth="var(--rams-detail-preview-overprint-outline-stroke)"
            />
            <path
              d="M-22 0h44M0-22v44"
              stroke="currentColor"
              strokeWidth="var(--rams-detail-preview-overprint-crosshair-stroke)"
            />
          </g>
        ))}
        <path d="M38 174h244" stroke="currentColor" />
      </svg>
      <output aria-live="polite" style={outputStyle}>
        <span>
          {passes} ink {passes === 1 ? "layer" : "layers"} in the composition.
        </span>
        <span>
          60 sheets × {passes} {passes === 1 ? "pass" : "passes"} ={" "}
          {impressions} impressions.
        </span>
      </output>
    </PrintStudy>
  );
}

/** Overlap and combined width share the diagram's millimetre coordinates. */
export function MotionPrintOverlapElasticDemo() {
  const [overlap, setOverlap] = useState(12);
  const rightEdge = 120 - overlap;
  const combinedWidth = 200 - overlap;
  return (
    <PrintStudy
      id="panel-overlap"
      place="Mendoza"
      title="Where two panels meet"
    >
      <svg
        role="img"
        aria-label={`Mendoza panel study, ${overlap} millimetre overlap and ${combinedWidth} millimetre combined width.`}
        viewBox="0 0 240 160"
        style={sheet}
      >
        <rect
          x="20"
          y="30"
          width="100"
          height="100"
          fill="currentColor"
          opacity="var(--rams-detail-preview-panel-overlap-base-wash)"
        />
        <g
          transform="translate(20 30)"
          fill="none"
          stroke="currentColor"
          strokeWidth="var(--rams-detail-preview-panel-overlap-detail-stroke)"
        >
          <path d="M10 85L85 10M10 65L65 10M30 90L90 30" />
        </g>
        <rect
          data-panel="left"
          x="20"
          y="30"
          width="100"
          height="100"
          fill="none"
          stroke="currentColor"
          strokeWidth="var(--rams-detail-preview-panel-overlap-outline-stroke)"
        />
        <g
          transform={`translate(${rightEdge} 30)`}
          fill="none"
          stroke="currentColor"
          strokeWidth="var(--rams-detail-preview-panel-overlap-detail-stroke)"
        >
          <circle cx="50" cy="50" r="35" />
          <circle cx="50" cy="50" r="20" />
        </g>
        <rect
          data-join-overlap="true"
          x={rightEdge}
          y="30"
          width={overlap}
          height="100"
          fill="currentColor"
          opacity="var(--rams-detail-preview-panel-overlap-joint-wash)"
        />
        <rect
          data-panel="right"
          x={rightEdge}
          y="30"
          width="100"
          height="100"
          fill="none"
          stroke="currentColor"
          strokeWidth="var(--rams-detail-preview-panel-overlap-outline-stroke)"
        />
        <path
          d={`M20 143h${combinedWidth}M20 139v8M${20 + combinedWidth} 139v8`}
          stroke="currentColor"
          strokeWidth="var(--rams-detail-preview-panel-overlap-detail-stroke)"
        />
      </svg>
      <ElasticSlider
        label="Overlap"
        value={overlap}
        onValueChange={setOverlap}
        min={0}
        max={24}
        step={1}
        largeStep={6}
        marks={[0, 6, 12, 18, 24]}
        showValue={false}
        format={(value) => `${value} mm`}
      />
      <output aria-live="polite" style={outputStyle}>
        <span>Overlap: {overlap} mm.</span>
        <span>Combined width: {combinedWidth} mm.</span>
        <span>Two 100 mm panels.</span>
      </output>
    </PrintStudy>
  );
}
