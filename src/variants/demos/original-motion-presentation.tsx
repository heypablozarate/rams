import { useState, useRef, useLayoutEffect, type ReactNode } from "react";
import { Progress } from "@/variants/vendor/registry/components/progress/progress";
import { Skeleton } from "@/variants/vendor/registry/components/skeleton/skeleton";
import { Badge } from "@/variants/vendor/registry/components/badge/badge";
import { EmptyState } from "@/variants/vendor/registry/components/empty-state/empty-state";
import { Button } from "@/primitives/button";
import { Checkbox } from "@/primitives/checkbox";
import { Label } from "@/primitives/label";
function PresentationExample({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gap: "var(--rams-detail-preview-section-gap)",
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure)",
        minWidth: 0,
        marginInline: "auto",
        fontSize: "var(--type-control-size)",
        color: "var(--foreground,var(--rams-ink))",
      }}
    >
      {children}
    </div>
  );
}
function CoverArtwork() {
  return (
    <svg
      viewBox="0 0 280 180"
      role="img"
      aria-label="Patio 10 cover, a folded river study"
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        background: "var(--muted,var(--rams-subtle))",
        color: "inherit",
      }}
    >
      <rect
        x="48"
        y="18"
        width="184"
        height="144"
        fill="none"
        stroke="currentColor"
      />
      <path
        d="M70 122c22-70 44 20 66-50s44 20 66-30"
        fill="none"
        stroke="currentColor"
        strokeWidth="var(--rams-detail-preview-folded-cover-contour-stroke)"
      />
      <text x="68" y="49" fill="currentColor" fontSize="var(--rams-detail-preview-folded-cover-label-size)">
        PATIO / 10
      </text>
    </svg>
  );
}
const proofChecks = ["Stock selected", "Ink proof checked", "Fold scored"];
export function ProgressDemo() {
  const [checked, setChecked] = useState([false, false, false]);
  const complete = checked.filter(Boolean).length;
  return (
    <PresentationExample>
      <Progress
        label="Cover checks"
        value={complete}
        max={proofChecks.length}
        showValue
      />
      <div style={{ display: "grid", gap: "var(--rams-detail-preview-element-gap)" }}>
        {proofChecks.map((copy, index) => (
          <Label
            key={copy}
            style={{ display: "flex", alignItems: "start", gap: "var(--rams-detail-preview-element-gap)" }}
          >
            <Checkbox
              checked={checked[index]}
              onCheckedChange={(value) =>
                setChecked((current) =>
                  current.map((state, i) =>
                    i === index ? value === true : state,
                  ),
                )
              }
            />
            {copy}
          </Label>
        ))}
      </div>
    </PresentationExample>
  );
}
export function SkeletonDemo() {
  const [loading, setLoading] = useState(true);
  return (
    <PresentationExample>
      <Skeleton label="Cover specimen placeholder" loading={loading} lines={3}>
        <CoverArtwork />
        <p>Patio / 10 · River study</p>
      </Skeleton>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setLoading((value) => !value)}
      >
        {loading ? "Reveal cover" : "Show placeholder"}
      </Button>
    </PresentationExample>
  );
}
export function BadgeDemo() {
  const [checked, setChecked] = useState(false);
  return (
    <PresentationExample>
      <div
        style={{
          display: "flex",
          gap: "var(--rams-detail-preview-element-gap)",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span>Ink proof / 10</span>
        <Badge tone={checked ? "success" : "neutral"}>
          {checked ? "Checked" : "Unverified"}
        </Badge>
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setChecked((value) => !value)}
      >
        {checked ? "Reopen check" : "Mark checked"}
      </Button>
    </PresentationExample>
  );
}
export function EmptyDemo() {
  const [created, setCreated] = useState(false),
    action = useRef<HTMLButtonElement>(null),
    previous = useRef<HTMLButtonElement | null>(null);
  useLayoutEffect(() => {
    const owner = previous.current;
    previous.current = null;
    if (
      owner &&
      !owner.isConnected &&
      (document.activeElement === document.body ||
        document.activeElement === owner)
    )
      action.current?.focus();
  }, [created]);
  function toggle(owner: HTMLButtonElement) {
    previous.current = owner;
    setCreated((value) => !value);
  }
  return (
    <PresentationExample>
      {created ? (
        <>
          <CoverArtwork />
          <strong>Patio / 10</strong>
          <p>One cover in the rack.</p>
          <Button
            ref={action}
            type="button"
            variant="secondary"
            onClick={(event) => toggle(event.currentTarget)}
          >
            Remove cover
          </Button>
        </>
      ) : (
        <EmptyState
          label="Cover rack"
          title="No covers in the rack"
          description="Add the river study to begin this edition."
          action={
            <Button
              ref={action}
              type="button"
              onClick={(event) => toggle(event.currentTarget)}
            >
              Add cover
            </Button>
          }
        />
      )}
    </PresentationExample>
  );
}
