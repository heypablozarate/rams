import type { ReactNode } from "react";

export type ComparisonValue = boolean | "partial" | string | { value: boolean | "partial" | string; note?: string };
export type ComparisonColumn = {
  id: string;
  name: string;
  caption?: string;
  /** Reference column retained by the paired mobile layout. */
  highlight?: boolean;
  /** Caller-owned header content; the engine does not calculate or format it. */
  detail?: ReactNode;
  selectLabel?: string;
};
export type ComparisonRow = { id: string; feature: string; hint?: string; values: Record<string, ComparisonValue> };
export type ComparisonSection = { id: string; title: string; rows: ComparisonRow[] };
export type ComparisonAction = { label: string; href?: string; onClick?: () => void; doneLabel?: string };
