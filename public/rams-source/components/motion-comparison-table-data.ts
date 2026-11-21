/** Original Folio 21 specification worksheet. */
import type { ComparisonColumn, ComparisonSection } from "./motion-comparison-types";
export type { ComparisonColumn, ComparisonRow, ComparisonSection, ComparisonValue } from "./motion-comparison-types";

export const comparisonColumns: ComparisonColumn[] = [
  { id: "folio-21", name: "Folio 21 · two plates", caption: "140 sample copies", highlight: true },
  { id: "single-plate", name: "Folio 21 · black only", caption: "140 sample copies" },
  { id: "fold-dummy", name: "Folded dummy", caption: "1 paper mockup" },
];

export const comparisonSections: ComparisonSection[] = [
  {
    id: "format-and-stock", title: "Format and stock", rows: [
      { id: "pages", feature: "Page count", values: { "folio-21": "24 pages", "single-plate": "24 pages", "fold-dummy": "24 pages" } },
      { id: "signatures", feature: "Signature plan", hint: "Three sections of eight pages", values: { "folio-21": "3 × 8 pages", "single-plate": "3 × 8 pages", "fold-dummy": "3 × 8 pages" } },
      { id: "text-stock", feature: "Text stock", values: { "folio-21": "100 gsm uncoated", "single-plate": "100 gsm uncoated", "fold-dummy": "70 gsm uncoated" } },
      { id: "cover-stock", feature: "Cover stock", values: { "folio-21": "220 gsm uncoated", "single-plate": "220 gsm uncoated", "fold-dummy": "70 gsm uncoated" } },
    ],
  },
  {
    id: "plates-and-finish", title: "Plates and finish", rows: [
      { id: "black-plate", feature: "Black text plate", values: { "folio-21": true, "single-plate": true, "fold-dummy": false } },
      { id: "accent-plate", feature: "Oxide-red cover rule", values: { "folio-21": true, "single-plate": false, "fold-dummy": false } },
      { id: "trim-margin", feature: "Oxide-red rule margin", hint: "Measured inside trim on the two-plate cover", values: { "folio-21": "5 mm", "single-plate": "Not included", "fold-dummy": "Not included" } },
      { id: "run-quantity", feature: "Quantity represented", values: { "folio-21": "140 copies", "single-plate": "140 copies", "fold-dummy": "1 mockup" } },
    ],
  },
];
