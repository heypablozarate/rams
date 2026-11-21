import { useId, useState } from "react";
import { Input } from "../../primitives/input";
import { Label } from "../../primitives/label";
export function InputDemo() {
  return (
    <Input
      type="text"
      aria-label="Print title"
      placeholder="e.g. Terrace study / 12"
    />
  );
}
export function InputWithLabel() {
  const id = useId();
  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        maxWidth: "var(--rams-detail-preview-field-measure)",
        gap: "var(--rams-detail-space-3)",
      }}
    >
      <Label htmlFor={id}>Edition title</Label>
      <Input id={id} defaultValue="Terrace study / 12" />
    </div>
  );
}
export function InputDisabled() {
  return (
    <Input
      aria-label="Archived edition title"
      value="Paraná grid / 04"
      disabled
      readOnly
    />
  );
}
export function InputFile() {
  const id = useId(),
    [name, setName] = useState("");
  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        maxWidth: "var(--rams-detail-preview-field-measure)",
        gap: "var(--rams-detail-space-3)",
      }}
    >
      <Label htmlFor={id}>Cover artwork</Label>
      <Input
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        onChange={(event) => setName(event.target.files?.[0]?.name ?? "")}
      />
      {name && <p role="status">Selected artwork: {name}</p>}
    </div>
  );
}
