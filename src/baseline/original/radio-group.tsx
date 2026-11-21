import { useId, useState, type CSSProperties, type ComponentType } from "react";
import { RadioGroup, RadioGroupItem } from "../../primitives/radio-group";
import { Button } from "../../primitives/button";
import { NativeSelect } from "../../primitives/native-select";
import { RadioGroup as MotionRadioGroup } from "@/variants/vendor/registry/components/radio-group/radio-group";

const patterns = [
  {
    value: "parallel",
    label: "Parallel fold",
    description: "Three panels following the same grain.",
  },
  {
    value: "cross",
    label: "Cross fold",
    description: "Four panels around a central meeting point.",
  },
  {
    value: "gate",
    label: "Gate fold",
    description: "Two narrow leaves open to a wide centre.",
  },
];
const frame: CSSProperties = {
  display: "grid",
  gap: "var(--rams-detail-space-3)",
  minInlineSize: 0,
  maxInlineSize: "var(--rams-detail-preview-measure)",
  inlineSize: "100%",
  marginInline: "auto",
  color: "var(--rams-detail-foreground)",
};
const labelText: CSSProperties = {
  fontFamily: "var(--type-control-family)",
  fontSize: "var(--type-control-size)",
  lineHeight: "var(--type-control-leading)",
  letterSpacing: "var(--type-control-tracking)",
  fontWeight: "var(--rams-detail-label-weight)",
};
const helpText: CSSProperties = {
  color: "var(--rams-detail-text-muted)",
  fontFamily: "var(--type-caption-family)",
  fontSize: "var(--type-caption-size)",
  lineHeight: "var(--type-caption-leading)",
};

function NativeFoldControls({
  value,
  onValueChange,
  tone,
}: {
  value: string;
  onValueChange: (value: string) => void;
  tone?: "accent" | "neutral";
}) {
  const id = useId();
  return (
    <RadioGroup
      aria-label="Fold pattern"
      name="fold-pattern"
      tone={tone}
      value={value}
      onValueChange={onValueChange}
    >
      {patterns.map((item, index) => (
        <label
          key={item.value}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--rams-detail-space-3)",
            padding: "var(--rams-detail-space-2)",
            border: "var(--rams-detail-primitive-border-width) solid var(--rams-detail-border)",
            borderRadius: "var(--radius-control)",
            cursor: "pointer",
          }}
        >
          <RadioGroupItem
            value={item.value}
            aria-labelledby={`${id}-label-${index}`}
            aria-describedby={`${id}-description-${index}`}
          />
          <span style={{ display: "grid", gap: "var(--rams-detail-selection-description-gap)", minInlineSize: 0 }}>
            <strong
              id={`${id}-label-${index}`}
              style={labelText}
            >
              {item.label}
            </strong>
            <span
              id={`${id}-description-${index}`}
              style={helpText}
            >
              {item.description}
            </span>
          </span>
        </label>
      ))}
    </RadioGroup>
  );
}
function MotionFoldControls({
  value,
  onValueChange,
  tone,
}: {
  value: string;
  onValueChange: (value: string) => void;
  tone?: "accent" | "neutral";
}) {
  return (
    <MotionRadioGroup
      label="Fold pattern"
      options={patterns}
      name="fold-pattern"
      tone={tone}
      value={value}
      onValueChange={onValueChange}
    />
  );
}

function FoldStudy({
  Control,
  kind,
}: {
  Control: ComponentType<{
    value: string;
    onValueChange: (value: string) => void;
    tone?: "accent" | "neutral";
  }>;
  kind: "native" | "motion";
}) {
  const [pattern, setPattern] = useState("parallel");
  const [tone, setTone] = useState<"accent" | "neutral">("accent");
  const option = patterns.find((item) => item.value === pattern)!;
  const creases =
    pattern === "cross"
      ? "M180 24v172M36 110h288"
      : pattern === "gate"
        ? "M108 24v172M252 24v172"
        : "M132 24v172M228 24v172";
  return (
    <form
      data-radio-fold-scene={kind}
      style={frame}
      onReset={() => { setPattern("parallel"); setTone("accent"); }}
    >
      <header style={{ display: "grid", gap: "var(--rams-detail-space-1)" }}>
        <span style={helpText}>Buenos Aires / paper studies</span>
        <strong
          style={{
            fontFamily: "var(--type-title-family)",
            fontSize: "var(--type-title-size)",
            lineHeight: "var(--type-title-leading)",
            fontWeight: "var(--type-title-weight)",
          }}
        >
          One sheet, three openings
        </strong>
      </header>
      <svg
        viewBox="0 0 360 220"
        role="img"
        aria-label={`${option.label} diagram: ${option.description}`}
        style={{
          display: "block",
          inlineSize: "100%",
          blockSize: "auto",
          border: "var(--rams-detail-primitive-border-width) solid var(--rams-detail-border)",
          borderRadius: "var(--radius-control)",
          background: "var(--rams-detail-surface)",
        }}
      >
        <g fill="none" stroke="currentColor">
          <rect x="36" y="24" width="288" height="172" />
          <path d="M55 149Q88 71 153 112T299 70" strokeWidth="var(--rams-detail-preview-plate-line-stroke)" />
          <path d="M55 165Q88 87 153 128T299 86" />
          <path d={creases} strokeDasharray="var(--rams-detail-preview-fold-crease-dash)" />
        </g>
        <g fill="currentColor" fontFamily="inherit">
          <text x="54" y="50" fontSize="var(--rams-detail-preview-fold-imprint-size)">
            PAPER STUDY / 03
          </text>
          <text x="54" y="183" fontSize="var(--rams-detail-preview-fold-label-size)">
            {option.label.toUpperCase()}
          </text>
        </g>
      </svg>
      <label style={{ display: "grid", gap: "var(--rams-detail-space-1)", justifySelf: "start", maxInlineSize: "100%" }}>
        <span style={labelText}>Selection tone</span>
        <NativeSelect value={tone} onChange={event => setTone(event.target.value as "accent" | "neutral")}>
          <option value="accent">System selection</option>
          <option value="neutral">Surface ink</option>
        </NativeSelect>
      </label>
      <Control value={pattern} onValueChange={setPattern} tone={tone} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--rams-detail-space-3)",
        }}
      >
        <p role="status" style={{ ...helpText, margin: 0 }}>
          {option.label} · crease lines shown
        </p>
        <Button type="reset" variant="outline">
          Reset fold
        </Button>
      </div>
    </form>
  );
}

export function NativeFoldPatternDemo() {
  return <FoldStudy Control={NativeFoldControls} kind="native" />;
}
export function MotionFoldPatternDemo() {
  return <FoldStudy Control={MotionFoldControls} kind="motion" />;
}
