import { useId } from "react";
import { Textarea } from "../../primitives/textarea";
import { Label } from "../../primitives/label";
export function TextareaDemo() {
  return (
    <Textarea
      aria-label="Binding notes"
      placeholder="Describe the fold, grain direction and paper finish."
    />
  );
}
export function TextareaDisabled() {
  return (
    <Textarea
      aria-label="Archived binding note"
      defaultValue="Fold parallel to the grain. Keep the outer edge untrimmed."
      disabled
    />
  );
}
export function TextareaWithLabel() {
  const id = useId();
  return (
    <div
      style={{
        display: "grid",
        inlineSize: "100%",
        maxInlineSize: "var(--rams-detail-preview-measure-wide)",
        gap: "var(--rams-detail-space-3)",
      }}
    >
      <Label htmlFor={id}>Note for the bindery</Label>
      <Textarea
        id={id}
        defaultValue="Use the uncoated sheet for the cover. Keep the orange registration mark outside the trim."
      />
    </div>
  );
}
