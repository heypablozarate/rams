"use client";
import { useId, useState } from "react";
import { Button } from "../components/button";
import { Label } from "../components/label";
import * as D from "../components/dropdown-menu";
import * as C from "../components/context-menu";
import * as M from "../components/menubar";
import * as N from "../components/navigation-menu";
import * as S from "../components/select";
import * as B from "../components/combobox";
import * as Q from "../components/command";
import "./print-workshop.css";
type Edition = { id: string; title: string; city: string; keyword: string };
const editions: Edition[] = [
  { id: "ronda", title: "Ronda / 17", city: "Córdoba", keyword: "cordoba" },
  { id: "orilla", title: "Orilla / 18", city: "Paraná", keyword: "parana" },
  { id: "andamio", title: "Andamio / 19", city: "La Plata", keyword: "plata" },
];
const stocks = [
  { id: "cotton", label: "Cotton · 240 g/m²" },
  { id: "recycled", label: "Recycled · 170 g/m²" },
  { id: "linen", label: "Linen · 200 g/m²" },
];
type Settings = { stock: string; marks: boolean; archived: boolean };
const defaults: Settings = { stock: "cotton", marks: true, archived: false };
export function PrintWorkshop() {
  const id = useId();
  const [selected, setSelected] = useState<Edition | null>(editions[0]),
    [records, setRecords] = useState<Record<string, Settings>>({}),
    [palette, setPalette] = useState(false),
    [search, setSearch] = useState("");
  const record = selected ? (records[selected.id] ?? defaults) : null;
  function update(patch: Partial<Settings>) {
    if (selected)
      setRecords((previous) => ({
        ...previous,
        [selected.id]: { ...(previous[selected.id] ?? defaults), ...patch },
      }));
  }
  function exportProof() {
    if (!selected || !record) return;
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            { edition: selected.title, city: selected.city, ...record },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      ),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = selected.id + "-proof.json";
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <main className="print-workshop">
      <header>
        <p>Sur Print Archive · Córdoba</p>
        <h1 className="rams-editorial-title">Set up the next edition</h1>
      </header>
      <N.NavigationMenu aria-label="Workshop sections">
        <N.NavigationMenuList>
          <N.NavigationMenuItem>
            <N.NavigationMenuTrigger>Collection</N.NavigationMenuTrigger>
            <N.NavigationMenuContent>
              <div className="workshop-links">
                <N.NavigationMenuLink href="#edition-picker">
                  <strong>Choose an edition</strong>
                  <span>Find a title or city.</span>
                </N.NavigationMenuLink>
                <N.NavigationMenuLink href="#proof-preview">
                  <strong>Inspect the proof</strong>
                  <span>Review its marks and current state.</span>
                </N.NavigationMenuLink>
              </div>
            </N.NavigationMenuContent>
          </N.NavigationMenuItem>
          <N.NavigationMenuItem>
            <N.NavigationMenuTrigger>Production</N.NavigationMenuTrigger>
            <N.NavigationMenuContent>
              <div className="workshop-links">
                <N.NavigationMenuLink href="#paper-stock">
                  <strong>Paper stock</strong>
                  <span>Choose the sheet used for this edition.</span>
                </N.NavigationMenuLink>
                <N.NavigationMenuLink href="#proof-summary">
                  <strong>Edition record</strong>
                  <span>Check the settings included in the export.</span>
                </N.NavigationMenuLink>
              </div>
            </N.NavigationMenuContent>
          </N.NavigationMenuItem>
        </N.NavigationMenuList>
      </N.NavigationMenu>
      <section
        className="workshop-selection"
        aria-label="Edition selection"
        id="edition-picker"
      >
        <Label htmlFor={id + "-edition"}>Edition</Label>
        <B.Combobox
          items={editions}
          value={selected}
          onValueChange={setSelected}
          itemToStringLabel={(edition) => edition.title + " · " + edition.city}
        >
          <B.ComboboxInput
            id={id + "-edition"}
            placeholder="Find a title or city"
            showClear
          />
          <B.ComboboxContent aria-label="Edition choices">
            <B.ComboboxEmpty>No matching editions.</B.ComboboxEmpty>
            <B.ComboboxList>
              {(edition: Edition) => (
                <B.ComboboxItem key={edition.id} value={edition}>
                  {edition.title} · {edition.city}
                </B.ComboboxItem>
              )}
            </B.ComboboxList>
          </B.ComboboxContent>
        </B.Combobox>
      </section>
      <div className="workshop-tools">
        <M.Menubar aria-label="Print desk menus">
          <M.MenubarMenu>
            <M.MenubarTrigger disabled={!selected}>Edition</M.MenubarTrigger>
            <M.MenubarContent>
              <M.MenubarItem onSelect={exportProof}>
                Export proof JSON
              </M.MenubarItem>
              <M.MenubarItem onSelect={() => update(defaults)}>
                Reset edition settings
              </M.MenubarItem>
            </M.MenubarContent>
          </M.MenubarMenu>
          <M.MenubarMenu>
            <M.MenubarTrigger disabled={!selected}>Packing</M.MenubarTrigger>
            <M.MenubarContent>
              <M.MenubarCheckboxItem
                checked={record?.marks ?? false}
                onCheckedChange={(value) => update({ marks: value === true })}
              >
                Include registration marks
              </M.MenubarCheckboxItem>
              <M.MenubarSub>
                <M.MenubarSubTrigger>Paper stock</M.MenubarSubTrigger>
                <M.MenubarSubContent>
                  <M.MenubarRadioGroup
                    aria-label="Packing stock"
                    value={record?.stock ?? ""}
                    onValueChange={(stock) => update({ stock })}
                  >
                    {stocks.map((stock) => (
                      <M.MenubarRadioItem key={stock.id} value={stock.id}>
                        {stock.label}
                      </M.MenubarRadioItem>
                    ))}
                  </M.MenubarRadioGroup>
                </M.MenubarSubContent>
              </M.MenubarSub>
            </M.MenubarContent>
          </M.MenubarMenu>
        </M.Menubar>
        <Q.CommandDialog
          open={palette}
          onOpenChange={(open) => {
            if (open) setSearch("");
            setPalette(open);
          }}
          title="Find a print edition"
          description="Search the edition titles and cities."
          trigger={<Button variant="outline">Find edition</Button>}
        >
          <Q.CommandInput
            placeholder="Title or city"
            value={search}
            onValueChange={setSearch}
          />
          <Q.CommandList label="Edition results">
            <Q.CommandEmpty>No matching editions.</Q.CommandEmpty>
            <Q.CommandGroup heading="Print editions">
              {editions.map((edition) => (
                <Q.CommandItem
                  key={edition.id}
                  value={edition.id}
                  keywords={[edition.title, edition.city, edition.keyword]}
                  onSelect={() => {
                    setSelected(edition);
                    setPalette(false);
                  }}
                >
                  {edition.title} · {edition.city}
                </Q.CommandItem>
              ))}
            </Q.CommandGroup>
          </Q.CommandList>
        </Q.CommandDialog>
        <D.DropdownMenu>
          <D.DropdownMenuTrigger disabled={!selected}>
            Edition actions
          </D.DropdownMenuTrigger>
          <D.DropdownMenuContent>
            <D.DropdownMenuItem
              onSelect={() => update({ archived: !record?.archived })}
            >
              {record?.archived ? "Return edition to desk" : "Archive edition"}
            </D.DropdownMenuItem>
            <D.DropdownMenuItem onSelect={exportProof}>
              Export proof JSON
            </D.DropdownMenuItem>
          </D.DropdownMenuContent>
        </D.DropdownMenu>
      </div>
      <section id="proof-preview" aria-label="Print proof">
        <C.ContextMenu>
          <C.ContextMenuTrigger disabled={!selected} asChild>
            <figure
              tabIndex={0}
              className="workshop-poster"
              aria-label="Proof preview"
            >
              <svg aria-hidden="true" viewBox="0 0 600 300">
                <rect width="600" height="300" fill="currentColor" />
                <circle
                  cx="190"
                  cy="150"
                  r="104"
                  fill="none"
                  stroke="var(--rams-surface)"
                  strokeWidth={record?.marks ? 4 : 2}
                />
                <path
                  d="M315 46v208m48-208v208m48-208v208m48-208v208"
                  stroke="var(--rams-surface)"
                  strokeWidth="18"
                />
                {record?.marks && (
                  <path
                    d="M16 30h28m-14-14v28m526 226h28m-14-14v28"
                    stroke="var(--rams-surface)"
                    strokeWidth="2"
                  />
                )}
              </svg>
              <figcaption>
                {selected
                  ? selected.title + " · " + selected.city
                  : "Choose an edition to load its proof."}
              </figcaption>
            </figure>
          </C.ContextMenuTrigger>
          <C.ContextMenuContent aria-label="Proof context actions">
            <C.ContextMenuItem
              onSelect={() => update({ archived: !record?.archived })}
            >
              {record?.archived ? "Return edition to desk" : "Archive edition"}
            </C.ContextMenuItem>
            <C.ContextMenuItem onSelect={exportProof}>
              Export proof JSON
            </C.ContextMenuItem>
          </C.ContextMenuContent>
        </C.ContextMenu>
      </section>
      <section id="paper-stock" className="workshop-paper">
        <Label htmlFor={id + "-stock"}>Paper stock</Label>
        <S.Select
          disabled={!selected}
          value={record?.stock ?? ""}
          onValueChange={(stock) => update({ stock })}
        >
          <S.SelectTrigger id={id + "-stock"}>
            <S.SelectValue placeholder="Choose an edition first" />
          </S.SelectTrigger>
          <S.SelectContent>
            {stocks.map((stock) => (
              <S.SelectItem key={stock.id} value={stock.id}>
                {stock.label}
              </S.SelectItem>
            ))}
          </S.SelectContent>
        </S.Select>
      </section>
      <section
        id="proof-summary"
        aria-label="Edition record"
        className="workshop-record"
      >
        <h2>{selected?.title ?? "No edition selected"}</h2>
        {record && (
          <>
            <p>{stocks.find((stock) => stock.id === record.stock)?.label}</p>
            <p>
              {record.marks
                ? "Registration marks included"
                : "Registration marks omitted"}
            </p>
            <p role="status">{record.archived ? "Archived" : "On desk"}</p>
          </>
        )}
      </section>
    </main>
  );
}
