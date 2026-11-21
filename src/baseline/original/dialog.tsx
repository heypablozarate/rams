import { useId, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../../primitives/dialog";
import { Button } from "../../primitives/button";
import { Checkbox } from "../../primitives/checkbox";
import { Label } from "../../primitives/label";

export function DialogDemo() {
  const id = useId(),
    [open, setOpen] = useState(false),
    [reviewed, setReviewed] = useState(false),
    [saved, setSaved] = useState(false);
  return (
    <div style={{ display: "grid", gap: "var(--rams-detail-docs-space-standard)" }}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Review terrace proof</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review the terrace proof</DialogTitle>
            <DialogDescription>
              Check the two plates before keeping this review.
            </DialogDescription>
          </DialogHeader>
          <svg
            role="img"
            aria-label="Terrace proof: a grid aligned with three stepped blocks"
            viewBox="0 0 240 120"
            style={{ width: "100%", height: "auto" }}
          >
            <rect
              width="240"
              height="120"
              fill="var(--muted,var(--rams-subtle,var(--rams-detail-native-muted-fill-fallback)))"
            />
            <path
              d="M20 100h60V75h60V50h80v50Z"
              fill="var(--foreground,var(--rams-ink,var(--rams-detail-native-content-ink-fallback)))"
            />
            <path
              d="M20 20v80M80 20v80M140 20v80M220 20v80M20 25h200M20 50h200M20 75h200M20 100h200"
              fill="none"
              stroke="var(--rams-brand-accent,var(--rams-control-selected,var(--primary,var(--rams-primary,var(--rams-detail-native-content-ink-fallback)))))"
              strokeWidth="var(--rams-detail-preview-proof-grid-stroke)"
            />
          </svg>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--rams-detail-dialog-choice-label-gap)" }}>
            <Checkbox
              id={id}
              checked={reviewed}
              onCheckedChange={(value) => setReviewed(value === true)}
            />
            <Label htmlFor={id}>The plates are aligned</Label>
          </div>
          <DialogFooter>
            <Button
              disabled={!reviewed}
              onClick={() => {
                setSaved(true);
                setOpen(false);
              }}
            >
              Keep review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {saved && <p role="status">Terrace / 12: plate alignment reviewed.</p>}
    </div>
  );
}
export function DialogCloseButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Read edition brief</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Patio / 07</DialogTitle>
          <DialogDescription>
            Edition brief for the Rosario print room.
          </DialogDescription>
        </DialogHeader>
        <dl style={{ display: "grid", gap: "var(--rams-detail-docs-space-standard)" }}>
          <div>
            <dt>Format</dt>
            <dd>240 × 320 mm</dd>
          </div>
          <div>
            <dt>Paper</dt>
            <dd>Uncoated, 180 gsm</dd>
          </div>
          <div>
            <dt>Impressions</dt>
            <dd>60</dd>
          </div>
        </dl>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close brief</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
