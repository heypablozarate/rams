import { useId, useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "../../primitives/sheet";
import { Button } from "../../primitives/button";
import { Textarea } from "../../primitives/textarea";
import { Label } from "../../primitives/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "../../primitives/native-select";

export function SheetDemo() {
  const id = useId(),
    [open, setOpen] = useState(false),
    [draft, setDraft] = useState(
      "Fold parallel to the grain. Keep the outer edge untrimmed.",
    ),
    [saved, setSaved] = useState("");
  return (
    <div style={{ display: "grid", gap: "var(--rams-detail-docs-space-standard)" }}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline">Edit bindery note</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Bindery note</SheetTitle>
            <SheetDescription>Patio / 07, Rosario print room.</SheetDescription>
          </SheetHeader>
          <form
            id={id + "-form"}
            onSubmit={(event) => {
              event.preventDefault();
              setSaved(draft);
              setOpen(false);
            }}
            style={{
              display: "grid",
              gap: "var(--rams-detail-docs-space-standard)",
              paddingInline: "var(--rams-detail-preview-detail-inset)",
            }}
          >
            <Label htmlFor={id}>Assembly instructions</Label>
            <Textarea
              id={id}
              required
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </form>
          <SheetFooter>
            <Button type="submit" form={id + "-form"}>
              Keep bindery note
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {saved && (
        <section aria-label="Saved bindery note">
          <p>{saved}</p>
        </section>
      )}
    </div>
  );
}
export function SheetSide() {
  const id = useId(),
    [side, setSide] = useState<"left" | "right" | "top" | "bottom">("right");
  return (
    <div
      style={{ display: "grid", gap: "var(--rams-detail-docs-space-standard)", width: "100%", maxWidth: "var(--rams-detail-preview-field-measure)" }}
    >
      <Label htmlFor={id}>Panel direction</Label>
      <NativeSelect
        id={id}
        value={side}
        onChange={(event) => setSide(event.target.value as typeof side)}
      >
        {["left", "right", "top", "bottom"].map((value) => (
          <NativeSelectOption key={value} value={value}>
            {value[0].toUpperCase() + value.slice(1)}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open edition brief</Button>
        </SheetTrigger>
        <SheetContent side={side}>
          <SheetHeader>
            <SheetTitle>Terrace / 12</SheetTitle>
            <SheetDescription>Edition brief</SheetDescription>
          </SheetHeader>
          <p style={{ paddingInline: "var(--rams-detail-preview-detail-inset)" }}>Two plates on cotton stock. Fold the long edge after printing.</p>
        </SheetContent>
      </Sheet>
    </div>
  );
}
