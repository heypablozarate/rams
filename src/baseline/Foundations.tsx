import { useTheme } from "next-themes";
import { effectiveColors } from "../lib/foundations";
import { tokens } from "./tokens";
import { BrandColors } from "./BrandColors";
import { ColorPalette } from "./ColorPalette";
import { DensityGuide } from "./DensityControls";
import { ShapeGuide } from "./ShapeGuide";
import { CodeBlock } from "../catalog/CodeBlock";
import { foundationNavigation, type FoundationPageSection } from "./foundation-navigation";
import { useId, useState } from "react";
import { Input } from "../primitives/input";
import { Label } from "../primitives/label";
import { Button } from "../primitives/button";

export default function Foundations({
  section = "color",
}: {
  section?: FoundationPageSection;
}) {
  const { resolvedTheme } = useTheme();
  const mode = resolvedTheme === "dark" ? "dark" : "light";
  const title = foundationNavigation.find((item) => item.id === section)!.label;
  const exampleId = useId();
  const [formatAccepted, setFormatAccepted] = useState(false);
  return (
    <div className="space-y-8">
      <h1 className="docs-page-title text-3xl font-semibold tracking-tight">{title}</h1>
      {section === "color" && (
        <>
          <BrandColors />
          <ColorPalette
            colors={effectiveColors(tokens, mode)}
            brandColor={tokens.brandCustomization.palette[mode].brandAccent}
          />
        </>
      )}
      {section === "spacing" && (
        <section className="space-y-6" aria-label="Spacing and sizing">
          <DensityGuide />
          <div className="space-y-3">
            {[1, 2, 3, 4, 6, 8, 12, 16].map((n) => (
              <div key={n} className="flex min-w-0 flex-wrap items-center gap-4">
                <code className="min-w-[var(--rams-detail-docs-spacing-label-measure)] shrink-0 text-xs">space-{n}</code>
                <span
                  className="h-3 rounded-full bg-foreground"
                  style={{ width: `var(--rams-detail-space-${n})` }}
                />
              </div>
            ))}
          </div>
          <ul className="foundation-guidelines">
            <li>
              Use the spacing scale to separate related elements and
              groups of content.
            </li>
            <li>
              Keep consistent internal spacing across controls in the same
              hierarchy.
            </li>
            <li>
              Check readability and touch targets when choosing Compact for
              small surfaces.
            </li>
          </ul>
        </section>
      )}
      {section === "layout" && (
        <section className="space-y-6" aria-label="Grid and responsive layout">
          <p className="text-muted-foreground">
            Build fluid grids that adapt to the content and available
            space.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {["Information", "Activity", "Settings"].map((label) => (
              <div key={label} className="rounded-xl [border-width:var(--rams-detail-primitive-border-width)] p-5 text-sm">
                {label}
              </div>
            ))}
          </div>
          <CodeBlock
            code={
              '<div className="grid min-w-0 gap-4 sm:grid-cols-3">\n  <section>Information</section>\n  <section>Activity</section>\n  <section>Settings</section>\n</div>'
            }
          />
          <ul className="foundation-guidelines">
            <li>
              Use <code>minmax(0, 1fr)</code> or <code>min-w-0</code> so
              columns can shrink.
            </li>
            <li>
              Allow text and actions to reflow. Reserve horizontal scrolling
              for two-dimensional content such as tables and code.
            </li>
            <li>
              Check 320 px screens and text at 200%; overlays must
              stay within the viewport and keep their close control accessible.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Breakpoints: sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536 px.
          </p>
        </section>
      )}
      {section === "shape" && <ShapeGuide />}
      {section === "elevation" && (
        <section className="space-y-6" aria-label="Elevation">
          <p className="text-muted-foreground">
            Combine borders and shadows to separate surfaces without competing with
            the content.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              ["--rams-detail-shadow-resting", "Controls"],
              ["--rams-detail-shadow-raised", "Cards"],
              ["--rams-detail-shadow-floating", "Floating panels"],
            ].map(([shadow, label]) => (
              <div
                key={shadow}
                className="rounded-xl [border-width:var(--rams-detail-primitive-border-width)] bg-card p-6"
                style={{ boxShadow: `var(${shadow})` }}
              >
                <h2 className="docs-section-title">{label}</h2>
                <code className="mt-3 block text-xs text-muted-foreground">
                  {shadow}
                </code>
              </div>
            ))}
          </div>
          <ul className="foundation-guidelines">
            <li>
              Use the lowest elevation that still distinguishes a surface.
            </li>
            <li>
              Reserve stronger shadows for content layered over the
              document.
            </li>
            <li>
              Check separation in both themes; do not rely on shadow alone
              to indicate focus or selection.
            </li>
          </ul>
        </section>
      )}
      {section === "accessibility" && (
        <section className="space-y-6" aria-label={title}>
          <p className="text-muted-foreground">
            Use these integration checks with the final composition, its real content,
            and its states.
          </p>
          <ul className="foundation-guidelines">
            <li>
              Associate each field with its label, description, and error. Use
              accessible names for icon-only controls.
            </li>
            <li>
              Preserve Tab, arrow-key, and Escape behavior for the control pattern. When
              closing an overlay, return focus to its trigger.
            </li>
            <li>
              Keep focus visible, ensure sufficient contrast, and make errors independent
              of color alone.
            </li>
            <li>
              Respect text scaling and reduced motion. Also test with a screen reader
              and touch devices.
            </li>
          </ul>
          <form className="grid max-w-md gap-3" onSubmit={event => { event.preventDefault(); setFormatAccepted(true); }}>
            <h2 className="docs-section-title">Check the field pattern</h2>
            <Label htmlFor={exampleId}>Contact email</Label>
            <Input id={exampleId} type="email" required aria-describedby={`${exampleId}-help`} onChange={() => setFormatAccepted(false)} />
            <p id={`${exampleId}-help`} className="text-sm text-muted-foreground">Submit an empty or malformed address to inspect native validation and focus. Tab to the action to inspect its focus indicator.</p>
            <Button type="submit">Check format</Button>
            <p role="status">{formatAccepted ? "Email format accepted." : ""}</p>
          </form>
        </section>
      )}
    </div>
  );
}
