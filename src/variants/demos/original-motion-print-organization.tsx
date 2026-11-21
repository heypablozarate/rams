"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { Button } from "@/primitives/button";
import {
  TreeView,
  type TreeNode,
} from "@/variants/vendor/registry/components/tree-view/tree-view";
import {
  FilterToolbar,
  type FilterChip,
  type FilterField,
} from "@/variants/vendor/registry/components/filter-toolbar/filter-toolbar";
import { SortableDataTable } from "@/variants/vendor/registry/components/sortable-data-table/sortable-data-table";
import {
  ReorderableList,
  type ReorderableItem,
} from "@/variants/vendor/registry/components/reorderable-list/reorderable-list";

const ink = "var(--rams-detail-foreground)";
const paper = "var(--rams-detail-background)";
const muted = "var(--muted-foreground, var(--rams-detail-text-secondary))";
const stack: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  minWidth: 0,
  gap: "var(--rams-detail-space-3)",
};
const note: CSSProperties = {
  margin: 0,
  color: muted,
  fontSize: "var(--type-caption-size)",
  lineHeight: "var(--type-body-leading)",
  overflowWrap: "anywhere",
};
const artwork: CSSProperties = {
  display: "block",
  width: "100%",
  height: "auto",
  minWidth: 0,
  background: paper,
  color: ink,
};

function PrintStudy({
  name,
  place,
  title,
  children,
}: {
  name: string;
  place: string;
  title: string;
  children: ReactNode;
}) {
  const heading = useId();
  return (
    <section
      data-print-organization={name}
      aria-labelledby={heading}
      style={{
        ...stack,
        color: ink,
        fontSize: "var(--type-body-size)",
        lineHeight: "var(--type-body-leading)",
        overflowWrap: "anywhere",
      }}
    >
      <header>
        <p style={note}>{place}</p>
        <strong id={heading}>{title}</strong>
      </header>
      {children}
    </section>
  );
}

type PrintPlate = {
  id: string;
  title: string;
  place: string;
  process: string;
  paper: string;
  sheets: number;
  line: string;
};

const printPlates: PrintPlate[] = [
  {
    id: "RQ-01",
    title: "Landing",
    place: "Rosario",
    process: "Relief",
    paper: "Cotton",
    sheets: 48,
    line: "M8 56H92M8 44H72V18H92M8 32H52V8",
  },
  {
    id: "RQ-02",
    title: "Tide stair",
    place: "Rosario",
    process: "Drypoint",
    paper: "Rag",
    sheets: 24,
    line: "M8 56H28V44H48V32H68V20H92M8 16Q48 36 92 8",
  },
  {
    id: "CS-01",
    title: "Tile shade",
    place: "Córdoba",
    process: "Relief",
    paper: "Rag",
    sheets: 36,
    line: "M12 8V56H88V8ZM12 32H88M36 8V56M64 8V56M12 8L88 56",
  },
  {
    id: "CS-02",
    title: "Arch seam",
    place: "Córdoba",
    process: "Stencil",
    paper: "Cotton",
    sheets: 60,
    line: "M16 56V32A34 24 0 0 1 84 32V56M32 56V32A18 12 0 0 1 68 32V56M8 56H92",
  },
  {
    id: "MC-01",
    title: "Canal turn",
    place: "Mendoza",
    process: "Stencil",
    paper: "Rag",
    sheets: 30,
    line: "M8 16H52Q84 16 84 48V56M8 32H44Q68 32 68 52V56M8 48H36",
  },
  {
    id: "MC-02",
    title: "Vine grid",
    place: "Mendoza",
    process: "Relief",
    paper: "Cotton",
    sheets: 42,
    line: "M16 8V56M40 8V56M64 8V56M88 8V56M8 20H92M8 44H92M16 56L88 8",
  },
];

const places = ["Rosario", "Córdoba", "Mendoza"];
const plateTree: TreeNode[] = places.map((place, index) => ({
  id: `cabinet-${index}`,
  label: place,
  children: printPlates
    .filter((plate) => plate.place === place)
    .map((plate) => ({ id: plate.id, label: plate.title })),
}));
const sheetTotal = (plates: PrintPlate[]) =>
  plates.reduce((total, plate) => total + plate.sheets, 0);

function PlateDirectory({ plates }: { plates: PrintPlate[] }) {
  return (
    <ul
      style={{ ...stack, margin: 0, paddingInlineStart: "var(--rams-detail-preview-unordered-list-inset)", gap: "var(--rams-detail-preview-list-gap)" }}
    >
      {plates.map((plate) => (
        <li key={plate.id}>
          <strong>
            {plate.id} · {plate.title}
          </strong>
          <p style={note}>
            {plate.place} · {plate.process} · {plate.paper} · {plate.sheets}{" "}
            sheets
          </p>
        </li>
      ))}
    </ul>
  );
}

export function MotionPlateCabinetTreeDemo() {
  const [selected, setSelected] = useState<TreeNode | null>(null);
  const branch = plateTree.find((node) => node.id === selected?.id);
  const shown = !selected
    ? printPlates
    : branch
      ? printPlates.filter((plate) =>
          branch.children?.some((child) => child.id === plate.id),
        )
      : printPlates.filter((plate) => plate.id === selected.id);
  const title = selected?.label ?? "Cabinet overview";
  const rows = Math.ceil(shown.length / 2);
  return (
    <PrintStudy
      name="cabinet-tree"
      place="Three-city plate cabinet"
      title="Find a plate"
    >
      <TreeView
        nodes={plateTree}
        defaultExpandedIds={["cabinet-0"]}
        onSelect={setSelected}
        aria-label="Print plate cabinet"
      />
      <div style={stack}>
        <strong>{title}</strong>
        <p role="status" style={note}>
          {shown.length} {shown.length === 1 ? "plate" : "plates"} ·{" "}
          {sheetTotal(shown)} reference sheets
        </p>
        <svg
          viewBox={`0 0 240 ${rows * 80}`}
          role="img"
          aria-label={`${title}: ${shown.map((plate) => plate.title).join(", ")}`}
          style={artwork}
        >
          {shown.map((plate, index) => (
            <g
              key={plate.id}
              transform={`translate(${(index % 2) * 120 + 10} ${Math.floor(index / 2) * 80 + 8})`}
            >
              <rect
                width="100"
                height="64"
                fill="none"
                stroke="currentColor"
                opacity="var(--rams-detail-preview-plate-frame-opacity)"
              />
              <path
                d={plate.line}
                fill="none"
                stroke="currentColor"
                strokeWidth="var(--rams-detail-preview-plate-line-stroke)"
                strokeLinejoin="round"
              />
            </g>
          ))}
        </svg>
        <PlateDirectory plates={shown} />
      </div>
    </PrintStudy>
  );
}

const plateFields: FilterField[] = [
  { id: "place", label: "Place", options: places },
  {
    id: "process",
    label: "Process",
    options: ["Relief", "Drypoint", "Stencil"],
  },
  { id: "paper", label: "Paper", options: ["Cotton", "Rag"] },
];
function plateField(plate: PrintPlate, field: string) {
  if (field === "place") return plate.place;
  if (field === "process") return plate.process;
  if (field === "paper") return plate.paper;
  return undefined;
}

export function MotionPlateIndexFiltersDemo() {
  const [filters, setFilters] = useState<FilterChip[]>([
    { id: "place", label: "Place", value: "Rosario" },
  ]);
  const shown = printPlates.filter((plate) =>
    filters.every((filter) => plateField(plate, filter.id) === filter.value),
  );
  return (
    <PrintStudy
      name="plate-filters"
      place="Print reference index"
      title="Narrow the sheet search"
    >
      <p style={note}>
        Match every active filter. Clear them to see the complete cabinet.
      </p>
      <FilterToolbar
        filters={filters}
        label="Plate filters"
        onRemove={(id) =>
          setFilters((current) => current.filter((filter) => filter.id !== id))
        }
        onClearAll={() => setFilters([])}
        addFilter={{
          fields: plateFields,
          align: "start",
          onAdd: (filter) =>
            setFilters((current) => [
              ...current.filter((item) => item.id !== filter.id),
              filter,
            ]),
        }}
      />
      <p role="status" style={note}>
        {shown.length} of {printPlates.length} plates · {sheetTotal(shown)}{" "}
        reference sheets
      </p>
      {shown.length ? (
        <PlateDirectory plates={shown} />
      ) : (
        <p style={note}>
          No plates match every filter. Remove a chip or clear the filters to
          widen the search.
        </p>
      )}
    </PrintStudy>
  );
}

export function MotionReferencePackingTableDemo() {
  const [selected, setSelected] = useState<string[]>([]);
  const packed = printPlates.filter((plate) => selected.includes(plate.id));
  return (
    <PrintStudy
      name="packing-table"
      place="Reference-sheet packing bench"
      title="Assemble a packing slip"
    >
      <SortableDataTable
        rows={printPlates}
        columns={[
          { key: "title", label: "Plate", sortable: true },
          { key: "place", label: "Place", sortable: true },
          { key: "sheets", label: "Sheets", sortable: true, numeric: true },
        ]}
        rowKey="id"
        caption="Print plates and reference-sheet quantities"
        defaultSort={{ key: "sheets", direction: "asc" }}
        selectable
        selectedKeys={selected}
        onSelectionChange={setSelected}
        itemName={{ one: "plate", other: "plates" }}
      />
      <div style={stack}>
        <strong>Packing slip</strong>
        <p role="status" style={note}>
          {packed.length} selected {packed.length === 1 ? "plate" : "plates"} ·{" "}
          {sheetTotal(packed)} sheets to pack
        </p>
        {packed.length ? (
          <PlateDirectory plates={packed} />
        ) : (
          <p style={note}>
            Select plates to list their paper and sheet quantities here.
          </p>
        )}
      </div>
    </PrintStudy>
  );
}

const bookletSections: ReorderableItem[] = [
  { id: "quay", title: "Quay fold", detail: "Rosario · 4 pages" },
  { id: "steps", title: "Stone steps", detail: "Córdoba · 8 pages" },
  { id: "canal", title: "Canal ledger", detail: "Mendoza · 4 pages" },
  { id: "vine", title: "Vine screen", detail: "Mendoza · 8 pages" },
];
const sectionPages: Record<string, number> = {
  quay: 4,
  steps: 8,
  canal: 4,
  vine: 8,
};

export function MotionBookletSequenceDemo() {
  const [sections, setSections] = useState<ReorderableItem[]>(bookletSections);
  let nextPage = 1;
  const index = sections.map((section) => {
    const first = nextPage;
    nextPage += sectionPages[section.id]!;
    return { ...section, first, last: nextPage - 1 };
  });
  const original = sections.every(
    (section, position) => section.id === bookletSections[position]?.id,
  );
  return (
    <PrintStudy
      name="booklet-sequence"
      place="Three-city walking booklet"
      title="Set the reading sequence"
    >
      <p style={note}>
        Drag a section handle, or focus it and use Arrow Up and Arrow Down. Page
        ranges follow the reading order.
      </p>
      <ReorderableList
        items={sections}
        onReorder={setSections}
        label="Booklet reading sequence"
      />
      <Button
        type="button"
        variant="outline"
        disabled={original}
        onClick={() => setSections(bookletSections)}
      >
        Reset order
      </Button>
      <p role="status" style={note}>
        Opening section: {sections[0]!.title} · {nextPage - 1} pages
      </p>
      <svg
        viewBox="0 0 240 48"
        role="img"
        aria-label={`Booklet page blocks in order: ${index.map((section) => section.title).join(", ")}`}
        style={artwork}
      >
        {index.map((section, position) => (
          <rect
            key={section.id}
            x={(section.first - 1) * 10 + 1}
            y="8"
            width={(section.last - section.first + 1) * 10 - 2}
            height="32"
            fill="currentColor"
            opacity={position % 2 ? "var(--rams-detail-preview-page-block-secondary-opacity)" : "var(--rams-detail-preview-page-block-primary-opacity)"}
          />
        ))}
      </svg>
      <ol
        style={{
          ...stack,
          margin: 0,
          paddingInlineStart: "var(--rams-detail-preview-ordered-list-inset)",
          gap: "var(--rams-detail-preview-list-gap)",
        }}
      >
        {index.map((section) => (
          <li key={section.id}>
            <strong>{section.title}</strong>
            <p style={note}>
              Pages {section.first}–{section.last}
            </p>
          </li>
        ))}
      </ol>
    </PrintStudy>
  );
}
