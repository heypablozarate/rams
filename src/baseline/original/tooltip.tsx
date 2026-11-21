import { useState } from "react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../../primitives/tooltip";
import { Button } from "../../primitives/button";

export function TooltipDemo() {
  const [kept, setKept] = useState(false);
  return (
    <div style={{ display: "grid", justifyItems: "start", gap: "var(--rams-detail-docs-space-standard)" }}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={() => setKept((value) => !value)}
            >
              {kept ? "Remove proof" : "Keep proof"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {kept
              ? "Remove Terrace / 12 from the shortlist."
              : "Add Terrace / 12 to the shortlist."}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <p role="status" style={{ display: "grid", margin: 0 }}>
        <span aria-hidden="true" style={{ gridArea: "1 / 1", visibility: "hidden" }}>Shortlist: Terrace / 12, Rosario.</span>
        <span style={{ gridArea: "1 / 1" }}>{kept ? "Shortlist: Terrace / 12, Rosario." : ""}</span>
      </p>
    </div>
  );
}
