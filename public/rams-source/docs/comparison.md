# Comparison

Use one configurable matrix for feature comparison and selectable plans. Use
`Comparison` when your application owns the data. `ComparisonTable` retains its
optional sample defaults; `PlanComparison` is a compatible, zero-prop print-run
recipe, not a configurable pricing API. Prices, quantities, currency formatting
and selection consequences belong to the caller.

Install `motion-comparison-table` with the RAMS source installer. It includes the
shared renderer, types, styles and its actual dependency closure. For the legacy
print-run recipe, install `motion-plan-comparison` instead. Catalogue family
aliases do not rename these installer identities.

```tsx
import { useState } from "react";
import "./rams/styles.css";
import { Comparison } from "./rams/components/motion-comparison-table";
import type { ComparisonColumn, ComparisonSection } from "./rams/components/motion-comparison-table";

const columns: ComparisonColumn[] = [
  { id: "proof", name: "Proof", caption: "One copy" },
  { id: "edition", name: "Edition", caption: "A complete run" },
];
const sections: ComparisonSection[] = [{
  id: "delivery", title: "Delivery", rows: [
    { id: "format", feature: "Format", values: { proof: "A4", edition: "A4" } },
    { id: "trim", feature: "Trim included", values: { proof: false, edition: true } },
    { id: "stock", feature: "Stock options", values: { proof: "partial", edition: { value: true, note: "Three stocks" } } },
  ],
}];

export function EditionChoice() {
  const [selected, setSelected] = useState<string | null>(null);
  return <Comparison
    title="Choose an output"
    columns={columns} sections={sections}
    mobileLayout="all" selectable
    selectedColumn={selected} onSelectionChange={setSelected}
    footer={<p role="status">{selected ? `Selected: ${selected}` : "No output selected."}</p>}
  />;
}
```

For a read-only feature comparison, omit `selectable`. A highlighted column is
the reference for the mobile `pair` layout, not an implicit selection. The
alternative picker appears when there is more than one alternative. Use `all`
to retain every option; with many columns, prefer `pair` or a simpler comparison.
Column and row IDs must be unique and stable. Each row's `values` is keyed by
column ID; an omitted value means not included. Supply an explicit text value
for unknown or unmeasured information instead.

Selection can be uncontrolled (`defaultSelectedColumn`, `onSelectionChange`) or
controlled (`selectedColumn`, `onSelectionChange`). `null` means no selection;
`undefined` leaves ownership with the component. Clicking the selected option
clears it. The caller decides whether this is a draft, a filter or a purchase;
the component does not perform checkout or persist a choice.

`differencesOnly` / `defaultDifferencesOnly` / `onDifferencesOnlyChange` control
the difference filter. It compares visible columns, including notes. `compareWith`
/ `onCompareWithChange` control the mobile alternative. Do not freeze a controlled
value without handling its callback if the control is meant to be interactive.

`toolbar` and `footer` accept caller-owned content. `column.detail` can contain
a price or other explanation. Keep units comparable and announce meaningful
results once, rather than every animated intermediate value. `cta` accepts
`label`, `href`, `onClick`, and optional `doneLabel`; it targets the highlighted
or first column. Use an actual link for navigation. Keep one primary action in
the active composition; selecting a column already emphasizes that choice.

`maxHeight` creates local vertical scrolling; `stickyTop` sets the header inset
in that scroller. `stackBelow` is a CSS-pixel threshold measured from the
component's own width, not the window. `title`, `description`, `featureLabel`,
`sectionLabel`, `countLabel`, `differencesLabel`, `showLegend` and `className`
adjust presentation without replacing the renderer. Inspect the TypeScript
interface for exact types and defaults.

Check keyboard selection, difference filtering, the mobile alternative picker,
sticky scrolling and focus after changing data. Labels must remain meaningful
when rows stack. Boolean and partial values include text as well as symbols;
do not replace them with color-only dots. Test long labels and enlarged text in
your real composition. The component's local demonstrations are not a claim of
assistive-technology or physical-device coverage.

Legacy web paths `comparison-table` and `plan-comparison` resolve to the
canonical Comparison family while preserving the selected variant. Their
Markdown documents and anchors remain available. Existing `ComparisonTable`,
`ComparisonTableBlock` and zero-argument `PlanComparison` exports are retained.
