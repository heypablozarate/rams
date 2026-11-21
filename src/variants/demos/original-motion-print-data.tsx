"use client";

import { PlanComparison } from "@/variants/vendor/registry/blocks/plan-comparison/plan-comparison";
import { ChangelogFeed } from "@/variants/vendor/registry/blocks/changelog-feed/changelog-feed";
import { PageHeader } from "@/variants/vendor/registry/blocks/page-header/page-header";

/** The blocks own their original print data and local interactions, including portable defaults. */
export function MotionPrintRunComparisonDemo() {
  return <PlanComparison />;
}

export function MotionPrintProductionNotesDemo() {
  return <ChangelogFeed />;
}

export function MotionPrintWorksheetHeaderDemo() {
  return <PageHeader />;
}
