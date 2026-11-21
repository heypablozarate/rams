import { useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "../../primitives/collapsible";

export function CollapsibleDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      style={{ width: "100%", maxWidth: "var(--rams-detail-preview-measure-wide)" }}
    >
      <CollapsibleTrigger>
        Patio / 07 — production notes
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          style={{
            flex: "none",
            width: "var(--rams-detail-native-inline-glyph-size)",
            height: "var(--rams-detail-native-inline-glyph-size)",
            transform: open ? "var(--rams-detail-disclosure-expanded-glyph-transform)" : "none",
          }}
        >
          <path
            d="m4 6 4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="var(--rams-detail-disclosure-chevron-stroke-width)"
          />
        </svg>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul style={{ display: "grid", gap: "var(--rams-detail-preview-list-gap)", paddingBlockEnd: "var(--rams-detail-preview-content-inset)" }}>
          <li>60 impressions on uncoated stock.</li>
          <li>Two inks, printed from the lightest plate.</li>
          <li>Fold after the second pass has dried.</li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
