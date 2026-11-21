import { useId, useState, type CSSProperties } from "react";
import {
  NativeSelect,
  NativeSelectOption,
  NativeSelectOptGroup,
} from "../../primitives/native-select";
import { Label } from "../../primitives/label";

const selectField: CSSProperties = {
  display: "grid",
  inlineSize: "100%",
  maxInlineSize: "var(--rams-detail-preview-field-measure)",
  gap: "var(--rams-detail-space-3)",
};

export function NativeSelectDemo() {
  const id = useId();
  return (
    <div style={selectField}>
      <Label htmlFor={id}>Paper finish</Label>
      <NativeSelect id={id} defaultValue="uncoated">
        <NativeSelectOption value="uncoated">Uncoated</NativeSelectOption>
        <NativeSelectOption value="linen">Linen</NativeSelectOption>
        <NativeSelectOption value="cotton">Cotton</NativeSelectOption>
      </NativeSelect>
    </div>
  );
}
export function NativeSelectGroups() {
  const id = useId();
  return (
    <div style={selectField}>
      <Label htmlFor={id}>Edition destination</Label>
      <NativeSelect id={id} defaultValue="rosario">
        <NativeSelectOptGroup label="Litoral">
          <NativeSelectOption value="rosario">Rosario</NativeSelectOption>
          <NativeSelectOption value="parana">Paraná</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Cuyo">
          <NativeSelectOption value="mendoza">Mendoza</NativeSelectOption>
          <NativeSelectOption value="san-juan">San Juan</NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    </div>
  );
}
export function NativeSelectInvalid() {
  const id = useId(),
    [value, setValue] = useState("");
  return (
    <div style={selectField}>
      <Label htmlFor={id}>Delivery region</Label>
      <NativeSelect
        id={id}
        value={value}
        required
        aria-invalid={!value || undefined}
        aria-describedby={!value ? id + "-error" : undefined}
        onChange={(event) => setValue(event.target.value)}
      >
        <NativeSelectOption value="" disabled>
          Choose a region
        </NativeSelectOption>
        <NativeSelectOption value="litoral">Litoral</NativeSelectOption>
        <NativeSelectOption value="cuyo">Cuyo</NativeSelectOption>
      </NativeSelect>
      {!value && (
        <p
          id={id + "-error"}
          role="alert"
          style={{
            margin: 0,
            color: "var(--rams-detail-danger)",
            fontSize: "var(--type-caption-size)",
            lineHeight: "var(--type-caption-leading)",
            overflowWrap: "anywhere",
          }}
        >
          Choose the region for this edition.
        </p>
      )}
    </div>
  );
}
export function NativeSelectDisabled() {
  const id = useId();
  return (
    <div style={selectField}>
      <Label htmlFor={id}>Archived paper finish</Label>
      <NativeSelect id={id} disabled defaultValue="uncoated">
        <NativeSelectOption value="uncoated">Uncoated / archived</NativeSelectOption>
      </NativeSelect>
    </div>
  );
}
