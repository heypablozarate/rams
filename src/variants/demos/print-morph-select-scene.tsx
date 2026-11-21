"use client";

import { useId, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Button } from "@/primitives/button";
import {
  MorphSelect,
  type MorphSelectGroup,
  type MorphSelectOption,
} from "@/variants/vendor/registry/components/morph-select/morph-select";

const stockGroups: MorphSelectGroup[] = [
  {
    label: "La Plata · uncoated",
    options: [
      { value: "laplata140", label: "Natural white", meta: "140 gsm", keywords: "La Plata uncoated natural" },
      { value: "laplata180", label: "Warm white", meta: "180 gsm", keywords: "La Plata uncoated warm" },
      { value: "laplata220", label: "Soft ivory", meta: "220 gsm", keywords: "La Plata uncoated ivory" },
    ],
  },
  {
    label: "Rosario · smooth",
    options: [
      { value: "rosario120", label: "Bright white", meta: "120 gsm", keywords: "Rosario smooth bright" },
      { value: "rosario160", label: "Neutral white", meta: "160 gsm", keywords: "Rosario smooth neutral" },
      { value: "rosario200", label: "Pale cream", meta: "200 gsm", keywords: "Rosario smooth cream" },
    ],
  },
  {
    label: "Córdoba · textured",
    options: [
      { value: "cordoba100", label: "Light natural", meta: "100 gsm", keywords: "Córdoba textured natural" },
      { value: "cordoba140", label: "Natural white", meta: "140 gsm", keywords: "Córdoba textured natural" },
      { value: "cordoba180", label: "Soft white", meta: "180 gsm", keywords: "Córdoba textured white" },
      { value: "cordoba240", label: "Heavy ivory · unavailable", meta: "240 gsm", keywords: "Córdoba textured ivory", disabled: true },
    ],
  },
];

const options = stockGroups.flatMap((group) => group.options);
const optionByValue = new Map(options.map((option) => [option.value, option]));

const sceneStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  width: "100%",
  maxWidth: "var(--rams-detail-preview-print-surface-measure)",
  minWidth: 0,
  gap: "var(--rams-detail-space-4, calc(var(--rams-detail-preview-space-step-fallback) * 4))",
  marginInline: "auto",
  color: "var(--rams-detail-foreground, currentColor)",
  fontSize: "var(--rams-detail-text-base, var(--rams-detail-native-body-size-fallback))",
  lineHeight: "var(--rams-detail-preview-print-scene-leading)",
};

const noteStyle: CSSProperties = {
  margin: 0,
  color: "var(--rams-detail-text-secondary, currentColor)",
  fontSize: "var(--rams-detail-text-sm, var(--rams-detail-preview-print-scene-caption-size-fallback))",
  overflowWrap: "anywhere",
};

const resultStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, var(--rams-detail-preview-morph-select-result-track-min)), 1fr))",
  gap: "var(--rams-detail-space-3, calc(var(--rams-detail-preview-space-step-fallback) * 3))",
  margin: 0,
};

const resultItemStyle: CSSProperties = {
  display: "grid",
  minWidth: 0,
  gap: "var(--rams-detail-space-1, var(--rams-detail-preview-space-step-fallback))",
};

const labelStyle: CSSProperties = {
  color: "var(--rams-detail-text-secondary, currentColor)",
  fontSize: "var(--rams-detail-text-sm, var(--rams-detail-preview-print-scene-caption-size-fallback))",
};

export function PrintMorphSelectScene() {
  const titleId = useId();
  const sceneRef = useRef<HTMLElement>(null);
  const [stockValue, setStockValue] = useState<string | null>(null);
  const selected = stockValue ? optionByValue.get(stockValue) : undefined;
  const details = (() => {
    if (!selected) return null;
    const group = stockGroups.find((entry) => entry.options.includes(selected));
    const gsm = Number(selected.meta?.match(/\d+/)?.[0]);
    if (!group || !Number.isFinite(gsm)) return null;
    return {
      city: group.label.split(" · ")[0],
      gsm,
      massKg: (100 * 0.297 * 0.420 * gsm) / 1000,
    };
  })();

  return (
    <section ref={sceneRef} style={sceneStyle} aria-labelledby={titleId}>
      <header>
        <p style={{ ...noteStyle, marginBottom: "var(--rams-detail-preview-kicker-gap)" }}>Folio 21 · paper worksheet</p>
        <h2
          id={titleId}
          style={{
            margin: 0,
            fontSize: "var(--rams-detail-text-xl, var(--rams-detail-native-title-size-fallback))",
            fontWeight: "var(--rams-detail-preview-morph-select-title-weight)",
            lineHeight: "var(--rams-detail-preview-morph-select-title-leading)",
            overflowWrap: "anywhere",
          }}
        >
          A3 paper allocation
        </h2>
      </header>

      <p style={noteStyle}>
        Choose a sample stock to estimate the paper mass for one hundred A3 sheets.
      </p>

      <MorphSelect
        label="Edition paper stock"
        items={stockGroups}
        value={stockValue}
        onValueChange={(value, _option: MorphSelectOption) => setStockValue(value)}
        placeholder="Choose a paper stock"
        searchable="auto"
        name="paperStock"
      />

      {details && (
        <dl style={resultStyle} aria-live="polite">
          <div style={resultItemStyle}>
            <dt style={labelStyle}>Sample stock location</dt>
            <dd style={{ margin: 0, overflowWrap: "anywhere" }}>{details.city}</dd>
          </div>
          <div style={resultItemStyle}>
            <dt style={labelStyle}>Grammage</dt>
            <dd style={{ margin: 0 }}>{details.gsm} gsm</dd>
          </div>
          <div style={resultItemStyle}>
            <dt style={labelStyle}>100 A3 sheets · estimated mass</dt>
            <dd style={{ margin: 0 }}>{new Intl.NumberFormat("en", { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(details.massKg)} kg</dd>
          </div>
        </dl>
      )}

      <div>
        <Button
          type="button"
          variant="secondary"
          onClick={event => {
            const ownsFocus = document.activeElement === event.currentTarget;
            setStockValue(null);
            if (ownsFocus) sceneRef.current?.querySelector<HTMLButtonElement>('button[role="combobox"]')?.focus({ preventScroll: true });
          }}
          disabled={stockValue === null}
        >
          Clear stock
        </Button>
      </div>
    </section>
  );
}
