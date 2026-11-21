import { useId, useState } from "react";
import { Checkbox } from "../../primitives/checkbox";
import { Label } from "../../primitives/label";
import { NativeSelect } from "../../primitives/native-select";

const checkboxRow = {
  display: "flex",
  alignItems: "center",
  gap: "var(--rams-detail-space-3)",
  minInlineSize: 0,
} as const;

export function CheckboxDemo() {
  const id = useId();
  const [selected, setSelected] = useState([true, false]);
  const [tone, setTone] = useState<"accent" | "neutral">("accent");
  const total = selected.filter(Boolean).length;
  return (
    <div
      role="group"
      aria-label="Print sheets"
      style={{
        display: "grid",
        gap: "var(--rams-detail-space-3)",
        inlineSize: "100%",
        minInlineSize: 0,
        maxInlineSize: "var(--rams-detail-preview-measure)",
      }}
    >
      <div style={{ display: "grid", gap: "var(--rams-detail-space-1)", justifySelf: "start", maxInlineSize: "100%" }}>
        <Label htmlFor={id + "-tone"}>Selection tone</Label>
        <NativeSelect id={id + "-tone"} value={tone} onChange={event => setTone(event.target.value as "accent" | "neutral")}>
          <option value="accent">System selection</option>
          <option value="neutral">Surface ink</option>
        </NativeSelect>
      </div>
      <div style={checkboxRow}>
        <Checkbox
          id={id}
          tone={tone}
          checked={total === 2 ? true : total ? "indeterminate" : false}
          onCheckedChange={(value) =>
            setSelected([value === true, value === true])
          }
        />
        <Label htmlFor={id}>Include both print sheets</Label>
      </div>
      {["Terrace / 01", "Courtyard / 02"].map((title, index) => (
        <div key={title} style={checkboxRow}>
          <Checkbox
            id={id + "-" + index}
            tone={tone}
            checked={selected[index]}
            onCheckedChange={(value) =>
              setSelected((current) =>
                current.map((checked, i) =>
                  i === index ? value === true : checked,
                ),
              )
            }
          />
          <Label htmlFor={id + "-" + index}>{title}</Label>
        </div>
      ))}
    </div>
  );
}
export function CheckboxDisabled() {
  const id = useId();
  return (
    <div style={checkboxRow}>
      <Checkbox id={id} defaultChecked disabled />
      <Label htmlFor={id}>Filed print sheet</Label>
    </div>
  );
}
export function CheckboxWithText() {
  const id = useId();
  return (
    <div
      style={{
        ...checkboxRow,
        alignItems: "flex-start",
        maxInlineSize: "var(--rams-detail-preview-measure)",
      }}
    >
      <Checkbox id={id} aria-describedby={id + "-help"} />
      <div style={{ display: "grid", gap: "var(--rams-detail-selection-description-gap)", minInlineSize: 0 }}>
        <Label htmlFor={id}>Include the fold diagram</Label>
        <p
          id={id + "-help"}
          style={{
            margin: 0,
            color: "var(--rams-detail-text-muted)",
            fontFamily: "var(--type-caption-family)",
            fontSize: "var(--type-caption-size)",
            lineHeight: "var(--type-caption-leading)",
          }}
        >
          Add the assembly drawing to this print packet.
        </p>
      </div>
    </div>
  );
}
