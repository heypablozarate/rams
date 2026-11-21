import { useId, useState } from "react";
import { Switch } from "../../primitives/switch";
import { Label } from "../../primitives/label";

export function SwitchDemo() {
  const id = useId(),
    [included, setIncluded] = useState(true);
  return (
    <div
      style={{
        display: "grid",
        gap: "var(--rams-detail-space-4)",
        maxInlineSize: "var(--rams-detail-preview-measure)",
        inlineSize: "100%",
        minInlineSize: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--rams-detail-space-2)", minInlineSize: 0 }}>
        <Switch id={id} checked={included} onCheckedChange={setIncluded} />
        <Label htmlFor={id}>Include the colophon</Label>
      </div>
      <section
        aria-label="Edition colophon"
        style={{ display: "grid", gap: "var(--rams-detail-space-1)", minInlineSize: 0 }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--type-title-family)",
            fontSize: "var(--type-title-size)",
            lineHeight: "var(--type-title-leading)",
            fontWeight: "var(--type-title-weight)",
          }}
        >
          Trama / 12
        </h3>
        {included && (
          <p
            style={{
              margin: 0,
              fontFamily: "var(--type-body-family)",
              fontSize: "var(--type-body-size)",
              lineHeight: "var(--type-body-leading)",
            }}
          >
            Set and printed in Rosario. Two inks on uncoated paper.
          </p>
        )}
      </section>
    </div>
  );
}
