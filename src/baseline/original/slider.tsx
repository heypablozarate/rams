"use client";

import { useId, useState } from "react";
import { Label } from "../../primitives/label";
import { Slider } from "../../primitives/slider";

export function SliderDemo() {
  const [coverage, setCoverage] = useState(50);
  const sliderId = useId();
  const labelId = `${sliderId}-label`;

  return (
    <section
      aria-label="Print ink coverage"
      style={{
        display: "grid",
        gap: "var(--rams-detail-space-3)",
        maxInlineSize: "var(--rams-detail-preview-measure-extra-wide)",
        inlineSize: "100%",
      }}
    >
      <div
        style={{
          alignItems: "baseline",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "var(--rams-detail-space-3)",
        }}
      >
        <Label id={labelId}>Ink coverage</Label>
        <output aria-live="polite" htmlFor={sliderId} style={{ fontVariantNumeric: "var(--rams-detail-numeric-column-variant)" }}>
          {coverage}%
        </output>
      </div>
      <Slider
        id={sliderId}
        aria-labelledby={labelId}
        thumbLabels={["Ink coverage"]}
        min={0}
        max={100}
        step={1}
        value={[coverage]}
        onValueChange={(values) => setCoverage(values[0] ?? 50)}
      />
    </section>
  );
}

export default SliderDemo;
