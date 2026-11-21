import { useEffect, useRef, useState, type CSSProperties } from "react";
import { tokens } from "../baseline/tokens";
import {
  buildTypographyManifest,
  type TypographyRole,
} from "../lib/typography";
import styles from "./typography.module.css";
import { Button } from "../primitives/button";

const manifest = buildTypographyManifest(
  tokens.typography,
  tokens.density.scales,
)!;
const expandedTracking = tokens.componentExtensions.details.typographyGuideSpecimens.expandedParagraphTracking;
const densityNames = {
  compact: "Compact",
  default: "Default",
  wide: "Wide",
};
const roleNames: Record<TypographyRole, string> = {
  control: "Control",
  body: "Reading",
  caption: "Caption",
  title: "Title",
  heading: "Heading",
  display: "Display",
  code: "Code",
};
const samples: Record<TypographyRole, string> = {
  control: "Find a page",
  body: "The quick brown fox jumps over the lazy dog.",
  caption: "ÁÉÍÓÚÑ · 0123456789",
  title: "Hamburgefontsiv",
  heading: "Agile penguins",
  display: "Abc 123",
  code: "font-size: var(--type-code-size);",
};
type SpecimenFamily = {
  name: string;
  family: "interface" | "editorial";
  weights: number[];
  italics: number[];
  range: string;
  purpose: string;
  sentence: string;
  fallback: string;
};

const families: SpecimenFamily[] = [
  {
    name: "Geist Serif",
    family: "editorial",
    weights: [400],
    italics: [],
    range: "400",
    purpose: "Long-form reading and editorial content",
    sentence: "The quick brown fox jumps over the lazy dog.",
    fallback: "Georgia / serif",
  },
  {
    name: "Geist Sans",
    family: "interface",
    weights: [100, 300, 400, 500, 700, 900],
    italics: [400, 500, 700],
    range: "100–900",
    purpose: "Interface, headings, and controls",
    sentence: "The quick brown fox jumps over the lazy dog.",
    fallback: "Arial / Helvetica / sans-serif",
  },
];

function useFontAvailability() {
  const [available, setAvailable] = useState<
    Record<string, boolean | undefined>
  >({});
  useEffect(() => {
    let active = true;
    const requests = families.flatMap(({ name, italics }) => [
      { key: name, value: `400 16px "${name}"` },
      ...italics.map((weight) => ({
        key: `${name}-${weight}-italic`,
        value: `italic ${weight} 16px "${name}"`,
      })),
    ]);
    Promise.all(
      requests.map(async ({ key, value }) => {
        try {
          const faces = await document.fonts.load(value);
          return [
            key,
            faces.length > 0 && faces.every((face) => face.status === "loaded"),
          ] as const;
        } catch {
          return [key, false] as const;
        }
      }),
    ).then((results) => {
      if (active) setAvailable(Object.fromEntries(results));
    });
    return () => {
      active = false;
    };
  }, []);
  return available;
}

function roleStyle(id: TypographyRole): CSSProperties {
  return {
    fontFamily: `var(--type-${id}-family)`,
    fontSize: `var(--type-${id}-size)`,
    lineHeight: `var(--type-${id}-leading)`,
    fontWeight: `var(--type-${id}-weight)` as CSSProperties["fontWeight"],
    letterSpacing: `var(--type-${id}-tracking)`,
  };
}

/** Usage guide; all production type sizes come from the existing typography contract. */
export default function TypographyGuide() {
  const root = useRef<HTMLDivElement>(null);
  const availability = useFontAvailability();
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  useEffect(() => {
    const measure = () => {
      if (!root.current) return;
      const result: Record<string, string> = {};
      root.current
        .querySelectorAll<HTMLElement>("[data-type-role]")
        .forEach((node) => {
          const computed = getComputedStyle(node);
          result[node.dataset.typeRole!] =
            `${parseFloat(computed.fontSize).toFixed(1)} / ${parseFloat(computed.lineHeight).toFixed(1)} px`;
        });
      setMeasurements(result);
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(document.documentElement);
    const mutation = new MutationObserver(measure);
    mutation.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-density", "style", "class"],
    });
    window.addEventListener("resize", measure);
    document.fonts.addEventListener("loadingdone", measure);
    return () => {
      resize.disconnect();
      mutation.disconnect();
      window.removeEventListener("resize", measure);
      document.fonts.removeEventListener("loadingdone", measure);
    };
  }, []);

  return (
    <div ref={root} className={`${styles.guide} rams-typography-guide`} data-typography-guide>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Foundations / Typography</p>
        <h1>Typography</h1>
        <p>
          Use Geist Sans for the interface and Geist Serif for long-form
          reading. Choose a role based on the content’s purpose.
        </p>
      </header>

      <div className={styles.openingSpecimen} aria-label="Geist type families">
        <figure className={styles.groteskSpecimen}>
          <p className={styles.specimenWord}>Ag</p>
          <figcaption>
            <span>Geist Sans · 400</span>
            <span className={styles.caption}>
              Interface, headings, and controls
            </span>
          </figcaption>
        </figure>
        <figure className={styles.textSpecimen}>
          <p className={styles.specimenWord}>Ag</p>
          <figcaption>
            <span>Geist Serif · Regular 400</span>
            <span className={styles.caption}>Long-form reading and editorial content</span>
          </figcaption>
        </figure>
      </div>

      <section className={styles.section} aria-labelledby="type-hierarchy">
        <div className={styles.sectionHeading}>
          <h2 id="type-hierarchy">Build a hierarchy</h2>
        </div>
        <figure className={styles.hierarchy}>
          <div className={styles.hierarchySample}>
            <h3 style={roleStyle("heading")}>Lorem ipsum dolor</h3>
            <p
              style={{
                ...roleStyle("body"),
                fontFamily: "var(--type-family-editorial)",
              }}
            >
              The quick brown fox jumps over the lazy dog.
            </p>
            <p className={styles.caption} style={roleStyle("caption")}>
              Geist Sans / Geist Serif
            </p>
          </div>
          <figcaption className={styles.caption}>
            Heading and caption in Geist Sans, body in Geist Serif. Weight and
            spacing distinguish the three levels without relying on color.
          </figcaption>
        </figure>
      </section>

      <section className={styles.section} aria-labelledby="type-roles">
        <div className={styles.sectionHeading}>
          <h2 id="type-roles">Interface roles and scale</h2>
        </div>
        <p>
          Samples use each role’s family, size, and line height at the
          selected density. Interface roles use Geist Sans; Code uses the
          system monospace family. For editorial reading, apply Geist Serif with
          the size and line height of Reading, as in the “Text that can grow” sample.
        </p>
        <div className={styles.roleList}>
          {manifest.roles.map((role) => (
            <article key={role.id} className={styles.roleRow}>
              <p
                data-type-role={role.id}
                className={styles.roleSample}
                style={roleStyle(role.id)}
              >
                {samples[role.id]}
              </p>
              <div className={styles.roleMeta}>
                <h3>{roleNames[role.id]}</h3>
                <p>{role.description}</p>
                <dl className={styles.roleSpecs}>
                  <div>
                    <dt>Family / weight</dt>
                    <dd>
                      {role.family === "code"
                        ? "System monospace"
                        : role.family === "editorial"
                          ? "Geist Serif"
                          : "Geist Sans"}{" "}
                      · {role.weight ?? 400}
                    </dd>
                  </div>
                  <div>
                    <dt>Current size / line height</dt>
                    <dd>{measurements[role.id] ?? "Calculating…"}</dd>
                  </div>
                  <div>
                    <dt>Size token</dt>
                    <dd>
                      <code>{role.cssVariable}</code>
                    </dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
          <article className={styles.roleRow}>
            <div className={styles.roleSample}>
              <Button variant="outline" data-type-role="action">Save changes</Button>
            </div>
            <div className={styles.roleMeta}>
              <h3>Action style</h3>
              <p>Buttons, tabs, and pagination actions share Control’s fluid size and shorter line box. Ordinary action labels use medium weight; primary buttons use the real bold weight for emphasis.</p>
              <dl className={styles.roleSpecs}>
                <div><dt>Family / weight</dt><dd>Geist Sans · {manifest.styles!.action.weight}; primary {manifest.styles!.action.primaryWeight ?? manifest.styles!.action.weight}</dd></div>
                <div><dt>Current size / line height</dt><dd>{measurements.action ?? "Calculating…"}</dd></div>
                <div><dt>Style tokens</dt><dd><code>--type-action-weight</code>, <code>--type-primary-action-weight</code>, <code>--type-action-leading</code></dd></div>
              </dl>
            </div>
          </article>
        </div>
        <div className={styles.scale}>
          <h3>Sizes by density</h3>
          <table className={styles.scaleTable}>
            <caption>
              Ranges from 320 to 1280 px with a 16 px root. Size interpolates
              between the two endpoints; line height uses a unitless factor.
            </caption>
            <thead>
              <tr>
                <th scope="col">Role</th>
                {Object.entries(densityNames).map(([id, label]) => (
                  <th key={id} scope="col">
                    {label}
                  </th>
                ))}
                <th scope="col">Line height</th>
              </tr>
            </thead>
            <tbody>
              {manifest.roles.map((role) => (
                <tr key={role.id}>
                  <th scope="row">{roleNames[role.id]}</th>
                  {Object.entries(densityNames).map(([density, label]) => (
                    <td key={density} data-label={label}>
                      {role.densityRanges
                        ? `${role.densityRanges[density].minRem * 16}–${role.densityRanges[density].maxRem * 16}`
                        : parseFloat(role.densitySizes[density]) * 16}{" "}
                      px
                    </td>
                  ))}
                  <td data-label="Line height">{role.lineHeight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.note}>
          Size is fluid by default, combining rem and viewport width with
          minimums and maximums. The root respects the browser’s chosen text size;
          each sample reports its current CSS pixels. Code uses the system
          monospace stack.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="type-optical">
        <div className={styles.sectionHeading}>
          <h2 id="type-optical">Heading weight and spacing</h2>
        </div>
        <p>
          Heading uses weight 650 and Display uses 700; both are available on
          the Geist Sans axis. Heading tracking changes from −0.02em to
          −0.035em in wide compositions; Display changes from −0.03em to −0.05em.
          Title uses 550 with a smaller adjustment. Reading text and controls
          retain their spacing.
        </p>
        <p>
          The font’s automatic kerning remains active. Tracking adjusts
          the whole string; it does not replace kerning pairs or the wordmark’s
          own rules.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="type-families">
        <div className={styles.sectionHeading}>
          <h2 id="type-families">Loaded families and styles</h2>
        </div>
        <div className={styles.familyGrid}>
          {families.map((family) => {
            const loaded = availability[family.name];
            return (
              <article key={family.name} className={styles.familyCard}>
                <div className={styles.familyHeader}>
                  <h3>{family.name}</h3>
                  <span>
                    {family.range}
                  </span>
                </div>
                <p className={styles.caption}>{family.purpose}</p>
                <div
                  className={styles.familySpecimen}
                  style={{ fontFamily: `var(--type-family-${family.family})` }}
                >
                  <p className={styles.familySentence}>{family.sentence}</p>
                  <p className={styles.alphabet}>
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ
                    <br />
                    abcdefghijklmnopqrstuvwxyz
                    <br />
                    ÁÉÍÓÚÑ áéíóúñ · 0123456789 · ¿¡!?&amp;@#%+
                  </p>
                  <div
                    className={styles.weights}
                    aria-label={`Normal weights for ${family.name}`}
                  >
                    {family.weights.map((weight) => (
                      <div key={weight}>
                        <span className={styles.weightValue}>{weight}</span>
                        <span style={{ fontWeight: weight }}>
                          Ag
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.italics}>
                    {family.italics.map((weight) => (
                      <div key={weight}>
                        <span
                          className={family.family === "interface" ? "rams-interface-italic" : undefined}
                          style={{ fontStyle: family.family === "interface" ? undefined : "italic", fontWeight: weight }}
                        >
                          Nimble storks
                        </span>
                        <span className={styles.caption}>
                          {weight} ·{" "}
                          {availability[`${family.name}-${weight}-italic`] ===
                          true
                            ? "italic loaded"
                            : availability[
                                  `${family.name}-${weight}-italic`
                                ] === false
                              ? "fallback"
                              : "Loading…"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className={styles.caption}>
                  {family.family === "interface"
                    ? "Upright and italic faces both support the continuous 100–900 weight range."
                    : "The supplied serif face is Regular 400, upright."}
                </p>
                <p className={styles.fontStatus} role="status">
                  {loaded === true
                    ? `${family.name} loaded`
                    : loaded === false
                      ? `Fallback active: ${family.fallback}`
                      : "Loading local font…"}
                </p>
              </article>
            );
          })}
        </div>
        <p className={styles.note}>
          Use Geist Sans for italic emphasis. Font synthesis is disabled throughout the viewer.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="type-responsive">
        <div className={styles.sectionHeading}>
          <h2 id="type-responsive">Responsive behavior and reading measure</h2>
        </div>
        <div className={styles.ruleGrid}>
          <article>
            <h3>Preserve hierarchy</h3>
            <p>
              Reorganize content as the viewport changes width. All seven roles
              retain the selected density; a narrow viewport does not activate
              Compact.
            </p>
          </article>
          <article>
            <h3>Text inputs</h3>
            <p>
              Below {manifest.input.breakpoint}, the input role uses
              a minimum of {manifest.input.mobileMinimum}. With a 16 px root, the
              field never drops below 16 px; in Wide it remains 18 px.
            </p>
          </article>
          <article>
            <h3>Text that can grow</h3>
            <p>
              Allow headings, labels, and paragraphs to wrap. Avoid fixed heights
              and clipping. For continuous reading, limit line length;
              this example has a maximum width of 60ch. Check line breaks
              with the final text.
            </p>
          </article>
        </div>
        <div className={styles.readingSample}>
          <span className={styles.caption}>
            Geist Serif · Reading · 60ch maximum
          </span>
          <p>
            The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. Sphinx of black quartz, judge my vow.
          </p>
        </div>
        <pre className={styles.code}>
          <code>{`.reading {\n  font-family: var(--type-family-editorial);\n  font-size: var(--type-body-size);\n  line-height: var(--type-body-leading);\n  max-inline-size: 60ch;\n}\ninput { font-size: var(--type-input-size); }`}</code>
        </pre>
      </section>

      <section className={styles.section} aria-labelledby="type-spacing">
        <div className={styles.sectionHeading}>
          <h2 id="type-spacing">Kerning and tracking</h2>
        </div>
        <p>
          Kerning adjusts letter pairs using font data.
          Tracking, through <code>letter-spacing</code>, changes the spacing of
          the entire string.
        </p>
        <div className={styles.comparisonGrid}>
          <article className={styles.comparison}>
            <h3>Use · natural spacing</h3>
            <p
              className={styles.spacingSample}
              style={{ fontKerning: "normal", letterSpacing: "normal" }}
            >
              AVATAR To
            </p>
            <code>
              font-kerning: normal;
              <br />
              letter-spacing: normal;
            </code>
            <p className={styles.caption}>
              For reading and controls. Font kerning adjusts letter pairs.
            </p>
          </article>
          <article className={styles.comparison}>
            <h3>Avoid · expanded tracking in paragraphs</h3>
            <p
              className={styles.spacingSample}
              style={{ fontKerning: "normal", letterSpacing: expandedTracking }}
            >
              AVATAR To
            </p>
            <code>
              font-kerning: normal;
              <br />
              letter-spacing: {expandedTracking};
            </code>
            <p className={styles.caption}>
              Expanded spacing makes the word harder to read as a unit.
            </p>
          </article>
        </div>
        <p className={styles.note}>
          Set headlines at their final size and check letter pairs, accents, and punctuation.
          Wordmark rules are in Brand; do not apply them to the interface.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="type-leading">
        <div className={styles.sectionHeading}>
          <h2 id="type-leading">Line height and rhythm</h2>
        </div>
        <p>
          Line height is a unitless factor of the role’s size. Define
          paragraph spacing separately.
        </p>
        <div className={styles.comparisonGrid}>
          {(["heading", "body"] as const).map((id) => (
            <article className={styles.comparison} key={id}>
              <h3>
                {roleNames[id]} ·{" "}
                {manifest.roles.find((role) => role.id === id)!.lineHeight}
              </h3>
              <p
                className={styles.leadingSample}
                style={{ lineHeight: `var(--type-${id}-leading)` }}
              >
                Nimble storks,
                <br />
                swift penguins
                <br />
                in the rain.
              </p>
              <code>line-height: var(--type-{id}-leading);</code>
            </article>
          ))}
        </div>
        <p className={styles.note}>
          Both samples use the Reading size to compare line height alone. Use
          Heading for short titles and Reading for paragraphs; check accents
          and multiple lines with real content.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="type-rules">
        <div className={styles.sectionHeading}>
          <h2 id="type-rules">Usage rules</h2>
        </div>
        <ul className={styles.rules}>
          <li>
            <strong>Separate purpose from appearance.</strong> Use existing roles; changing the editorial family does not mean
            changing the body size.
          </li>
          <li>
            <strong>Use actual font weights.</strong> Geist Sans supports 100–900 in upright and italic. Use Geist Serif at 400 upright.
          </li>
          <li>
            <strong>Prioritize readable content.</strong> Reserve Display for short headlines. Avoid extended all caps, centered
            paragraphs, and help text that competes with body copy.
          </li>
          <li>
            <strong>Separate quantities from identifiers.</strong> Pages, dates, codes, and editable fields retain the interface family.
            Values, signs, units, labels, controls, tables, and charts use Geist Sans. Quantitative values use lining, tabular figures.
            Right-align comparable quantities and keep their precision and units consistent.
            Geist Serif is reserved for explicitly editorial content and specimens.
          </li>
          <li>
            <strong>Preserve semantics.</strong> Heading hierarchy
            depends on the document; Display sizing does not turn a paragraph into
            another h1.
          </li>
          <li>
            <strong>Customize from the shared source.</strong> Edit
            families and roles in <code>tokens.json / typography</code> and sizes
            in <code>typography.fluid.scales</code> . Reserve fixed sizes for
            optical samples or specific geometries and document why.
            Check the result at every density, with enlarged text, and
            with fallback.
          </li>
        </ul>
      </section>
    </div>
  );
}
