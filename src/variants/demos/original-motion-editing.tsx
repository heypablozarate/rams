"use client";

import { useState } from "react";
import { ChipGroup } from "@/variants/vendor/registry/components/chip-group/chip-group";
import { InlineEdit } from "@/variants/vendor/registry/components/inline-edit/inline-edit";
import { SearchField } from "@/variants/vendor/registry/components/search-field/search-field";

const contentStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: "var(--rams-detail-space-3)",
  width: "100%",
  minWidth: 0,
  color: "var(--rams-detail-foreground)",
};

const controlGap = "var(--rams-detail-space-1)";

const records = [
  { title: "Woodcut proof 07", city: "Rosario", process: "Relief" },
  { title: "Folded sheet 03", city: "Córdoba", process: "Relief" },
  { title: "Stencil proof 12", city: "Mendoza", process: "Screenprint" },
  { title: "Paper grain study 02", city: "Salta", process: "Monotype" },
  { title: "Harbor map 05", city: "Buenos Aires", process: "Screenprint" },
  { title: "Drypoint line 09", city: "Rosario", process: "Monotype" },
];

export function SearchFieldDemo() {
  const [query, setQuery] = useState("");
  const matches = records.filter((record) =>
    `${record.title} ${record.city} ${record.process}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: "var(--rams-detail-space-3)",
        width: "100%",
        minWidth: 0,
        color: "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))",
      }}
      aria-label="Workshop print index search"
    >
      <SearchField
        label="Search the print index"
        value={query}
        onValueChange={setQuery}
        placeholder="Title, city, or process"
        autoComplete="off"
      />
      <div aria-live="polite" style={{ minWidth: 0 }}>
        <p style={{ marginBlock: 0, color: "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))" }}>
          {matches.length} {matches.length === 1 ? "entry" : "entries"}
        </p>
        {matches.length ? (
          <ul style={{ marginBlock: "var(--rams-detail-space-1)", paddingInlineStart: "var(--rams-detail-preview-search-result-list-indent)", minWidth: 0 }}>
            {matches.map((record) => (
              <li key={record.title}>
                {record.title} · {record.city} · {record.process}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ marginBlock: "var(--rams-detail-space-1)" }}>No print-index entries match “{query}”.</p>
        )}
      </div>
    </section>
  );
}

export function InlineEditDemo() {
  const [title, setTitle] = useState("Proof 07");
  const [note, setNote] = useState("Rosario · preserve the unprinted folding edge.");
  return (
    <section style={contentStyle} aria-label="Editable print-index entry">
      <div style={{ ...contentStyle, gap: controlGap }}>
        <span style={{ color: "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))", fontSize: "var(--type-caption-size)" }}>Proof title</span>
        <InlineEdit multiline as="h3" label="Proof title" value={title}
          onSave={next => setTitle(next.trim())}
          validate={next => next.trim() ? null : "Enter a proof title."} />
      </div>
      <div style={{ ...contentStyle, gap: controlGap }}>
        <span style={{ color: "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))", fontSize: "var(--type-caption-size)" }}>Production note</span>
        <InlineEdit multiline variant="body" label="Production note" value={note}
          onSave={next => setNote(next.trim())} />
      </div>
    </section>
  );
}

const processOptions = ["Relief", "Screenprint", "Monotype"];

export function ChipGroupDemo() {
  const [processes, setProcesses] = useState(["Relief"]);
  const visibleRecords = records.filter(
    (record) => processes.length === 0 || processes.includes(record.process),
  );

  return (
    <section style={contentStyle} aria-label="Print-index process filters">
      <ChipGroup
        label="Print processes"
        options={processOptions.map((process) => ({ value: process, label: process }))}
        value={processes}
        onValueChange={setProcesses}
        multiple
      />
      <div aria-live="polite" style={{ minWidth: 0 }}>
        <p style={{ marginBlock: 0, color: "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))" }}>
          {visibleRecords.length} {visibleRecords.length === 1 ? "entry" : "entries"}
        </p>
        <ul style={{ marginBlock: controlGap, paddingInlineStart: "var(--rams-detail-preview-search-result-list-indent)", minWidth: 0 }}>
          {visibleRecords.map((record) => (
            <li key={record.title}>
              {record.title} · {record.city} · {record.process}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
