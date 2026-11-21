"use client";

import { useEffect, useId, useRef, useState } from "react";
import { animate } from "motion/react";
import { Comparison } from "@/variants/vendor/registry/blocks/comparison-table/comparison-table";
import type { ComparisonColumn, ComparisonSection } from "@/variants/vendor/registry/blocks/comparison-table/comparison-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/primitives/select";
import { useReducedMotion } from "@/variants/use-motion-preference";
import { motionTokens } from "@/variants/motion-tokens";
import styles from "@/variants/vendor/registry/blocks/plan-comparison/plan-comparison.module.css";

type Plan = "single" | "duotone";
type Allocation = "proof" | "edition";

// Fictional print planning belongs to this app recipe, never to the generic engine.
const specifications: ComparisonSection[] = [{ id: "print-specifications", title: "", rows: [
  { id: "size", feature: "Finished size", values: { single: "A3 · 297 × 420 mm", duotone: "A3 · 297 × 420 mm" } },
  { id: "passes", feature: "Ink passes", values: { single: "1 black pass", duotone: "2 black / grey passes" } },
  { id: "plates", feature: "Plate separations", values: { single: "1 plate", duotone: "2 plates" } },
  { id: "paper", feature: "Paper", values: { single: "140 gsm uncoated", duotone: "140 gsm uncoated" } },
  { id: "registration", feature: "Registration proof", values: { single: false, duotone: true } },
  { id: "spares", feature: "Spoilage allowance", values: { single: "10% extra sheets", duotone: "20% extra sheets" } },
  { id: "trim", feature: "Trim to A3", values: { single: true, duotone: true } },
  { id: "drying", feature: "Drying rack turns", values: { single: "1 turn", duotone: "2 turns" } },
]}];
const pricing: Record<Plan, Record<Allocation, number>> = {
  single: { proof: 62000, edition: 190000 }, duotone: { proof: 98000, edition: 310000 },
};
const quantities: Record<Allocation, number> = { proof: 100, edition: 500 };
const planName: Record<Plan, string> = { single: "Single ink", duotone: "Duotone" };
const numberFormat = new Intl.NumberFormat("en-AR");
const emptySelection = "Select a method to calculate the paper allocation.";
function selectionSummary(plan: Plan, allocation: Allocation) {
  const sheets = quantities[allocation];
  return `${planName[plan]}: ${sheets} finished sheets + ${Math.round(sheets * (plan === "single" ? .1 : .2))} spare sheets · ARS ${numberFormat.format(pricing[plan][allocation])} total`;
}
const selectionSummaries = (["single", "duotone"] as const).flatMap(plan => (["proof", "edition"] as const).map(allocation => selectionSummary(plan, allocation)));

function AnimatedNumber({ value }: { value: number }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(value), previous = useRef(value);
  useEffect(() => {
    if (reduced) { previous.current = value; setShown(value); return; }
    const controls = animate(previous.current, value, { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter], onUpdate: next => { previous.current = next; setShown(Math.round(next)); } });
    return () => controls.stop();
  }, [value, reduced]);
  return <>{numberFormat.format(reduced ? value : shown)}</>;
}

/** App-owned example: configure Comparison with local figures and explicit selection consequences. */
export function PrintPlanComparisonRecipe() {
  const id = useId();
  const [allocation, setAllocation] = useState<Allocation>("proof");
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const [selected, setSelected] = useState<Plan | null>(null);
  const columns: ComparisonColumn[] = (["single", "duotone"] as const).map(plan => ({
    id: plan, name: planName[plan],
    caption: plan === "single" ? "Linework and type" : "Layered tonal artwork",
    detail: <div className={["rams-comparison-plan-price", styles.price].join(" ")}><span className={styles.priceValue}><span className={styles.srOnly}>{`ARS ${numberFormat.format(pricing[plan][allocation])}`}</span><span aria-hidden="true">ARS <AnimatedNumber value={pricing[plan][allocation]} /></span></span><span className={styles.pricePeriod}>per complete run</span></div>,
  }));
  return <Comparison
    title="Folio21 · print-run comparison"
    description="Compare two A3 print methods for a Rosario walking-map edition."
    columns={columns} sections={specifications} mobileLayout="all" selectable
    selectedColumn={selected} onSelectionChange={next => { if (next === null || next === "single" || next === "duotone") setSelected(next); }}
    differencesOnly={differencesOnly} onDifferencesOnlyChange={setDifferencesOnly}
    featureLabel="What changes" sectionLabel="Production details" countLabel="specifications" differencesLabel="Show differences only" showLegend={false}
    toolbar={<div className={styles.allocation}><label htmlFor={`${id}-allocation`}>Finished-sheet allocation</label><Select value={allocation} onValueChange={value => setAllocation(value as Allocation)}><SelectTrigger id={`${id}-allocation`}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="proof">100 sheets</SelectItem><SelectItem value="edition">500 sheets</SelectItem></SelectContent></Select><small>{quantities[allocation]} finished sheets · illustrative ARS totals</small></div>}
    footer={<div className={styles.footer}><span>Illustrative ARS budget · paper, plates and trim included.</span><div className={styles.selectionStatus}><p role="status" aria-live="polite">{selected ? selectionSummary(selected, allocation) : emptySelection}</p>{[emptySelection, ...selectionSummaries].map(summary => <span key={summary} className={styles.statusMeasure} aria-hidden="true">{summary}</span>)}</div></div>}
  />;
}

export default PrintPlanComparisonRecipe;
