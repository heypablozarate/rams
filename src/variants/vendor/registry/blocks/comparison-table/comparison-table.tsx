"use client";

import { Comparison } from "@/variants/comparison";
import type { ComparisonProps, ComparisonColumn, ComparisonSection } from "@/variants/comparison";
import { comparisonColumns, comparisonSections } from "./comparison-table-data";

export { Comparison } from "@/variants/comparison";
export type { ComparisonProps, ComparisonColumn, ComparisonRow, ComparisonSection, ComparisonValue } from "@/variants/comparison";

/** Compatible feature entry point; omitted data keeps the original local specimen. */
export interface ComparisonTableProps extends Omit<ComparisonProps, "columns" | "sections"> {
  columns?: ComparisonColumn[];
  sections?: ComparisonSection[];
}

export function ComparisonTable({
  title = "Folio 21 · sample specifications",
  description = "Compare a two-plate cover, a black-only proof, and a folded paper dummy.",
  columns = comparisonColumns, sections = comparisonSections, ...props
}: ComparisonTableProps) {
  return <Comparison {...props} title={title} description={description} columns={columns} sections={sections} />;
}

export function ComparisonTableBlock() { return <ComparisonTable />; }
export default ComparisonTableBlock;
