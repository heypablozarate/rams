import { useState, type CSSProperties } from "react";
import { Combobox } from "@/variants/vendor/registry/components/combobox/combobox";
import { contentPresentation } from "@/primitives/content-presentation";
import { MultiSelect } from "@/variants/vendor/registry/components/multi-select/multi-select";
import { TagInput } from "@/variants/vendor/registry/components/tag-input/tag-input";

// Supporting artwork stays subordinate to the actual interactive control.
const previewFeedbackStyle = {
  display: "block", width: "min(100%, var(--rams-detail-preview-proof-artwork-inline-max))", height: "var(--rams-detail-preview-proof-artwork-block-max)",
  minWidth: 0, objectFit: "contain", justifySelf: "start",
} as const;

const ink = "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))";
const surface = "var(--background, var(--rams-surface, var(--rams-detail-native-surface-fill-fallback)))";
const muted = "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))";
const layout: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  minWidth: 0,
  width: "100%",
  gap: "var(--rams-detail-space-4, calc(var(--rams-detail-preview-space-step-fallback) * 4))",
  color: ink,
  fontSize: "var(--type-body-size, var(--rams-detail-native-body-size-fallback))",
  lineHeight: "var(--rams-detail-preview-print-scene-leading)",
  overflowWrap: "anywhere",
};
const note: CSSProperties = {
  margin: 0,
  color: muted,
  fontSize: "var(--type-caption-size, var(--rams-detail-preview-print-scene-caption-size-fallback))",
  lineHeight: "var(--rams-detail-preview-print-scene-leading)",
  overflowWrap: "anywhere",
};
const artwork: CSSProperties = {
  ...previewFeedbackStyle,
  color: ink,
  background: surface,
};

const trims = [
  {
    value: "card",
    label: "Card",
    width: 90,
    height: 140,
    keywords: ["small", "postcard"],
  },
  {
    value: "leaflet",
    label: "Leaflet",
    width: 140,
    height: 200,
    keywords: ["fold", "reading"],
  },
  {
    value: "bookmark",
    label: "Bookmark",
    width: 45,
    height: 180,
    keywords: ["tall", "narrow"],
  },
  {
    value: "poster",
    label: "Poster",
    width: 260,
    height: 380,
    keywords: ["large", "oversize"],
    disabled: true,
  },
];

function sheetPlan(width: number, height: number, copies: number) {
  const columns = Math.floor(240 / width);
  const rows = Math.floor(330 / height);
  const perSheet = columns * rows;
  const sheets = perSheet ? Math.ceil(copies / perSheet) : 0;
  return {
    columns,
    rows,
    perSheet,
    sheets,
    spare: sheets * perSheet - (perSheet ? copies : 0),
  };
}

export function MotionTrimComboboxDemo() {
  const [value, setValue] = useState("card");
  const trim = trims.find((option) => option.value === value);
  const selected = trim && !trim.disabled ? trim : undefined;
  const plan = selected ? sheetPlan(selected.width, selected.height, 72) : null;
  return (
    <section
      style={{ ...layout, lineHeight: "var(--rams-detail-preview-print-scene-leading)" }}
      aria-label="Rosario trim imposition"
      data-advanced-selection-scene="trim-imposition"
    >
      <header>
        <p style={{ ...note, lineHeight: "var(--rams-detail-preview-print-scene-leading)" }}>Rosario / edition layout</p>
        <strong>One sheet, several cuts</strong>
      </header>
      <Combobox
        label="Trim size"
        value={value}
        onValueChange={setValue}
        options={trims}
        placeholder="Find a trim"
        emptyMessage="No trim matches."
        description="Poster is unavailable: its 260 × 380 mm trim exceeds the 240 × 330 mm working area."
      />
      <svg
        role="img"
        aria-label={
          selected && plan
            ? `${selected.label} imposition, ${plan.perSheet} copies per sheet.`
            : "No trim selected in the 240 by 330 millimetre working area."
        }
        viewBox="0 0 240 330"
        style={artwork}
      >
        <rect
          x="1"
          y="1"
          width="238"
          height="328"
          fill="none"
          stroke="currentColor"
          strokeWidth="var(--rams-detail-preview-trim-sheet-frame-stroke)"
        />
        {selected &&
          plan &&
          Array.from({ length: plan.perSheet }, (_, index) => {
            const x =
              (240 - plan.columns * selected.width) / 2 +
              (index % plan.columns) * selected.width;
            const y =
              (330 - plan.rows * selected.height) / 2 +
              Math.floor(index / plan.columns) * selected.height;
            return (
              <g
                key={index}
                data-imposed-copy={index + 1}
                transform={`translate(${x} ${y})`}
              >
                <rect
                  width={selected.width}
                  height={selected.height}
                  fill="currentColor"
                  fillOpacity="var(--rams-detail-preview-trim-copy-fill-opacity)"
                  stroke="currentColor"
                  strokeWidth="var(--rams-detail-preview-trim-copy-edge-stroke)"
                />
                <path
                  d={`M${selected.width * 0.1} ${selected.height * 0.72}Q${selected.width * 0.32} ${selected.height * 0.2} ${selected.width * 0.54} ${selected.height * 0.55}T${selected.width * 0.9} ${selected.height * 0.4}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="var(--rams-detail-preview-trim-copy-illustration-stroke)"
                />
                <path
                  d={`M${selected.width * 0.14} ${selected.height * 0.2}h${selected.width * 0.35}M${selected.width * 0.14} ${selected.height * 0.26}h${selected.width * 0.2}`}
                  stroke="currentColor"
                  strokeWidth="var(--rams-detail-preview-trim-copy-text-stroke)"
                />
              </g>
            );
          })}
      </svg>
      <output style={{ ...layout, ...note, lineHeight: "var(--rams-detail-preview-print-scene-leading)", gap: "var(--rams-detail-preview-trim-result-gap)" }}>
        {selected && plan ? (
          <>
            <span>
              {selected.label}: {selected.width} × {selected.height} mm.
            </span>
            <span>
              72 copies · {plan.perSheet} per sheet · {plan.sheets} sheets.
            </span>
            <span>
              {plan.spare
                ? `${plan.spare} spare positions on the last sheet.`
                : "No spare positions."}
            </span>
          </>
        ) : (
          <span>Choose a trim to build the sheet.</span>
        )}
        <span>Fixed orientation · no gutters.</span>
      </output>
    </section>
  );
}

const layers = [
  { value: "line", label: "Line" },
  { value: "tone", label: "Tone" },
  { value: "grain", label: "Grain" },
  { value: "type", label: "Type" },
];

export function MotionSeparationMultiSelectDemo() {
  const [value, setValue] = useState(["line", "tone"]);
  const active = layers.filter((layer) => value.includes(layer.value));
  return (
    <section
      style={layout}
      aria-label="Mendoza print separations"
      data-advanced-selection-scene="separations"
    >
      <header>
        <p style={note}>Mendoza / overprint study</p>
        <strong>Build the separation set</strong>
      </header>
      <MultiSelect
        label="Ink layers"
        options={layers}
        value={value}
        onValueChange={setValue}
        maxVisible={contentPresentation.multiSelect.separationPreviewVisibleLabels}
        placeholder="Choose layers"
        description="Each selected layer adds one pass to the proof run."
      />
      <svg
        role="img"
        aria-label={`Mendoza print with ${active.length} selected ${active.length === 1 ? "separation" : "separations"}.`}
        viewBox="0 0 320 220"
        style={artwork}
      >
        <rect
          x="16"
          y="16"
          width="288"
          height="188"
          fill="none"
          stroke="currentColor"
          strokeWidth="var(--rams-detail-preview-separation-sheet-frame-stroke)"
        />
        {value.includes("tone") && (
          <g data-separation="tone" fill="currentColor" opacity="var(--rams-detail-preview-separation-tone-wash)">
            <rect x="43" y="39" width="113" height="138" />
            <circle cx="200" cy="106" r="65" />
          </g>
        )}
        {value.includes("line") && (
          <g data-separation="line" fill="none" stroke="currentColor">
            <path d="M38 164Q105 35 174 113T282 64" strokeWidth="var(--rams-detail-preview-separation-line-stroke)" />
            <path d="M38 178Q105 49 174 127T282 78" />
          </g>
        )}
        {value.includes("grain") && (
          <g data-separation="grain" fill="currentColor">
            {Array.from({ length: 15 }, (_, index) => (
              <circle
                key={index}
                cx={74 + (index % 5) * 36}
                cy={63 + Math.floor(index / 5) * 37}
                r={index % 3 === 0 ? 3 : 1.5}
              />
            ))}
          </g>
        )}
        {value.includes("type") && (
          <g data-separation="type" fill="currentColor">
            <rect x="57" y="49" width="91" height="7" />
            <rect x="57" y="63" width="66" height="4" />
            <rect x="183" y="164" width="79" height="7" />
            <rect x="207" y="179" width="55" height="3" />
          </g>
        )}
      </svg>
      <output style={{ ...layout, ...note, gap: "var(--rams-detail-preview-print-study-copy-gap)" }}>
        <span>
          {active.length
            ? `${active.length} ${active.length === 1 ? "separation" : "separations"} selected.`
            : "No ink layers selected."}
        </span>
        <span>
          60 sheets × {active.length} {active.length === 1 ? "pass" : "passes"}{" "}
          = {60 * active.length} impressions.
        </span>
      </output>
    </section>
  );
}

const archive = [
  {
    id: "river-fold",
    title: "River fold",
    tags: ["river", "fold"],
    sheets: 12,
  },
  {
    id: "market-grid",
    title: "Market grid",
    tags: ["grid", "line"],
    sheets: 8,
  },
  {
    id: "delta-lines",
    title: "Delta lines",
    tags: ["river", "line"],
    sheets: 16,
  },
  { id: "clay-grain", title: "Clay grain", tags: ["grain"], sheets: 10 },
  { id: "night-fold", title: "Night fold", tags: ["fold", "grain"], sheets: 6 },
  {
    id: "corner-grid",
    title: "Corner grid",
    tags: ["grid", "fold"],
    sheets: 14,
  },
];

function matchingEditions(tags: string[]) {
  const required = tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  return archive.filter((edition) =>
    required.every((tag) => edition.tags.includes(tag)),
  );
}

export function MotionArchiveTagInputDemo() {
  const [tags, setTags] = useState(["river"]);
  const matches = matchingEditions(tags);
  const sheets = matches.reduce((sum, edition) => sum + edition.sheets, 0);
  return (
    <section
      style={layout}
      aria-label="La Plata paper index"
      data-advanced-selection-scene="archive-filters"
    >
      <header>
        <p style={note}>La Plata / paper index</p>
        <strong>Find a family of editions</strong>
      </header>
      <TagInput
        label="Archive filters"
        value={tags}
        onValueChange={setTags}
        placeholder="Add a keyword"
        description="Enter or comma adds a filter. Every tag must match."
      />
      <output style={note}>
        {matches.length} {matches.length === 1 ? "edition" : "editions"} ·{" "}
        {sheets} reference sheets.
      </output>
      {matches.length ? (
        <ul style={{ ...layout, listStyle: "none", padding: 0, margin: 0 }}>
          {matches.map((edition) => (
            <li
              key={edition.id}
              data-edition={edition.id}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr)",
                minWidth: 0,
                gap: "var(--rams-detail-preview-print-study-copy-gap)",
              }}
            >
              <strong style={{ fontWeight: "var(--rams-detail-label-weight)" }}>{edition.title}</strong>
              <span style={note}>
                {edition.sheets} sheets · {edition.tags.join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={note}>
          No editions match every filter. Remove a tag to widen the selection.
        </p>
      )}
    </section>
  );
}
