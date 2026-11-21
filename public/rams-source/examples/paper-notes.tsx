"use client";
import { useId, useState } from "react";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Textarea } from "../components/textarea";
import { Label } from "../components/label";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "../components/drawer";
export function PaperNotes() {
  const id = useId(),
    [stock, setStock] = useState("Uncoated / 160 gsm"),
    [note, setNote] = useState("Keep the grain parallel to the spine."),
    [saved, setSaved] = useState<{ stock: string; note: string } | null>(null),
    [open, setOpen] = useState(false);
  return (
    <main
      style={{
        maxWidth: "var(--rams-detail-example-page-measure-single)",
        marginInline: "auto",
        padding: "var(--rams-detail-example-page-inset)",
        color: "var(--rams-ink)",
        fontSize: "var(--type-body-size)",
        lineHeight: "var(--type-body-leading)",
        overflowWrap: "anywhere",
      }}
    >
      <p>Paper desk · Santa Fe</p>
      <h1 className="rams-editorial-title">Notes for the next fold</h1>
      <p>Review the stock and binding note before folding the cover.</p>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline">Edit paper note</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Cover stock</DrawerTitle>
            <DrawerDescription>
              Keep paper weight and grain direction with the edition.
            </DrawerDescription>
          </DrawerHeader>
          <form
            style={{
              display: "grid",
              gap: "var(--rams-detail-preview-scene-gap)",
              maxWidth: "var(--rams-detail-example-paper-note-form-measure)",
              width: "100%",
              marginInline: "auto",
            }}
            onSubmit={(event) => {
              event.preventDefault();
              setSaved({ stock, note });
              setOpen(false);
            }}
          >
            <Label htmlFor={id + "-stock"}>Paper specification</Label>
            <Input
              id={id + "-stock"}
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              required
            />
            <Label htmlFor={id + "-note"}>Binding note</Label>
            <Textarea
              id={id + "-note"}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              required
            />
            <DrawerFooter>
              <DrawerClose asChild>
                <Button type="button" variant="outline">
                  Keep editing later
                </Button>
              </DrawerClose>
              <Button type="submit">Keep paper note</Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
      <section aria-live="polite">
        {saved && (
          <>
            <h2>Paper note</h2>
            <p>{saved.stock}</p>
            <p>{saved.note}</p>
          </>
        )}
      </section>
    </main>
  );
}
