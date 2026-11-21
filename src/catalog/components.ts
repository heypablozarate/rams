import entries from "./catalog-data.json" with { type: "json" };
import type { ComponentFamily } from "./types";
export type { ComponentVariant, ComponentFamily } from "./types";

// Runtime catalog excludes source provenance and unused provider metadata.
// Regenerate from catalog-source.ts with npm run registry.
export const componentCatalog = entries as ComponentFamily[];
