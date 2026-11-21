import { useState } from "react";
import * as Command from "../../primitives/command";
import { Button } from "../../primitives/button";
const editions = [
  { title: "Barranca / 03", paper: "Cotton / 180 gsm", status: "Ready" },
  { title: "Patio / 07", paper: "Uncoated / 160 gsm", status: "Ready" },
  { title: "River grid / 14", paper: "Linen / 200 gsm", status: "Filed" },
];
function EditionCommands({
  onChoose,
}: {
  onChoose: (edition: (typeof editions)[number]) => void;
}) {
  return (
    <>
      <Command.CommandInput
        aria-label="Find an edition"
        placeholder="Find…"
      />
      <Command.CommandList>
        <Command.CommandEmpty>No matching editions.</Command.CommandEmpty>
        <Command.CommandGroup heading="Rosario print archive">
          {editions.map((edition) => (
            <Command.CommandItem
              key={edition.title}
              value={edition.title}
              disabled={edition.status === "Filed"}
              onSelect={() => onChoose(edition)}
            >
              {edition.title}
            </Command.CommandItem>
          ))}
        </Command.CommandGroup>
      </Command.CommandList>
    </>
  );
}
function ChosenEdition({
  edition,
}: {
  edition: (typeof editions)[number] | null;
}) {
  return edition ? (
    <section aria-label="Chosen edition">
      <h3>{edition.title}</h3>
      <p>{edition.paper}</p>
    </section>
  ) : null;
}
const commandLayout = {
  display: "grid",
  gap: "var(--rams-detail-preview-scene-gap)",
} as const;

export function CommandDemo() {
  const [selected, setSelected] = useState<(typeof editions)[number] | null>(
    null,
  );
  return (
    <div style={{ ...commandLayout, inlineSize: "100%", maxInlineSize: "var(--rams-detail-preview-measure-wide)" }}>
      <Command.Command label="Find a print record">
        <EditionCommands onChoose={setSelected} />
      </Command.Command>
      <ChosenEdition edition={selected} />
    </div>
  );
}
export function CommandDialog() {
  const [open, setOpen] = useState(false),
    [selected, setSelected] = useState<(typeof editions)[number] | null>(null);
  return (
    <div style={commandLayout}>
      <Command.CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Print archive"
        description="Search an edition title to open its paper record."
        trigger={<Button variant="outline">Find a print record</Button>}
      >
        <EditionCommands
          onChoose={(edition) => {
            setSelected(edition);
            setOpen(false);
          }}
        />
      </Command.CommandDialog>
      <ChosenEdition edition={selected} />
    </div>
  );
}
