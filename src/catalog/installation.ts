import type { ComponentVariant } from "./types";

/** These examples compose Command/Field APIs rather than the similarly named family primitive. */
export function isCompositionRecipe(variant: ComponentVariant): boolean {
  return variant.kind === "baseline" &&
    (variant.implementationId === "combobox" || variant.implementationId === "form");
}

export function getRegistryItem(variant: ComponentVariant): string | undefined {
  if (isCompositionRecipe(variant)) return `rams-example-${variant.demoId}`;
  if (variant.kind === "baseline") return `rams-${variant.implementationId}`;
  if (variant.kind === "library") return `variant-${variant.implementationId}`;
  return undefined;
}

/** Source-install IDs are independent of the archived installation format. */
export function getSourceInstallItem(variant: ComponentVariant): string {
  if (variant.kind === "integration")
    return variant.implementationId === "form-integration" ? "proof-label-form" : "paper-stock-picker";
  if (variant.kind === "baseline") return variant.implementationId;
  const id = variant.implementationId;
  if (id.startsWith("avatar-story-")) return "motion-avatar";
  if (id.startsWith("theme-switch-")) return "motion-theme-switch";
  return "motion-" + id;
}
