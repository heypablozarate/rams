"use client";
import "./motion-fields.css";

import { PrintPlanComparisonRecipe } from "./motion-plan-comparison-recipe";

/** Legacy no-argument print specimen. New applications pass their data to Comparison. */
export function PlanComparison() { return <PrintPlanComparisonRecipe />; }
export default PlanComparison;
