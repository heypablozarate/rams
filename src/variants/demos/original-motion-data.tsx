import { useId, useRef, useState, type CSSProperties, type ReactNode, type Ref } from "react";
import { collectionPresentation } from "@/primitives/collection-presentation";
import { Button } from "@/primitives/button";
import { Input } from "@/primitives/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/primitives/select";
import { IconMorph, type IconMorphName } from "@/variants/vendor/registry/components/icon-morph/icon-morph";
import { JsonViewer } from "@/variants/vendor/registry/components/json-viewer/json-viewer";
import { SlotText } from "@/variants/vendor/registry/components/slot-text/slot-text";

// Supporting artwork stays subordinate to the actual interactive control.
const previewFeedbackStyle = {
  display: "block", width: "min(100%, var(--rams-detail-preview-proof-artwork-inline-max))", height: "var(--rams-detail-preview-proof-artwork-block-max)",
  minWidth: 0, objectFit: "contain", justifySelf: "start",
} as const;

const ink = "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))";
const paper = "var(--background, var(--rams-surface, var(--rams-detail-native-surface-fill-fallback)))";
const muted = "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))";
const edge = "var(--border, var(--rams-border, var(--rams-detail-native-border-paint-fallback)))";
const stack: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  minWidth: 0,
  gap: "var(--rams-detail-space-4, var(--rams-detail-preview-scene-gap))",
};
const caption: CSSProperties = {
  margin: 0,
  minWidth: 0,
  color: muted,
  fontSize: "var(--type-caption-size)",
  lineHeight: "var(--type-body-leading)",
  overflowWrap: "anywhere",
};
const diagram: CSSProperties = {
  ...previewFeedbackStyle,
  color: ink,
  background: paper,
  border: `var(--rams-detail-primitive-border-width) solid ${edge}`,
  borderRadius: "var(--radius-control, var(--rams-detail-native-control-radius-fallback))",
};

function Study({
  id,
  place,
  title,
  children,
}: {
  id: string;
  place: string;
  title: string;
  children: ReactNode;
}) {
  const heading = useId();
  return (
    <section
      data-motion-data-scene={id}
      aria-labelledby={heading}
      style={{
        ...stack,
        width: "100%",
        color: ink,
        fontSize: "var(--type-body-size, var(--rams-detail-native-body-size-fallback))",
        lineHeight: "var(--type-body-leading, var(--rams-detail-native-body-leading-fallback))",
        overflowWrap: "anywhere",
      }}
    >
      <header style={{ ...stack, gap: "var(--rams-detail-preview-print-study-copy-gap)" }}>
        <span style={caption}>{place} / print room</span>
        <strong
          id={heading}
          style={{ fontSize: "var(--type-body-size, var(--rams-detail-native-body-size-fallback))", fontWeight: "var(--rams-detail-label-weight)" }}
        >
          {title}
        </strong>
      </header>
      {children}
    </section>
  );
}

function VariableSelect({
  label,
  value,
  options,
  onValueChange,
  triggerRef,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onValueChange: (value: string) => void;
  triggerRef?: Ref<HTMLButtonElement>;
}) {
  const id = useId();
  return (
    <div style={{ ...stack, gap: "var(--rams-detail-preview-control-stack-gap)" }}>
      <label
        htmlFor={id}
        style={{ fontSize: "var(--type-control-size, var(--rams-detail-native-control-size-fallback))" }}
      >
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger ref={triggerRef} id={id} style={{ width: "100%", minWidth: 0 }}>
          <SelectValue>
            {options.find((option) => option.value === value)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const proofControls: readonly { name: IconMorphName; label: string }[] = [
  { name: "menu", label: "Workshop menu" },
  { name: "play", label: "Proof reel" },
  { name: "plus", label: "Sheet selection" },
  { name: "copy", label: "Reference confirmation" },
  { name: "theme", label: "Proof lighting" },
  { name: "chevron", label: "Process details" },
  { name: "bell", label: "Print alerts" },
  { name: "heart", label: "Saved study" },
];

export function MotionReversibleProofIconDemo() {
  const [active, setActive] = useState<Partial<Record<IconMorphName, boolean>>>({});
  return (
    <Study id="reversible-proof" place="Río Negro" title="Proof-room icon controls">
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, var(--rams-detail-preview-icon-morph-tile-measure)), 1fr))",
        gap: "var(--rams-detail-space-4, var(--rams-detail-preview-scene-gap))",
        minWidth: 0,
      }}>
        {proofControls.map(({ name, label }) => (
          <div key={name} style={{ ...stack, justifyItems: "center", alignContent: "start", gap: "var(--rams-detail-docs-space-tight)" }}>
            <Button type="button" variant="secondary" size="icon"
              aria-label={label} aria-pressed={Boolean(active[name])}
              onClick={() => setActive(current => ({ ...current, [name]: !current[name] }))}>
              <IconMorph name={name} state={Boolean(active[name])}
                style={{ inlineSize: "var(--rams-detail-preview-icon-morph-glyph-size)", blockSize: "var(--rams-detail-preview-icon-morph-glyph-size)" }} />
            </Button>
            <span style={{ ...caption, textAlign: "center" }}>{label}</span>
          </div>
        ))}
      </div>
    </Study>
  );
}

const formats = [
  { value: "folio", label: "Folio", perSheet: 2, inkPasses: 2 },
  { value: "cards", label: "Cards", perSheet: 4, inkPasses: 1 },
];
const runSizes = [
  { value: "24", label: "24" },
  { value: "48", label: "48" },
  { value: "72", label: "72" },
];
const originalTitle = "Rain atlas";

function makePrintTicket(
  title: string,
  format: (typeof formats)[number],
  copies: number,
) {
  const count = Math.ceil(copies / format.perSheet);
  return {
    title,
    city: "Tucumán",
    copies,
    layout: {
      format: format.value,
      perSheet: format.perSheet,
      inkPasses: format.inkPasses,
    },
    totals: { sheets: count, impressions: count * format.inkPasses },
    sheets: Array.from({ length: count }, (_, index) => ({
      sheet: index + 1,
      copies: Math.min(format.perSheet, copies - index * format.perSheet),
    })),
  };
}

export function MotionPrintTicketJsonDemo() {
  const titleId = useId();
  const searchId = useId();
  const [title, setTitle] = useState(originalTitle);
  const [formatName, setFormatName] = useState("folio");
  const [copies, setCopies] = useState("24");
  const [query, setQuery] = useState("");
  const searchControl = useRef<HTMLInputElement>(null);
  const [selectedPath, setSelectedPath] = useState("ticket");
  const selectedFormat = formats.find((format) => format.value === formatName)!;
  const ticket = makePrintTicket(title, selectedFormat, Number(copies));
  return (
    <Study id="print-ticket" place="Tucumán" title="An edition in plain data">
      <label
        htmlFor={titleId}
        style={{
          ...stack,
          gap: "var(--rams-detail-preview-control-stack-gap)",
          fontSize: "var(--type-control-size, var(--rams-detail-native-control-size-fallback))",
        }}
      >
        Edition title
        <Input
          id={titleId}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <VariableSelect
        label="Format"
        value={formatName}
        onValueChange={setFormatName}
        options={formats}
      />
      <VariableSelect
        label="Copies"
        value={copies}
        onValueChange={setCopies}
        options={runSizes}
      />
      <output style={{ ...stack, ...caption, gap: "var(--rams-detail-preview-print-study-copy-gap)" }}>
        <span>
          {ticket.copies} copies · {ticket.layout.perSheet} per sheet.
        </span>
        <span>
          {ticket.totals.sheets} sheets × {ticket.layout.inkPasses} ink{" "}
          {ticket.layout.inkPasses === 1 ? "pass" : "passes"} ={" "}
          {ticket.totals.impressions} impressions.
        </span>
      </output>
      <label
        htmlFor={searchId}
        style={{
          ...stack,
          gap: "var(--rams-detail-preview-control-stack-gap)",
          fontSize: "var(--type-control-size, var(--rams-detail-native-control-size-fallback))",
        }}
      >
        Find in ticket
        <Input
          id={searchId}
          ref={searchControl}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <Button
        type="button"
        variant="outline"
        disabled={!query}
        onClick={(event) => {
          if (event.currentTarget === document.activeElement)
            searchControl.current?.focus({ preventScroll: true });
          setQuery("");
        }}
      >
        Clear search
      </Button>
      <JsonViewer
        data={ticket}
        rootName="ticket"
        label="Print ticket"
        pageSize={collectionPresentation.printTicketPageSize}
        query={query}
        onQueryChange={setQuery}
        searchable={false}
        copyable={false}
        showPath={false}
        maxHeight="var(--rams-detail-preview-json-ticket-tree-max-block)"
        onSelect={({ path }) => setSelectedPath(path)}
      />
      <output style={caption}>
        Selected path:{" "}
        <code style={{ color: ink, overflowWrap: "anywhere" }}>
          {selectedPath}
        </code>
      </output>
    </Study>
  );
}

function formatCorrection(value: number) {
  return `${value < 0 ? "−" : value > 0 ? "+" : ""}${Math.abs(value).toFixed(2)}`;
}
const corrections = [-1.25, 0, 0.5, 1.5].map((value) => ({
  value: String(value),
  label: formatCorrection(value),
}));

export function MotionRegistrationSlotDemo() {
  const [correction, setCorrection] = useState(-1.25);
  const correctionTrigger = useRef<HTMLButtonElement>(null);
  return (
    <Study
      id="registration-correction"
      place="Rosario"
      title="Find the registration line"
    >
      <svg
        role="img"
        aria-label={`Magnified registration detail, artwork ${Math.abs(correction).toFixed(2)} millimetres ${correction < 0 ? "left of centre" : correction > 0 ? "right of centre" : "from centre"}.`}
        viewBox="0 0 240 150"
        style={diagram}
      >
        <rect x="30" y="30" width="180" height="90" fill="none" stroke={ink} />
        <path
          d="M120 16v118M108 24h24M108 126h24"
          fill="none"
          stroke={muted}
          strokeDasharray="var(--rams-detail-preview-registration-guide-dash)"
        />
        <g
          data-correction-mm={correction}
          transform={`translate(${correction * 12} 0)`}
          fill="none"
          stroke={ink}
        >
          <rect
            x="72"
            y="50"
            width="96"
            height="50"
            fill={ink}
            fillOpacity="var(--rams-detail-preview-registration-plate-wash-opacity)"
          />
          <path d="M84 91Q102 43 124 72T156 58" strokeWidth="var(--rams-detail-preview-registration-impression-stroke)" />
          <path d="M120 41v68M112 75h16" />
        </g>
      </svg>
      <div style={{ ...stack, gap: "var(--rams-detail-preview-print-study-copy-gap)" }}>
        <span style={caption}>Horizontal correction</span>
        <SlotText
          value={correction}
          format={formatCorrection}
          spins={0}
          align="end"
          announce
          style={{ fontSize: "var(--type-body-size, var(--rams-detail-native-body-size-fallback))", color: ink }}
        />
        <span style={caption}>mm</span>
      </div>
      <VariableSelect
        label="Correction (mm)"
        triggerRef={correctionTrigger}
        value={String(correction)}
        options={corrections}
        onValueChange={(value) => setCorrection(Number(value))}
      />
      <Button
        type="button"
        variant="outline"
        disabled={correction === 0}
        onClick={event => {
          const ownsFocus = document.activeElement === event.currentTarget;
          setCorrection(0);
          if (ownsFocus) correctionTrigger.current?.focus({ preventScroll: true });
        }}
      >
        Centre artwork
      </Button>
      <output style={caption}>
        {correction < 0
          ? "Artwork sits left of registration."
          : correction > 0
            ? "Artwork sits right of registration."
            : "Artwork is centred on registration."}
      </output>
    </Study>
  );
}
