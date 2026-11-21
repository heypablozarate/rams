import { contentPresentation } from "@/primitives/content-presentation";
import { useState, type ReactNode } from "react";
import { Input } from "@/variants/vendor/registry/components/input/input";
import { Textarea } from "@/variants/vendor/registry/components/textarea/textarea";
import { Select } from "@/variants/vendor/registry/components/select/select";
import { Switch } from "@/variants/vendor/registry/components/switch/switch";
import { PasswordField } from "@/variants/vendor/registry/components/password-field/password-field";
function FieldExample({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: "var(--rams-detail-preview-field-stack-gap)",
        inlineSize: "100%",
        maxInlineSize: "min(100%, var(--rams-detail-preview-field-compact-measure))",
        marginInline: "auto",
        minInlineSize: 0,
        fontSize: "var(--type-control-size)",
        fontFamily: "inherit",
        color: "var(--rams-detail-foreground)",
      }}
    >
      {children}
    </div>
  );
}
function PlateSpecimen({
  reference,
  marks = true,
}: {
  reference: string;
  marks?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 360 180"
      role="img"
      aria-label={`Plate ${reference}${marks ? " with crop marks" : " without crop marks"}`}
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        color: "var(--rams-detail-foreground)",
        background: "var(--rams-detail-surface-muted)",
      }}
    >
      <rect
        x="32"
        y="32"
        width="296"
        height="116"
        fill="none"
        stroke="currentColor"
      />
      <text
        x="180"
        y="103"
        textAnchor="middle"
        fontSize="var(--rams-detail-preview-plate-reference-type)"
        fill="currentColor"
      >
        {reference}
      </text>
      {marks && (
        <g
          data-proof-marks
          aria-hidden="true"
          stroke="currentColor"
          strokeWidth="var(--rams-detail-preview-plate-crop-stroke)"
        >
          <path d="M20 32h-8m20-12v-8M328 20v-8m12 20h8M20 148h-8m20 12v8m296-8v8m12-20h8" />
        </g>
      )}
    </svg>
  );
}
export function InputDemo() {
  const [value, setValue] = useState("RS-08"),
    [touched, setTouched] = useState(false);
  const valid = /^[A-Z]{2}-[0-9]{2}$/.test(value);
  return (
    <FieldExample>
      <Input
        label="Plate reference"
        value={value}
        maxLength={5}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => setTouched(true)}
        description={`${5 - value.length} characters available`}
        error={
          touched && !valid
            ? "Use two uppercase letters, a hyphen and two digits."
            : undefined
        }
      />
      <PlateSpecimen reference={valid ? value : "Unassigned"} />
    </FieldExample>
  );
}
export function TextareaDemo() {
  const [value, setValue] = useState(
      "Printed in Rosario. Folded along the river.",
    ),
    [touched, setTouched] = useState(false);
  return (
    <FieldExample>
      <Textarea
        label="Edition colophon"
        value={value}
        maxLength={140}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => setTouched(true)}
        rows={contentPresentation.textarea.colophonRows}
        description={`${140 - value.length} characters available`}
        error={
          touched && value.trim().length < 8
            ? "Write at least eight characters for the colophon."
            : undefined
        }
      />
      <figure
        aria-label="Colophon preview"
        style={{ margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
      >
        {value.trim() ? value : "Colophon pending"}
      </figure>
    </FieldExample>
  );
}
const coverStocks = [
  { value: "cotton", label: "Cotton", weight: 240, finish: "Soft grain" },
  {
    value: "recycled",
    label: "Recycled",
    weight: 160,
    finish: "Visible fibres",
  },
  { value: "linen", label: "Linen", weight: 120, finish: "Woven finish" },
];
export function SelectDemo() {
  const [value, setValue] = useState("cotton"),
    stock = coverStocks.find((row) => row.value === value)!;
  return (
    <FieldExample>
      <Select
        label="Cover stock"
        options={coverStocks.map(({ value, label }) => ({ value, label }))}
        value={value}
        onValueChange={setValue}
        description={`${stock.weight} gsm · ${stock.finish}`}
      />
      <div role="group" aria-label="Cover specification">
        Patio / 08 · {stock.label},{" "}
        <span>{stock.weight}</span> gsm
      </div>
    </FieldExample>
  );
}
export function SwitchDemo() {
  const [checked, setChecked] = useState(true);
  return (
    <section
      aria-label="Plate crop marks"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: "var(--rams-detail-space-4)",
        inlineSize: "100%",
        maxInlineSize: "var(--rams-detail-preview-field-measure)",
        minInlineSize: 0,
        marginInline: "auto",
      }}
    >
      <Switch
        label="Crop marks"
        checked={checked}
        onCheckedChange={setChecked}
      />
      <PlateSpecimen reference="RS-08" marks={checked} />
    </section>
  );
}
export function PasswordFieldDemo() {
  const [value, setValue] = useState("ParanaProof27");
  return (
    <FieldExample>
      <PasswordField
        label="Proof passphrase"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        autoComplete="off"
        description={`${value.length} characters in the proof passphrase`}
      />
    </FieldExample>
  );
}
