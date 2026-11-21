import { useRef, useState, type ReactNode } from "react";
import { Button } from "../../primitives/button";
import { Toggle } from "../../primitives/toggle";
import * as G from "../../primitives/button-group";
import * as M from "../../primitives/dropdown-menu";
import { ScrollArea } from "../../primitives/scroll-area";

const actionLayout = {
  width: "100%",
  maxWidth: "var(--rams-detail-preview-measure-full)",
  display: "grid",
  gap: "var(--rams-detail-docs-space-standard)",
};

function ActionStrip({
  label,
  children,
  wrap = false,
}: {
  label: string;
  children: ReactNode;
  wrap?: boolean;
}) {
  return (
    <ScrollArea
      scrollbars="horizontal"
      type="auto"
      style={{ width: "100%", maxWidth: "var(--rams-detail-preview-measure-full)" }}
      viewportProps={{ "aria-label": label }}
    >
      <div
        style={{
          width: wrap ? "100%" : "max-content",
          minWidth: 0,
          padding: "var(--rams-detail-docs-space-tight)",
          paddingBlockEnd: "calc(var(--rams-detail-docs-space-tight) + var(--rams-detail-button-group-preview-scroll-reserve))",
        }}
      >
        {children}
      </div>
    </ScrollArea>
  );
}
function UndoGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 5 4 10l5 5M4 10h10a5 5 0 0 1 0 10"
        stroke="currentColor"
        strokeWidth="var(--rams-detail-preview-button-group-glyph-stroke)"
      />
    </svg>
  );
}
const initialProof = { kept: false, archived: false };
export function ButtonGroupDemo() {
  const [state, setState] = useState({
      current: initialProof,
      history: [] as (typeof initialProof)[],
    }),
    keep = useRef<HTMLButtonElement>(null);
  function change(key: "kept" | "archived") {
    setState((previous) => ({
      history: [...previous.history, previous.current],
      current: { ...previous.current, [key]: !previous.current[key] },
    }));
  }
  function undo() {
    if (state.history.length === 1)
      keep.current?.focus({ preventScroll: true });
    setState((previous) =>
      previous.history.length
        ? {
            current: previous.history.at(-1)!,
            history: previous.history.slice(0, -1),
          }
        : previous,
    );
  }
  return (
    <div style={actionLayout}>
      <ActionStrip label="Edition action controls">
        <G.ButtonGroup aria-label="Edition actions">
          <Button
            variant="outline"
            size="icon"
            aria-label="Undo edition action"
            disabled={!state.history.length}
            onClick={undo}
          >
            <UndoGlyph />
          </Button>
          <Toggle
            ref={keep}
            variant="outline"
            pressed={state.current.kept}
            onPressedChange={() => change("kept")}
          >
            Shortlist
          </Toggle>
          <Button variant="outline" onClick={() => change("archived")}>
            {state.current.archived ? "Queue" : "Archive"}
          </Button>
        </G.ButtonGroup>
      </ActionStrip>
      <section aria-label="Current edition">
        <h3>Terrace / 12</h3>
        <p>
          {state.current.kept ? "On the shortlist" : "Not shortlisted"} ·{" "}
          {state.current.archived ? "Archived" : "In the print queue"}
        </p>
      </section>
    </div>
  );
}
function SheetCounter({
  label,
  size = "default",
  orientation = "horizontal",
}: {
  label: string;
  size?: "sm" | "default" | "lg";
  orientation?: "horizontal" | "vertical";
}) {
  const [count, setCount] = useState(12),
    minus = useRef<HTMLButtonElement>(null),
    plus = useRef<HTMLButtonElement>(null);
  function change(delta: number) {
    const next = Math.max(1, Math.min(24, count + delta));
    if (next === 1 && document.activeElement === minus.current)
      plus.current?.focus({ preventScroll: true });
    if (next === 24 && document.activeElement === plus.current)
      minus.current?.focus({ preventScroll: true });
    setCount(next);
  }
  return (
    <div style={{ display: "grid", gap: "var(--rams-detail-docs-space-tight)", justifyItems: "start" }}>
      <p>{label}</p>
      <G.ButtonGroup
        orientation={orientation}
        aria-label={label + " sheet count"}
      >
        <Button
          ref={minus}
          variant="outline"
          size={size}
          aria-label="Remove one sheet"
          disabled={count === 1}
          onClick={() => change(-1)}
        >
          -
        </Button>
        <G.ButtonGroupText>
          <output aria-label={label + " count"}>
            {count}
          </output>
        </G.ButtonGroupText>
        <Button
          ref={plus}
          variant="outline"
          size={size}
          aria-label="Add one sheet"
          disabled={count === 24}
          onClick={() => change(1)}
        >
          +
        </Button>
      </G.ButtonGroup>
    </div>
  );
}
export function ButtonGroupSize() {
  return (
    <ActionStrip label="Button size comparison" wrap>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--rams-detail-preview-reading-section-gap)", alignItems: "start" }}>
        <SheetCounter label="Small" size="sm" />
        <SheetCounter label="Default" />
        <SheetCounter label="Large" size="lg" />
      </div>
    </ActionStrip>
  );
}
export function ButtonGroupOrientation() {
  return <SheetCounter label="Vertical" orientation="vertical" />;
}
export function ButtonGroupDropdown() {
  const [kept, setKept] = useState(false),
    [mounted, setMounted] = useState(false),
    [paper, setPaper] = useState("Cotton"),
    [removed, setRemoved] = useState(false),
    keep = useRef<HTMLButtonElement>(null);
  return (
    <div style={actionLayout}>
      <ActionStrip label="Proof action controls">
        <G.ButtonGroup aria-label="Proof actions">
          <Button
            ref={keep}
            variant="outline"
            disabled={removed}
            onClick={() => setKept((value) => !value)}
          >
            {kept ? "Unpin" : "Pin"}
          </Button>
          <M.DropdownMenu>
            <M.DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={removed}>
                Options
              </Button>
            </M.DropdownMenuTrigger>
            <M.DropdownMenuContent>
              <M.DropdownMenuCheckboxItem
                checked={mounted}
                onCheckedChange={(value) => setMounted(value === true)}
              >
                Mount the proof
              </M.DropdownMenuCheckboxItem>
              <M.DropdownMenuSub>
                <M.DropdownMenuSubTrigger>Paper stock</M.DropdownMenuSubTrigger>
                <M.DropdownMenuSubContent>
                  <M.DropdownMenuRadioGroup
                    value={paper}
                    onValueChange={setPaper}
                    aria-label="Proof paper"
                  >
                    {["Cotton", "Linen"].map((value) => (
                      <M.DropdownMenuRadioItem key={value} value={value}>
                        {value}
                      </M.DropdownMenuRadioItem>
                    ))}
                  </M.DropdownMenuRadioGroup>
                </M.DropdownMenuSubContent>
              </M.DropdownMenuSub>
            </M.DropdownMenuContent>
          </M.DropdownMenu>
          <Button
            variant="outline"
            onClick={() => setRemoved((value) => !value)}
          >
            {removed ? "Restore" : "Remove"}
          </Button>
        </G.ButtonGroup>
      </ActionStrip>
      {removed ? (
        <p role="status">Patio / 07 removed from the tray.</p>
      ) : (
        <section aria-label="Proof tray record">
          <h3>Patio / 07</h3>
          <p>
            {paper} · {mounted ? "Mounted" : "Loose proof"} ·{" "}
            {kept ? "Pinned" : "Not pinned"}
          </p>
        </section>
      )}
    </div>
  );
}
