import originalNativeGuides from "../baseline/original/native-usage.json" with {type:"json"};
import originalLibraryGuides from "../variants/demos/original-usage.json" with {type:"json"};
import type { ComponentVariant } from "./types";
import { portableSource } from "./portable-source.ts";
export type UsageGuide = {
  summary: string;
  example: string;
  guidelines: string[];
};
export function getUsageGuide(
  variant: ComponentVariant,
): UsageGuide | undefined {
  const guide =
    variant.kind === "integration"
      ? (originalNativeGuides as Record<string,UsageGuide>)[variant.id]
      : variant.kind === "library"
      ? (originalLibraryGuides as Record<string,UsageGuide>)[variant.id.replace(/^motion-/, '')]
      : (originalNativeGuides as Record<string,UsageGuide>)[variant.demoId || ""];
  if (!guide) throw new Error(`Missing original usage guide: ${variant.id}`);
  return { ...guide, example: portableSource(guide.example) };
}
