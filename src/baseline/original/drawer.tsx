import { useId, useRef, useState } from "react";
import { Bar, BarChart, XAxis } from "recharts";
import * as D from "../../primitives/drawer";
import * as Dialog from "../../primitives/dialog";
import { Button } from "../../primitives/button";
import { Input } from "../../primitives/input";
import { Textarea } from "../../primitives/textarea";
import { Label } from "../../primitives/label";
import { useCompactSurface } from "../../primitives/use-media-query";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../primitives/chart";
const layout = {
  display: "grid",
  gridTemplateColumns: "minmax(0,1fr)",
  gap: "var(--rams-detail-docs-space-standard)",
  width: "100%",
  maxWidth: "var(--rams-detail-preview-measure-extra-wide)",
} as const;
const recentRuns = [
  { edition: "Folds / 03", sheets: 24 },
  { edition: "Patio / 07", sheets: 48 },
  { edition: "Grid / 14", sheets: 60 },
  { edition: "Sur / 12", sheets: 36 },
  { edition: "Trama / 16", sheets: 84 },
  { edition: "River / 19", sheets: 72 },
];
export function DrawerDemo() {
  const id = useId(),
    [open, setOpen] = useState(false),
    [saved, setSaved] = useState(48),
    [sheets, setSheets] = useState(48),
    minus = useRef<HTMLButtonElement>(null),
    plus = useRef<HTMLButtonElement>(null);
  function change(delta: number) {
    const next = Math.max(24, Math.min(120, sheets + delta));
    if (next === 24 && document.activeElement === minus.current)
      plus.current?.focus();
    if (next === 120 && document.activeElement === plus.current)
      minus.current?.focus();
    setSheets(next);
  }
  return (
    <section style={layout} aria-label="Edition run size">
      <D.Drawer
        open={open}
        onOpenChange={(next) => {
          if (next) setSheets(saved);
          setOpen(next);
        }}
      >
        <D.DrawerTrigger asChild>
          <Button variant="outline">Set run size</Button>
        </D.DrawerTrigger>
        <D.DrawerContent>
          <div style={{ ...layout, marginInline: "auto" }}>
            <D.DrawerHeader>
              <D.DrawerTitle>Patio / 07 run size</D.DrawerTitle>
              <D.DrawerDescription>
                Reserve sheets for the next folded edition.
              </D.DrawerDescription>
            </D.DrawerHeader>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr)",
                gap: "var(--rams-detail-docs-space-standard)",
              }}
            >
              <Label htmlFor={id}>Sheets per edition</Label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "var(--rams-detail-docs-space-standard)",
                }}
              >
                <Button
                  ref={minus}
                  variant="outline"
                  size="icon"
                  aria-label="Remove 12 sheets"
                  disabled={sheets === 24}
                  onClick={() => change(-12)}
                >
                  −
                </Button>
                <output
                  id={id}

                  style={{
                    fontSize: "var(--type-display-size, var(--rams-detail-preview-drawer-count-size-fallback))",
                    lineHeight: "var(--rams-detail-preview-drawer-count-leading)",
                  }}
                >
                  {sheets}
                </output>
                <Button
                  ref={plus}
                  variant="outline"
                  size="icon"
                  aria-label="Add 12 sheets"
                  disabled={sheets === 120}
                  onClick={() => change(12)}
                >
                  +
                </Button>
              </div>
              <p>24–120 sheets, in steps of 12.</p>
              <ChartContainer
                config={{
                  sheets: {
                    label: "Sheets",
                    color: "var(--chart-1,var(--rams-primary))",
                  },
                }}
                style={{ height: "var(--rams-detail-preview-drawer-chart-block-size)", width: "100%" }}
              >
                <BarChart
                  data={recentRuns}
                  accessibilityLayer
                  aria-label="Recent edition runs"
                >
                  <XAxis dataKey="edition" hide />
                  <Bar
                    dataKey="sheets"
                    fill="var(--color-sheets)"
                    isAnimationActive={false}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent nameKey="sheets" />}
                  />
                </BarChart>
              </ChartContainer>
            </div>
            <D.DrawerFooter>
              <Button
                onClick={() => {
                  setSaved(sheets);
                  setOpen(false);
                }}
              >
                Keep run size
              </Button>
              <D.DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </D.DrawerClose>
            </D.DrawerFooter>
          </div>
        </D.DrawerContent>
      </D.Drawer>
      <p role="status">
        Reserved: <span >{saved}</span> sheets
      </p>
    </section>
  );
}
const initialSlip = {
  reference: "PT-07",
  note: "Flat, grain parallel to the long edge.",
};
function packingNoteError(value: string) {
  return value.trim().length < 6
    ? "Write at least six characters; leading and trailing spaces do not count."
    : "";
}
export function DrawerDialog() {
  const id = useId(),
    mobile = useCompactSurface(),
    [drawer, setDrawer] = useState(false),
    [open, setOpen] = useState(false),
    [saved, setSaved] = useState(initialSlip),
    [draft, setDraft] = useState(initialSlip),
    noteControl = useRef<HTMLTextAreaElement>(null);
  function changeOpen(next: boolean) {
    if (next) {
      setDrawer(mobile);
      setDraft(saved);
      noteControl.current?.setCustomValidity("");
    }
    setOpen(next);
  }
  const Root = drawer ? D.Drawer : Dialog.Dialog,
    Trigger = drawer ? D.DrawerTrigger : Dialog.DialogTrigger,
    Content = drawer ? D.DrawerContent : Dialog.DialogContent,
    Header = drawer ? D.DrawerHeader : Dialog.DialogHeader,
    Title = drawer ? D.DrawerTitle : Dialog.DialogTitle,
    Description = drawer ? D.DrawerDescription : Dialog.DialogDescription,
    Footer = drawer ? D.DrawerFooter : Dialog.DialogFooter,
    Close = drawer ? D.DrawerClose : Dialog.DialogClose;
  return (
    <section style={layout} aria-label="Packing slip">
      <Root open={open} onOpenChange={changeOpen}>
        <Trigger asChild>
          <Button variant="outline">Edit packing slip</Button>
        </Trigger>
        <Content>
          <Header>
            <Title>Edit packing slip</Title>
            <Description>
              Set the reference and packing instruction printed with the
              edition.
            </Description>
          </Header>
          <form
            style={layout}
            onSubmit={(event) => {
              event.preventDefault();
              const error = packingNoteError(draft.note);
              if (error) {
                noteControl.current?.setCustomValidity(error);
                noteControl.current?.focus();
                noteControl.current?.reportValidity();
                return;
              }
              setSaved({
                reference: draft.reference.trim(),
                note: draft.note.trim(),
              });
              setOpen(false);
            }}
          >
            <Label htmlFor={id + "-reference"}>Edition reference</Label>
            <Input
              id={id + "-reference"}
              required
              pattern="[A-Z]{2}-[0-9]{2}"
              title="Use two uppercase letters, a hyphen and two digits."
              value={draft.reference}
              onChange={(event) =>
                setDraft({ ...draft, reference: event.target.value })
              }
              aria-describedby={id + "-reference-help"}
            />
            <p id={id + "-reference-help"}>
              Use two uppercase letters, a hyphen and two digits.
            </p>
            <Label htmlFor={id + "-note"}>Packing instruction</Label>
            <Textarea
              ref={noteControl}
              id={id + "-note"}
              required
              minLength={6}
              value={draft.note}
              onChange={(event) => {
                event.currentTarget.setCustomValidity(
                  packingNoteError(event.target.value),
                );
                setDraft({ ...draft, note: event.target.value });
              }}
              aria-describedby={id + "-note-help"}
            />
            <p id={id + "-note-help"}>
              Use at least six characters; leading and trailing spaces do not
              count.
            </p>
            <Footer>
              <Button type="submit">Keep packing slip</Button>
              <Close asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Close>
            </Footer>
          </form>
        </Content>
      </Root>
      <section aria-label="Current packing slip">
        <h3>{saved.reference}</h3>
        <p>{saved.note}</p>
      </section>
    </section>
  );
}
