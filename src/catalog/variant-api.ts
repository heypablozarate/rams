import api from "./library-api.json" with { type: "json" };
import type { ComponentVariant } from "./types";

type GeneratedApi = {
  props: [string, string, string][];
  defaults?: Record<string, string>;
  exports: string[];
  example: string;
};

export function getVariantApi(
  variant: ComponentVariant,
  generatedApis: Record<string, GeneratedApi> = api as unknown as Record<string, GeneratedApi>,
) {
  const id = variant.implementationId.startsWith("avatar-story-")
    ? "avatar"
    : variant.implementationId;
  const generated =
    variant.kind === "library"
      ? generatedApis[id]
      : undefined;
  if (variant.kind === "library" && id === "switch") return {
    properties: [
      ["label?", "string", "Visible external label associated with the control."],
      ["checked / defaultChecked / onCheckedChange", "boolean / boolean / (checked: boolean) => void", "Controlled or initial state; changes immediately."],
      ["size", "default | sm", "Same sizes as the standard Switch."],
      ["disabled / required / name / value", "Radix Switch props", "Passed through to the RAMS primitive."],
      ["id / aria-* / ref", "Control HTML props and ref", "Allow the actual control to be labeled, described, and focused."],
      ["className?", "string", "Styles the composition when a label is present; otherwise, styles the control."],
    ] as [string, string, string][],
    defaults: {size: "default", defaultChecked: "false", disabled: "false"},
    example: generated?.example,
  };
  return {
    properties: variant.props.length ? variant.props : generated?.props || [],
    defaults: generated?.defaults || {},
    example: generated?.example,
  };
}
