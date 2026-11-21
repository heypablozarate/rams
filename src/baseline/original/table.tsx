import { printPreviewGeometry } from "../../variants/print-preview-geometry";
import { useLayoutEffect, useRef, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from "../../primitives/table";
import { Button } from "../../primitives/button";
import { Input } from "../../primitives/input";
import { Checkbox } from "../../primitives/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "../../primitives/dropdown-menu";
const editions = [
  {
    id: "tr12",
    title: "Trama / Terrace",
    stock: "Uncoated",
    copies: 60,
    state: "Reviewed",
  },
  {
    id: "ba03",
    title: "Barranca / Long fold",
    stock: "Cotton",
    copies: 120,
    state: "In preparation",
  },
  {
    id: "pa08",
    title: "Pasaje / Window rhythm",
    stock: "Linen",
    copies: 40,
    state: "Filed",
  },
  {
    id: "ri14",
    title: "River grid / 14",
    stock: "Uncoated",
    copies: 80,
    state: "Reviewed",
  },
  {
    id: "co09",
    title: "Corner light / 09",
    stock: "Cotton",
    copies: 50,
    state: "Filed",
  },
  {
    id: "pt07",
    title: "Patio / 07",
    stock: "Linen",
    copies: 60,
    state: "In preparation",
  },
];
export function TableDemo() {
  return (
    <Table aria-label="Rosario print register">
      <TableCaption>Three editions from the print room.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Edition</TableHead>
          <TableHead scope="col">Stock</TableHead>
          <TableHead scope="col" style={{ textAlign: "end" }}>
            Copies
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {editions.slice(0, printPreviewGeometry.table.sampleRows).map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.title}</TableCell>
            <TableCell>{row.stock}</TableCell>
            <TableCell

              data-rams-numeric="true"
              style={{ textAlign: "end" }}
            >
              {row.copies}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
export function DataTableDemo() {
  const tableRef = useRef<HTMLTableElement>(null);
  const [columnWidths, setColumnWidths] = useState<number[]>([]);
  const [query, setQuery] = useState(""),
    [descending, setDescending] = useState(false),
    [page, setPage] = useState(0),
    [selected, setSelected] = useState<Set<string>>(() => new Set()),
    [showState, setShowState] = useState(true);
  const filtered = editions
      .filter((row) =>
        row.title.toLowerCase().includes(query.trim().toLowerCase()),
      )
      .sort(
        (a, b) => (descending ? -1 : 1) * a.title.localeCompare(b.title, "en"),
      ),
    pageSize = printPreviewGeometry.table.pageRows,
    pages = Math.max(1, Math.ceil(filtered.length / pageSize)),
    current = Math.min(page, pages - 1),
    rows = filtered.slice(current * pageSize, (current + 1) * pageSize),
    selectedOnPage = rows.filter((row) => selected.has(row.id)).length;
  // Measure content from the complete register using the rendered font,
  // letter spacing, heading controls and padding. The resulting column widths
  // are runtime geometry, so filtering and paging do not change the layout.
  useLayoutEffect(() => {
    const table = tableRef.current;
    if (!table) return;
    const context = document.createElement("canvas").getContext("2d");
    if (!context) return;
    const measure = () => {
      const body = getComputedStyle(table);
      const heads = Array.from(table.querySelectorAll("th"));
      const textWidth = (text: string, style: CSSStyleDeclaration) => {
        context.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const tracking = parseFloat(style.letterSpacing) || 0;
        return context.measureText(text).width + Math.max(0, text.length - 1) * tracking;
      };
      const values = [[], editions.map(row => row.title), editions.map(row => row.stock), editions.map(row => String(row.copies)), editions.map(row => row.state)];
      const widths = heads.map((head, index) => {
        const style = getComputedStyle(head);
        const padding = parseFloat(style.paddingInlineStart) + parseFloat(style.paddingInlineEnd);
        const control = head.querySelector("button");
        const heading = control ? control.getBoundingClientRect().width : textWidth(head.textContent || "", style);
        return Math.ceil(Math.max(heading, ...values[index]!.map(value => textWidth(value, body))) + padding);
      });
      setColumnWidths(previous => widths.every((width, index) => width === previous[index]) && widths.length === previous.length ? previous : widths);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(table);
    document.fonts.addEventListener("loadingdone", measure);
    let active = true;
    void document.fonts.ready.then(() => { if (active) measure(); });
    return () => { active = false; observer.disconnect(); document.fonts.removeEventListener("loadingdone", measure); };
  }, [showState]);
  function select(id: string, value: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  }
  return (
    <div
      style={{
        display: "grid",
        width: "100%",
        gap: "var(--rams-detail-space-4)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--rams-detail-space-3)",
        }}
      >
        <Input
          aria-label="Filter print titles"
          type="search"
          placeholder="Find a print title"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          style={{ maxWidth: "var(--rams-detail-preview-field-measure)" }}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Visible details</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={showState}
              onCheckedChange={setShowState}
            >
              Review state
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table ref={tableRef} aria-label="Selectable print register" style={{ tableLayout: columnWidths.length ? "fixed" : undefined, minWidth: columnWidths.reduce((sum, width) => sum + width, 0) || undefined, transitionProperty: "color, background-color, border-color, box-shadow" }}>
        <colgroup>{columnWidths.map((width, index) => <col key={index} style={{ width }} />)}</colgroup>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">
              <Checkbox
                aria-label="Select prints on this page"
                disabled={!rows.length}
                checked={
                  selectedOnPage === rows.length && rows.length > 0
                    ? true
                    : selectedOnPage
                      ? "indeterminate"
                      : false
                }
                onCheckedChange={(value) =>
                  setSelected((current) => {
                    const next = new Set(current);
                    rows.forEach((row) => {
                      if (value === true) next.add(row.id);
                      else next.delete(row.id);
                    });
                    return next;
                  })
                }
              />
            </TableHead>
            <TableHead
              scope="col"
              aria-sort={descending ? "descending" : "ascending"}
            >
              <Button
                variant="ghost"
                onClick={() => {
                  setDescending((value) => !value);
                  setPage(0);
                }}
              >
                Edition {descending ? "↓" : "↑"}
              </Button>
            </TableHead>
            <TableHead scope="col">Stock</TableHead>
            <TableHead scope="col" style={{ textAlign: "end" }}>
              Copies
            </TableHead>
            {showState && <TableHead scope="col">Review state</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={selected.has(row.id) ? "selected" : undefined}
              >
                <TableCell>
                  <Checkbox
                    aria-label={"Select " + row.title}
                    checked={selected.has(row.id)}
                    onCheckedChange={(value) => select(row.id, value === true)}
                  />
                </TableCell>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.stock}</TableCell>
                <TableCell

                  data-rams-numeric="true"
                  style={{ textAlign: "end" }}
                >
                  {row.copies}
                </TableCell>
                {showState && <TableCell>{row.state}</TableCell>}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={showState ? 5 : 4}>
                No print matches this title.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--rams-detail-space-4)",
        }}
      >
        <p role="status">
          {selected.size} selected · {filtered.length} prints
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "var(--rams-detail-space-3)",
          }}
        >
          <Button
            variant="outline"
            disabled={current === 0}
            onClick={() => setPage((value) => Math.max(0, value - 1))}
          >
            Previous prints
          </Button>
          <span>
            Page {current + 1} of {pages}
          </span>
          <Button
            variant="outline"
            disabled={current === pages - 1}
            onClick={() => setPage((value) => Math.min(pages - 1, value + 1))}
          >
            Next prints
          </Button>
        </div>
      </div>
    </div>
  );
}
