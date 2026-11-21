import { RamsText } from "../brand/RamsName";
import type { ComponentVariant } from "./types";
import { getVariantApi } from "./variant-api";
import { CodeBlock } from "./CodeBlock";
import { getUsageGuide } from "./usage-guides";
import { PreviewScope } from "./PreviewScope";
import { getPreviewContract } from "./preview-contracts";

export default function VariantDocumentation({
  variant,
  hasVariants,
  familyDescription,
}: {
  variant: ComponentVariant;
  hasVariants: boolean;
  familyDescription: string;
}) {
  const generated = getVariantApi(variant);
  const guide = getUsageGuide(variant);
  const properties = generated.properties;
  const hasDescriptions = properties.some((property) => property[2]?.trim());
  const hasDefaults = properties.some(
    ([name]) => generated?.defaults?.[name.replace(/\?$/, "")] !== undefined,
  );

  return (
    <div className="component-guide space-y-7">
      {guide && (
        <section className="space-y-4">
          <h2>Usage</h2>
          {guide.summary.trim() !== familyDescription.trim() && !getPreviewContract(variant).demonstrates.includes(guide.summary) && <p><RamsText>{guide.summary}</RamsText></p>}
          <CodeBlock code={guide.example} />
        </section>
      )}
      {!guide && generated?.example && (
        <section className="space-y-4">
          <h2>Import</h2>
          <CodeBlock code={generated.example} />
        </section>
      )}
      {guide?.guidelines.length ? (
        <section>
          <h2>Guidelines</h2>
          <ul className="foundation-guidelines">
            {guide.guidelines.map((line) => (
              <li key={line}><RamsText>{line}</RamsText></li>
            ))}
          </ul>
        </section>
      ) : null}
      <PreviewScope variant={variant} detailed familyDescription={familyDescription} />
      {properties.length > 0 && (
        <section>
          <h2>{hasVariants ? "Variant API" : "Component API"}</h2>
          {properties.length ? (
            <div
              className="overflow-x-auto rounded-xl [border-width:var(--rams-detail-primitive-border-width)]"
              role="region"
              aria-label="Component API"
              tabIndex={0}
            >
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th>Prop</th>
                    <th>Type</th>
                    {hasDefaults && <th>Default</th>}
                    {hasDescriptions && <th>Usage</th>}
                  </tr>
                </thead>
                <tbody>
                  {properties.map(([name, type, description]) => (
                    <tr key={name}>
                      <td>
                        <code>{name}</code>
                      </td>
                      <td>
                        <code>{type}</code>
                      </td>
                      {hasDefaults && (
                        <td>
                          <code>
                            {generated?.defaults?.[name.replace(/\?$/, "")] ??
                              "—"}
                          </code>
                        </td>
                      )}
                      {hasDescriptions && <td><RamsText>{description || "—"}</RamsText></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
