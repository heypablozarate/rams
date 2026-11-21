import { RamsText } from "../brand/RamsName";
import type { ComponentVariant } from "./types";
import { getPreviewContract } from "./preview-contracts";
import previewNotes from "./preview-notes.json";

export function PreviewScope({ variant, detailed = false, familyDescription }: { variant: ComponentVariant; detailed?: boolean; familyDescription?: string }) {
  const contract = getPreviewContract(variant);
  const demonstrates = contract.demonstrates.filter(line => line.trim() !== familyDescription?.trim());
  // General integration guidance belongs in Documentation. Only explicitly
  // reviewed notes with an immediate bearing on this preview stay beside it.
  if (!detailed) {
    const note = (previewNotes as Record<string, string>)[variant.id];
    return note ? <p className="preview-scope mt-6 text-sm text-muted-foreground" data-preview-note={variant.id}><RamsText>{note}</RamsText></p> : null;
  }
  const content = <div className="space-y-4">
    {demonstrates.length > 0 && <div><h3>What it demonstrates</h3><ul className="foundation-guidelines">{demonstrates.map(line => <li key={line}><RamsText>{line}</RamsText></li>)}</ul></div>}
    <div><h3>Integration notes</h3><ul className="foundation-guidelines">{contract.limits.map(line => <li key={line}><RamsText>{line}</RamsText></li>)}</ul></div>
    {detailed && <div><h3>How to test it</h3><ul className="foundation-guidelines">{contract.checks.map(line => <li key={line}><RamsText>{line}</RamsText></li>)}</ul></div>}
  </div>;
  return <section aria-label={detailed ? "Preview contract" : "Behavior and limits"} className={detailed ? "preview-scope space-y-4" : "preview-scope mt-8 space-y-4 text-sm text-muted-foreground"}>
    <h2 className="font-medium text-foreground">Behavior and limits</h2>
    {content}
  </section>;
}
