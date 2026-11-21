import {
  Component,
  lazy,
  type ComponentType,
  type ReactNode,
} from "react";
import { SheetLegacyBodyInsetBoundary } from "../primitives/sheet";
import type { ComponentVariant } from "./components";
import catalogData from "./catalog-data.json" with { type: "json" };
import originalPreviewMeta from "../variants/demos/original-preview-meta.json" with { type: "json" };

const originalModules = import.meta.glob([
  "../baseline/original/*.tsx",
  "../baseline/reviewed/form.tsx",
  "../variants/demos/original-*.tsx",
  "../variants/demos/print-*.tsx",
  "../variants/demos/avatar-stories.tsx",
]);
const fixtures = new Map<string, ReturnType<typeof lazy>>();

class PreviewBoundary extends Component<
  { children: ReactNode },
  { error: string }
> {
  state = { error: "" };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message };
  }
  render() {
    return this.state.error ? (
      <p role="alert" data-preview-error>
        Could not display this example: {this.state.error}
      </p>
    ) : (
      this.props.children
    );
  }
}
export function ComponentPreview({
  variant,
  embedded = false,
}: {
  variant: ComponentVariant;
  embedded?: boolean;
}) {
  if (!fixtures.has(variant.id))
    fixtures.set(
      variant.id,
      lazy<ComponentType>(async () => {
        if (variant.kind === "integration") {
          const examples = await import("../baseline/IntegrationDemos");
          return {
            default:
              variant.implementationId === "form-integration"
                ? examples.FormIntegration
                : examples.ComboboxIntegration,
          };
        }
        if (variant.kind === "baseline") {
          const path = variant.codeFiles[0].replace("src/", "../");
          const load = originalModules[path];
          if (!load) throw new Error("Example file not found.");
          const loaded = (await load()) as Record<string, ComponentType>;
          const component = variant.exportName && loaded[variant.exportName];
          if (!component) throw new Error("Selected example not found.");
          // Only these pinned exports carry the legacy inline body inset.
          // Ordinary Sheet consumers and other previews keep their own styles.
          if (path === "../baseline/original/sheet.tsx" &&
              (variant.exportName === "SheetDemo" || variant.exportName === "SheetSide")) {
            const OriginalSheetPreview = component;
            return { default: () => (
              <SheetLegacyBodyInsetBoundary>
                <OriginalSheetPreview />
              </SheetLegacyBodyInsetBoundary>
            ) };
          }
          return { default: component };
        }
        const entry = (originalPreviewMeta as Record<string, {file:string;exportName:string}>)[variant.id.replace(/^motion-/, "")];
        if (!entry) throw new Error("Original example metadata is missing.");
        const load = originalModules[entry.file.replace("src/", "../")];
        if (!load) throw new Error("Original example file is missing.");
        const loaded = await load() as Record<string, ComponentType>;
        const demo = loaded[entry.exportName];
        if (!demo) throw new Error("Original example export is missing.");
        return { default: demo };
      }),
    );
  if (variant.requiresFrame && !embedded)
    return (
      <iframe
        title={`Preview ${variant.label}`}
        className="preview-isolated"
        src={`#/preview/${variant.id}`}
      />
    );
  const Preview = fixtures.get(variant.id)!;
  return (
    <PreviewBoundary key={variant.id}>
      <div data-component-preview={variant.id} className="preview-component">
        <Preview />
      </div>
    </PreviewBoundary>
  );
}

// Fetch only source files explicitly selected by the active catalog. Broad raw
// globs would emit unrelated archived examples as downloadable asset chunks.
export const componentSources: Record<string, () => Promise<string>> = Object.fromEntries(
  [...new Set(catalogData.flatMap(f => f.variants.flatMap(v => v.codeFiles)))].map(file => [
    file.replace("src/", "../"),
    async () => {
      const response = await fetch("/code/" + file + ".txt");
      if (!response.ok) throw new Error("Selected source file is unavailable.");
      return response.text();
    },
  ]),
);
export const exampleSources: Record<string, () => Promise<string>> = {};
