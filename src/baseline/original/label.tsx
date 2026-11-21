import { useId } from "react";
import { Label } from "../../primitives/label";
import { Input } from "../../primitives/input";
export function LabelDemo() {
  const id = useId();
  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        maxInlineSize: "var(--rams-detail-preview-field-measure)",
        gap: "var(--rams-detail-space-3)",
      }}
    >
      <Label htmlFor={id}>Print room</Label>
      <Input id={id} defaultValue="Rosario / north desk" />
    </div>
  );
}
