"use client";

import * as React from "react";
import { useState } from "react";
import { rangeHistogramGeometry } from "@/primitives/range-histogram-geometry";
import { RangeHistogramSlider } from "@/variants/vendor/registry/components/range-histogram-slider/range-histogram-slider";
import { ScrubInput } from "@/variants/vendor/registry/components/scrub-input/scrub-input";
import { PhoneInput } from "@/variants/vendor/registry/components/phone-input/phone-input";
import { MoneyInput } from "@/variants/vendor/registry/components/money-input/money-input";
import { colorPickerPalette } from "@/primitives/color-picker-palette";
import { ColorPicker, type ColorSwatch } from "@/variants/vendor/registry/components/color-picker/color-picker";

const sceneStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  width: "100%",
  maxWidth: "var(--rams-detail-preview-print-scene-measure)",
  minWidth: 0,
  gap: "var(--rams-detail-space-4, var(--rams-detail-preview-scene-gap))",
  marginInline: "auto",
  color: "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))",
  fontSize: "var(--type-body-size, var(--rams-detail-native-body-size-fallback))",
  lineHeight: "var(--rams-detail-preview-print-scene-leading)",
};

const noteStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))",
  fontSize: "var(--type-caption-size, var(--rams-detail-preview-print-scene-caption-size-fallback))",
  lineHeight: "var(--type-caption-leading)",
};

function Scene({ title, place, children }: { title: string; place: string; children: React.ReactNode }) {
  return (
    <section style={sceneStyle} aria-label={`${place}: ${title}`}>
      <header>
        <p style={{ ...noteStyle, marginBottom: "var(--rams-detail-preview-kicker-gap)" }}>{place} · print room</p>
        <h2 style={{ margin: 0, fontSize: "var(--type-title-size, var(--rams-detail-preview-print-scene-title-size-fallback))", fontWeight: "var(--type-title-weight)", lineHeight: "var(--type-title-leading)", letterSpacing: "var(--type-title-tracking)" }}>{title}</h2>
      </header>
      {children}
    </section>
  );
}

const trimOffsets = [0.05, 0.08, 0.09, 0.12, 0.14, 0.17, 0.18, 0.19, 0.21, 0.23, 0.25, 0.27, 0.29, 0.32, 0.34, 0.37, 0.41, 0.46, 0.53, 0.62];

export function PrintTrimRangeHistogramDemo() {
  const [range, setRange] = useState<[number, number]>([0.1, 0.4]);
  const count = trimOffsets.filter((sample) => sample >= range[0] && sample <= range[1]).length;
  return (
    <Scene title="Trim-edge sample range" place="Córdoba">
      <RangeHistogramSlider
        label="Absolute trim-mark deviation"
        data={trimOffsets}
        min={0}
        max={0.7}
        step={0.05}
        bins={rangeHistogramGeometry.trimPreviewBinCount}
        snapToBins={false}
        value={range}
        onValueChange={setRange}
        format={(value) => `${value.toFixed(2)} mm`}
        thumbLabels={["Lower deviation", "Upper deviation"]}
      />
      <p style={noteStyle} aria-live="polite">{count} of {trimOffsets.length} sample marks fall in the selected interval.</p>
      <p style={noteStyle}>Sample worksheet values in millimetres; this view describes the sample and does not define an acceptable range.</p>
    </Scene>
  );
}

export function PrintTrimAllowanceScrubDemo() {
  const [allowance, setAllowance] = useState(3);
  const usableWidth = 320 - 2 * allowance;
  return (
    <Scene title="Sheet trim allowance" place="Mendoza">
      <ScrubInput
        label="Allowance per edge"
        value={allowance}
        onValueChange={setAllowance}
        min={0}
        max={12}
        step={0.5}
        fineStep={0.1}
        coarseStep={5}
        precision={1}
        units={["mm"]}
        defaultUnit="mm"
        resetValue={3}
        track
        pointerLock={false}
      />
      <p style={noteStyle} aria-live="polite">320 mm sheet − 2 × {allowance.toFixed(1)} mm = {usableWidth.toFixed(1)} mm usable width.</p>
      <p style={noteStyle}>Planning calculation for one sample sheet; the allowance is applied to both edges.</p>
    </Scene>
  );
}

export function PrintWorkshopPhoneInputDemo() {
  const [value, setValue] = useState("");
  const note: React.CSSProperties = {
    margin: 0,
    color: "var(--rams-detail-text-muted)",
    fontSize: "var(--type-caption-size)",
    lineHeight: "var(--type-caption-leading)",
  };
  return (
    <section
      aria-label="Rosario: Workshop number formatting"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        inlineSize: "100%",
        maxInlineSize: "var(--rams-detail-numeric-scene-measure)",
        minInlineSize: 0,
        gap: "var(--rams-detail-space-4)",
        marginInline: "auto",
        color: "var(--rams-detail-foreground)",
        fontSize: "var(--type-body-size)",
        lineHeight: "var(--type-body-leading)",
      }}
    >
      <header>
        <p style={{ ...note, marginBlockEnd: "var(--rams-detail-preview-kicker-gap)" }}>Rosario · print room</p>
        <h2
          style={{
            margin: 0,
            fontSize: "var(--type-title-size)",
            fontWeight: "var(--type-title-weight)",
            lineHeight: "var(--type-title-leading)",
            letterSpacing: "var(--type-title-tracking)",
          }}
        >
          Workshop number formatting
        </h2>
      </header>
      <PhoneInput
        label="Sample phone number"
        value={value}
        onValueChange={setValue}
        defaultCountry="AR"
        preferredCountries={["AR", "CL", "BR"]}
        validate={false}
        description="Optional entry for a local formatting preview. The number is not verified and no call is placed."
      />
      <p style={note} aria-live="polite">{value ? "A number is entered for formatting preview only." : "No number entered."}</p>
    </section>
  );
}

const arsDigits = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).resolvedOptions().maximumFractionDigits ?? 2;
const arsScale = 10 ** arsDigits;
const worksheetBudget = 500_000;

export function PrintStockCostMoneyInputDemo() {
  const [amount, setAmount] = useState<number | null>(125_000 * arsScale);
  const enteredMajor = amount === null ? 0 : amount / arsScale;
  const remaining = worksheetBudget - enteredMajor;
  const formatARS = (value: number) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: arsDigits }).format(value);
  return (
    <Scene title="Stock-cost worksheet" place="La Plata">
      <MoneyInput
        label="Paper and ink allocation"
        value={amount}
        onValueChange={setAmount}
        currency="ARS"
        locale="es-AR"
        currencies={["ARS"]}
        quickAdd={[10_000, 25_000]}
        min={0}
        max={worksheetBudget * arsScale}
        description="Fictional planning amount in Argentine pesos; this worksheet is not a price offer."
      />
      <p style={noteStyle} aria-live="polite">{amount === null ? `No allocation entered. Worksheet budget: ${formatARS(worksheetBudget)}.` : `Worksheet budget: ${formatARS(worksheetBudget)} · remaining: ${formatARS(remaining)}.`}</p>
    </Scene>
  );
}

const proofPaper = colorPickerPalette.proofPaper;
const inkSwatches: ColorSwatch[] = [
  { id: "deep-ink", color: colorPickerPalette.deepInk },
  { id: "river-blue", color: colorPickerPalette.riverBlue },
  { id: "poster-vermilion", color: colorPickerPalette.posterVermilion },
];

export function PrintInkColorPickerDemo() {
  const [value, setValue] = useState(inkSwatches[0].color);
  const [swatches, setSwatches] = useState<ColorSwatch[]>(inkSwatches);
  return (
    <Scene title="Ink proof swatches" place="Buenos Aires">
      <ColorPicker
        label="Proof ink"
        value={value}
        onValueChange={setValue}
        background={proofPaper}
        swatches={swatches}
        onSwatchesChange={setSwatches}
        defaultFormat="hex"
      />
      <p style={noteStyle} aria-live="polite">Selected sample ink: <code>{value}</code></p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, var(--rams-detail-preview-color-swatch-column-min)), 1fr))", gap: "var(--rams-detail-space-2, calc(var(--rams-detail-preview-space-step-fallback) * 2))", minWidth: 0 }} aria-label="Original sample ink values">
        {inkSwatches.map((swatch) => (
          <div key={swatch.id} style={{ minWidth: 0 }}>
            <span aria-hidden="true" style={{ display: "block", height: "var(--rams-detail-preview-color-swatch-strip-block)", background: swatch.color, border: "var(--rams-detail-primitive-border-width) solid currentColor" }} />
            <span style={noteStyle}>{swatch.id.replaceAll("-", " ")} · {swatch.color}</span>
          </div>
        ))}
      </div>
      <p style={{ ...noteStyle, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--rams-detail-preview-color-paper-gap)" }}><span aria-hidden="true" style={{ width: "var(--rams-detail-preview-color-paper-chip-size)", height: "var(--rams-detail-preview-color-paper-chip-size)", background: proofPaper, border: "var(--rams-detail-primitive-border-width) solid currentColor" }} />Paper {proofPaper}</p>
      <p style={noteStyle}>The grade applies to this digital text/background pair, not the full interface or print output.</p>
    </Scene>
  );
}
