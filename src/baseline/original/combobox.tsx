import { useId, useRef, useState } from "react";
import * as Combo from "../../primitives/combobox";
import * as Command from "../../primitives/command";
import * as Popover from "../../primitives/popover";
import * as Drawer from "../../primitives/drawer";
import * as Menu from "../../primitives/dropdown-menu";
import { useCompactSurface } from "../../primitives/use-media-query";
import { Button } from "../../primitives/button";
import { Label } from "../../primitives/label";
import { Badge } from "../../primitives/badge";

const papers = [
  "Cotton / 240 gsm",
  "Uncoated / 180 gsm",
  "Linen / 200 gsm",
  "Recycled / 170 gsm",
];
const archive = [
  "Barranca / 03",
  "Patio / 07",
  "River grid / 14",
  "Terrace / 12",
];
function ArchiveChoices({ onChoose }: { onChoose: (value: string) => void }) {
  return (
    <Command.Command label="Rosario editions">
      <Command.CommandInput
        aria-label="Find an edition"
        placeholder="Search edition titles…"
      />
      <Command.CommandList>
        <Command.CommandEmpty>No matching editions.</Command.CommandEmpty>
        <Command.CommandGroup heading="Rosario editions">
          {archive.map((title) => (
            <Command.CommandItem
              key={title}
              value={title}
              onSelect={() => onChoose(title)}
            >
              {title}
            </Command.CommandItem>
          ))}
        </Command.CommandGroup>
      </Command.CommandList>
    </Command.Command>
  );
}

const fieldLayout = {
  display: "grid",
  gap: "var(--rams-detail-preview-element-gap)",
  inlineSize: "100%",
  maxInlineSize: "var(--rams-detail-preview-measure)",
} as const;

export function ComboboxDemo() {
  const id = useId(),
    [paper, setPaper] = useState<string | null>(papers[0]);
  return (
    <div style={fieldLayout}>
      <Label htmlFor={id}>Paper stock</Label>
      <Combo.Combobox items={papers} value={paper} onValueChange={setPaper}>
        <Combo.ComboboxInput
          id={id}
          placeholder="Find a paper stock"
          showClear
        />
        <Combo.ComboboxContent aria-label="Available paper stocks">
          <Combo.ComboboxEmpty>No matching stocks.</Combo.ComboboxEmpty>
          <Combo.ComboboxList>
            {(item: string) => (
              <Combo.ComboboxItem key={item} value={item}>
                {item}
              </Combo.ComboboxItem>
            )}
          </Combo.ComboboxList>
        </Combo.ComboboxContent>
      </Combo.Combobox>
    </div>
  );
}

export function ComboboxResponsive() {
  const id = useId(),
    isMobile = useCompactSurface(),
    [mobilePresentation, setMobilePresentation] = useState(false),
    [open, setOpen] = useState(false),
    [selected, setSelected] = useState<string | null>(null);
  function changeOpen(next: boolean) {
    if (next) setMobilePresentation(isMobile);
    setOpen(next);
  }
  function choose(value: string) {
    setSelected(value);
    setOpen(false);
  }
  const trigger = (
    <Button
      id={id}
      role="combobox"
      aria-label="Edition"
      aria-expanded={open}
      variant="outline"
    >
      {selected ?? "Choose an edition"}
    </Button>
  );
  return (
    <div style={fieldLayout}>
      <Label htmlFor={id}>Edition</Label>
      {mobilePresentation ? (
        <Drawer.Drawer open={open} onOpenChange={changeOpen}>
          <Drawer.DrawerTrigger asChild>{trigger}</Drawer.DrawerTrigger>
          <Drawer.DrawerContent>
            <Drawer.DrawerHeader>
              <Drawer.DrawerTitle>Choose an edition</Drawer.DrawerTitle>
              <Drawer.DrawerDescription>
                Search the Rosario print archive.
              </Drawer.DrawerDescription>
            </Drawer.DrawerHeader>
            <ArchiveChoices onChoose={choose} />
          </Drawer.DrawerContent>
        </Drawer.Drawer>
      ) : (
        <Popover.Popover open={open} onOpenChange={changeOpen}>
          <Popover.PopoverTrigger asChild>{trigger}</Popover.PopoverTrigger>
          <Popover.PopoverContent
            aria-label="Choose an edition"
            style={{
              width: "var(--radix-popover-trigger-width)",
              maxWidth: "var(--radix-popover-content-available-width)",
            }}
          >
            <ArchiveChoices onChoose={choose} />
          </Popover.PopoverContent>
        </Popover.Popover>
      )}
    </div>
  );
}

export function ComboboxDropdownMenu() {
  const trigger = useRef<HTMLButtonElement>(null),
    openingPalette = useRef(false),
    [editing, setEditing] = useState(false),
    [paper, setPaper] = useState<string | null>(null);
  return (
    <div style={{ ...fieldLayout, gap: "var(--rams-detail-preview-scene-gap)" }}>
      <p>Patio / 07</p>
      <div>
        {paper ? (
          <Badge variant="secondary">{paper}</Badge>
        ) : (
          <span>No paper label</span>
        )}
      </div>
      <Menu.DropdownMenu>
        <Menu.DropdownMenuTrigger asChild>
          <Button ref={trigger} variant="outline">
            Record actions
          </Button>
        </Menu.DropdownMenuTrigger>
        <Menu.DropdownMenuContent
          onCloseAutoFocus={(event) => {
            if (openingPalette.current) {
              event.preventDefault();
              openingPalette.current = false;
            }
          }}
        >
          <Menu.DropdownMenuItem
            onSelect={() => {
              openingPalette.current = true;
              setEditing(true);
            }}
          >
            Assign a paper label…
          </Menu.DropdownMenuItem>
          <Menu.DropdownMenuItem
            disabled={!paper}
            onSelect={() => setPaper(null)}
          >
            Clear paper label
          </Menu.DropdownMenuItem>
        </Menu.DropdownMenuContent>
      </Menu.DropdownMenu>
      <Command.CommandDialog
        open={editing}
        onOpenChange={setEditing}
        title="Paper labels"
        description="Choose the stock attached to this print record."
        contentProps={{
          onCloseAutoFocus: (event) => {
            event.preventDefault();
            const active = document.activeElement;
            if (active === document.body || !active?.isConnected)
              trigger.current?.focus({ preventScroll: true });
          },
        }}
      >
        <Command.CommandInput
          aria-label="Find a paper label"
          placeholder="Search paper labels…"
        />
        <Command.CommandList>
          <Command.CommandEmpty>No matching labels.</Command.CommandEmpty>
          <Command.CommandGroup heading="Paper stocks">
            {papers.map((item) => (
              <Command.CommandItem
                key={item}
                value={item}
                onSelect={() => {
                  setPaper(item);
                  setEditing(false);
                }}
              >
                {item}
              </Command.CommandItem>
            ))}
          </Command.CommandGroup>
        </Command.CommandList>
      </Command.CommandDialog>
    </div>
  );
}
