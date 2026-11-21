import { useId, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../../primitives/popover";
import { Button } from "../../primitives/button";
import { Checkbox } from "../../primitives/checkbox";
import { Label } from "../../primitives/label";

export function PopoverDemo() {
  const id = useId(),
    [grain, setGrain] = useState(true),
    [trim, setTrim] = useState(false);
  return (
    <div
      style={{ display: "grid", gap: "var(--rams-detail-docs-space-standard)", width: "100%", maxWidth: "var(--rams-detail-preview-measure-narrow)" }}
    >
      <svg
        role="img"
        aria-label="Print sheet and enabled production marks"
        viewBox="0 0 240 120"
        style={{ width: "100%", height: "auto" }}
      >
        <rect
          x="10"
          y="10"
          width="220"
          height="100"
          fill="var(--muted, var(--rams-subtle, var(--rams-detail-native-muted-fill-fallback)))"
        />
        {grain && (
          <path
            data-print-mark="grain"
            d="M120 90V30m-8 12 8-12 8 12"
            fill="none"
            stroke="var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))"
            strokeWidth="var(--rams-detail-preview-plate-line-stroke)"
          />
        )}
        {trim && (
          <path
            data-print-mark="trim"
            d="M0 20h8M20 0v8m200-8v8m12 12h8M0 100h8m12 12v8m200-8v8m12-20h8"
            fill="none"
            stroke="var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))"
            strokeWidth="var(--rams-detail-preview-plate-line-stroke)"
          />
        )}
      </svg>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Print marks</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Print mark settings">
          <div style={{ display: "grid", gap: "var(--rams-detail-docs-space-standard)" }}>
            <div
              style={{ display: "flex", alignItems: "center", gap: "var(--rams-detail-preview-related-copy-gap)" }}
            >
              <Checkbox
                id={id + "-grain"}
                checked={grain}
                onCheckedChange={(value) => setGrain(value === true)}
              />
              <Label htmlFor={id + "-grain"}>Grain arrow</Label>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "var(--rams-detail-preview-related-copy-gap)" }}
            >
              <Checkbox
                id={id + "-trim"}
                checked={trim}
                onCheckedChange={(value) => setTrim(value === true)}
              />
              <Label htmlFor={id + "-trim"}>Trim corners</Label>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
