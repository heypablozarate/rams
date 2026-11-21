import { useState } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "../../primitives/alert-dialog";
import { Button } from "../../primitives/button";

export function AlertDialogDemo() {
  const [trial, setTrial] = useState(1),
    [marks, setMarks] = useState(true);
  return (
    <div
      style={{ display: "grid", gap: "var(--rams-detail-docs-space-standard)", maxWidth: "var(--rams-detail-preview-measure)", width: "100%" }}
    >
      <p>Colour trial {String(trial).padStart(2, "0")} / Rosario</p>
      <svg
        role="img"
        aria-label={
          marks
            ? "Current trial: three ink placements"
            : "New trial: an empty sheet"
        }
        viewBox="0 0 240 100"
        style={{ width: "100%", height: "auto" }}
      >
        <rect
          width="240"
          height="100"
          fill="var(--muted,var(--rams-subtle,var(--rams-detail-native-muted-fill-fallback)))"
        />
        {marks && (
          <g fill="var(--rams-brand-accent,var(--rams-control-selected,var(--primary,var(--rams-primary,var(--rams-detail-native-content-ink-fallback)))))">
            <rect x="20" y="20" width="48" height="60" />
            <circle cx="116" cy="50" r="30" />
            <path d="m168 80 26-60 26 60Z" />
          </g>
        )}
      </svg>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Start a fresh trial</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace this colour trial?</AlertDialogTitle>
            <AlertDialogDescription>
              The current ink placements will be cleared from this sheet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep trial</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => {
                  setTrial((value) => value + 1);
                  setMarks(false);
                }}
              >
                Start new trial
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
