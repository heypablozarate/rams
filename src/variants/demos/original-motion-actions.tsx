import { printPreviewGeometry } from "@/variants/print-preview-geometry";
import {
  useEffect,
  useLayoutEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  FlipHorizontal2,
  Grid2X2,
  Maximize2,
  MoveHorizontal,
  RotateCcw,
  RotateCw,
  ScanLine,
  Square,
  SunMoon,
} from "lucide-react";
import { Input } from "@/primitives/input";
import { Button } from "@/variants/vendor/registry/components/button/button";
import { ActionButton } from "@/variants/vendor/registry/components/action-button/action-button";
import { SplitButton } from "@/variants/vendor/registry/components/split-button/split-button";
import { ButtonGroup } from "@/variants/vendor/registry/components/button-group/button-group";
import { FloatingButtonGroup } from "@/variants/vendor/registry/components/floating-button-group/floating-button-group";
import { ExpandingButtonGroup } from "@/variants/vendor/registry/components/expanding-button-group/expanding-button-group";

const frame: CSSProperties = {
  display: "grid",
  gap: "var(--rams-detail-space-3)",
  width: "100%",
  maxInlineSize: "var(--rams-detail-action-scene-measure)",
  minWidth: 0,
  marginInline: "auto",
  color: "var(--rams-detail-foreground)",
  fontSize: "var(--type-body-size)",
};
const row: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  gap: "var(--rams-detail-space-2)",
  minWidth: 0,
};
const paper: CSSProperties = {
  display: "block",
  width: "100%",
  height: "auto",
  maxWidth: "var(--rams-detail-preview-proof-artwork-inline-max)",
  maxHeight: "var(--rams-detail-preview-proof-artwork-block-max)",
  marginInline: "auto",
  border: "var(--rams-detail-primitive-border-width) solid var(--border,var(--rams-border))",
  borderRadius: "var(--radius-control)",
  background: "var(--background,var(--rams-surface))",
  color: "var(--foreground,var(--rams-ink))",
};
const proofArtwork: CSSProperties = {
  display: "block",
  inlineSize: "100%",
  blockSize: "auto",
  maxInlineSize: "var(--rams-detail-preview-proof-artwork-inline-max)",
  maxBlockSize: "var(--rams-detail-preview-proof-artwork-block-max)",
  marginInline: "auto",
  border: "var(--rams-detail-primitive-border-width) solid var(--rams-detail-border)",
  borderRadius: "var(--radius-control)",
  background: "var(--rams-detail-background)",
  color: "var(--rams-detail-foreground)",
};
const impositionGlyph: CSSProperties = {
  inlineSize: "var(--rams-detail-motion-button-glyph-size)",
  blockSize: "var(--rams-detail-motion-button-glyph-size)",
};
function Scene({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  const heading = useId();
  return (
    <section aria-labelledby={heading} data-actions-scene={id} style={frame}>
      <header style={{ display: "grid", gap: "var(--rams-detail-space-1)" }}>
        <span
          style={{
            color: "var(--rams-detail-text-muted)",
            fontSize: "var(--type-caption-size)",
            lineHeight: "var(--type-caption-leading)",
          }}
        >
          Print room / Argentina
        </span>
        <strong id={heading} style={{ fontWeight: "var(--type-title-weight)" }}>{title}</strong>
      </header>
      {children}
    </section>
  );
}
function Caption({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      style={{
        margin: 0,
        color: "var(--rams-detail-text-muted)",
        fontSize: "var(--type-caption-size)",
        lineHeight: "var(--type-caption-leading)",
        overflowWrap: "anywhere",
      }}
    >
      {children}
    </p>
  );
}

/** Changing real imposition content also exercises shorter/longer button labels. */
export function MotionImpositionButtonDemo() {
  const [spread, setSpread] = useState(false);
  const foldAction = useRef<HTMLButtonElement>(null);
  return (
    <Scene id="imposition" title="A river, four pages">
      <div style={row}>
        <Button ref={foldAction} onClick={() => setSpread((value) => !value)}>
          {spread ? (
            <>
              <Square style={impositionGlyph} aria-hidden="true" /> Fold booklet
            </>
          ) : (
            <>
              <MoveHorizontal style={impositionGlyph} aria-hidden="true" /> Unfold sheet
            </>
          )}
        </Button>
        <Button
          variant="outline"
          disabled={!spread}
          onClick={(event) => {
            const returnFocus = event.currentTarget === document.activeElement;
            setSpread(false);
            if (returnFocus) foldAction.current?.focus({ preventScroll: true });
          }}
        >
          Reset fold
        </Button>
      </div>
      <svg
        role="img"
        aria-label={
          spread
            ? "Unfolded Rosario booklet: pages four, one, two, three"
            : "Folded Rosario booklet cover"
        }
        viewBox="0 0 400 220"
        style={proofArtwork}
      >
        <g fill="none" stroke="currentColor">
          <rect
            x={spread ? 28 : 112}
            y="24"
            width={spread ? 344 : 176}
            height="172"
          />
          <path
            d={
              spread
                ? "M200 24v172M32 135Q86 75 143 135T257 135T368 135"
                : "M116 135Q158 75 204 135T284 135"
            }
          />
          <path
            strokeDasharray="var(--rams-detail-preview-imposition-fold-guide-dash)"
            d={spread ? "M114 24v172M286 24v172" : "M200 24v172"}
          />
        </g>
        <g fill="currentColor" fontFamily="inherit" textAnchor="middle">
          <text x="200" y="65" fontSize="var(--rams-detail-preview-imposition-title-size)">
            ROSARIO / RIVER STUDIES
          </text>
          <text x="200" y="175" fontSize="var(--rams-detail-preview-imposition-caption-size)">
            {spread
              ? "04     /     01     /     02     /     03"
              : "01 / COVER"}
          </text>
        </g>
      </svg>
      <Caption>
        {spread
          ? "Four-page imposition · two folds shown"
          : "Folded cover · one page visible"}
      </Caption>
    </Scene>
  );
}

/** Web Crypto hashes the edition name and drawing parameters; pending never waits for a demonstration timer. */
export function MotionProofActionDemo() {
  const [edition, setEdition] = useState("Córdoba / Tile study 08");
  const [proof, setProof] = useState<{
    edition: string;
    digest: string;
  } | null>(null);
  const [error, setError] = useState("");
  const id = useId();
  const alive = useRef(true);
  const generation = useRef(0);
  useLayoutEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      generation.current += 1;
    };
  }, []);
  return (
    <Scene id="proof" title="Tile study / proof fingerprint">
      <label htmlFor={id} style={{ display: "grid", gap: "var(--rams-detail-space-2)" }}>
        Edition name
        <Input
          id={id}
          value={edition}
          onChange={(event) => {
            generation.current += 1;
            setEdition(event.target.value);
            setProof(null);
            setError("");
          }}
        />
      </label>
      <div style={row}>
        <ActionButton
          label="Check proof"
          pendingLabel="Fingerprinting"
          successLabel="Proof checked"
          onAction={async () => {
            const request = ++generation.current;
            const name = edition.trim();
            setError("");
            if (!name)
              throw new Error(
                "Enter an edition name before checking the proof.",
              );
            const bytes = new TextEncoder().encode(
              JSON.stringify({
                edition: name,
                artwork: "cordoba-tile-08",
                quarterTurns: [0, 90, 180, 270],
              }),
            );
            const stale = () =>
              !alive.current || request !== generation.current;
            const hash = await crypto.subtle
              .digest("SHA-256", bytes)
              .catch((reason) => {
                if (stale())
                  throw new DOMException("Edition changed", "AbortError");
                throw reason;
              });
            if (stale())
              throw new DOMException("Edition changed", "AbortError");
            const digest = Array.from(new Uint8Array(hash), (byte) =>
              byte.toString(16).padStart(2, "0"),
            ).join("");
            setProof({ edition: name, digest });
          }}
          onActionError={(reason) => {
            if (
              !alive.current ||
              (reason instanceof DOMException && reason.name === "AbortError")
            )
              return;
            setError(
              reason instanceof Error
                ? reason.message
                : "Proof could not be checked. Try again.",
            );
          }}
        />
      </div>
      {error && (
        <p role="alert" style={{ margin: 0, color: "var(--rams-detail-danger)", overflowWrap: "anywhere" }}>
          {error}
        </p>
      )}
      <svg
        role="img"
        aria-label="Córdoba tile study: four interlocking quarter circles"
        viewBox="0 0 400 210"
        style={{
          display: "block",
          inlineSize: "100%",
          blockSize: "auto",
          maxInlineSize: "var(--rams-detail-proof-action-demo-artwork-inline-max)",
          maxBlockSize: "var(--rams-detail-proof-action-demo-artwork-block-max)",
          marginInline: "auto",
          border: "var(--rams-detail-primitive-border-width) solid var(--rams-detail-border)",
          borderRadius: "var(--radius-control)",
          background: "var(--rams-detail-background)",
          color: "var(--rams-detail-foreground)",
        }}
      >
        <g
          transform="translate(120 25)"
          fill="none"
          stroke="currentColor"
          strokeWidth="var(--rams-detail-preview-fingerprint-stroke)"
        >
          {[0, 1, 2, 3].map((index) => (
            <g key={index} transform={`rotate(${index * 90} 80 80)`}>
              <path d="M0 0h80v80H0zM0 80A80 80 0 0 1 80 0M0 60A60 60 0 0 1 60 0M0 40A40 40 0 0 1 40 0" />
            </g>
          ))}
        </g>
      </svg>
      <Caption>
        {proof ? (
          <>
            {proof.edition}
            <br />
            SHA-256{" "}
            <code style={{ fontFamily: "var(--type-code-family)", overflowWrap: "anywhere" }}>{proof.digest}</code>
          </>
        ) : (
          "Tile study 08 · four quarter turns"
        )}
      </Caption>
    </Scene>
  );
}

const downloadArtwork = (square: boolean) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${square ? 320 : 240} 320"><rect width="100%" height="100%" fill="${printPreviewGeometry.plateExport.paper}"/><g fill="none" stroke="${printPreviewGeometry.plateExport.ink}" stroke-width="${printPreviewGeometry.plateExport.strokeWidth}"><circle cx="${square ? 160 : 120}" cy="142" r="88"/><circle cx="${square ? 160 : 120}" cy="142" r="61"/><path d="M32 142h${square ? 256 : 176}M${square ? 160 : 120} 40v200"/></g><g fill="${printPreviewGeometry.plateExport.ink}" font-family="${printPreviewGeometry.plateExport.fontFamily}" text-anchor="middle"><text x="${square ? 160 : 120}" y="274" font-size="${printPreviewGeometry.plateExport.titleSize}">MENDOZA</text><text x="${square ? 160 : 120}" y="294" font-size="${printPreviewGeometry.plateExport.captionSize}">PRINT EXCHANGE / 08</text></g></svg>`;

export function MotionPrintExportDemo() {
  const [format, setFormat] = useState<"portrait" | "square">("portrait");
  const [exported, setExported] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const currentUrl = useRef<string | null>(null);
  useEffect(
    () => () => {
      if (currentUrl.current) URL.revokeObjectURL(currentUrl.current);
    },
    [],
  );
  const square = format === "square";
  function download(next: "portrait" | "square") {
    if (currentUrl.current) URL.revokeObjectURL(currentUrl.current);
    const url = URL.createObjectURL(
      new Blob([downloadArtwork(next === "square")], { type: "image/svg+xml" }),
    );
    currentUrl.current = url;
    const name = `mendoza-print-${next}.svg`;
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    setFormat(next);
    setExported({ url, name });
  }
  return (
    <Scene id="export" title="Mendoza / print exchange">
      <div style={row}>
        <SplitButton
          label={square ? "Save square" : "Save portrait"}
          icon={<Download size="var(--rams-detail-motion-button-glyph-size)" />}
          onClick={() => download(format)}
          actions={[
            {
              label: "Download portrait SVG",
              icon: <Maximize2 size="var(--rams-detail-preview-menu-glyph-size)" />,
              onSelect: () => download("portrait"),
            },
            {
              label: "Download square SVG",
              icon: <Square size="var(--rams-detail-preview-menu-glyph-size)" />,
              onSelect: () => download("square"),
            },
          ]}
        />
      </div>
      <svg
        role="img"
        aria-label={`${format} print exchange poster`}
        viewBox={`0 0 ${square ? 320 : 240} 320`}
        style={paper}
      >
        <g fill="none" stroke="currentColor" strokeWidth={printPreviewGeometry.plateExport.strokeWidth}>
          <circle cx={square ? 160 : 120} cy="142" r="88" />
          <circle cx={square ? 160 : 120} cy="142" r="61" />
          <path
            d={`M32 142h${square ? 256 : 176}M${square ? 160 : 120} 40v200`}
          />
        </g>
        <g fill="currentColor" fontFamily="inherit" textAnchor="middle">
          <text x={square ? 160 : 120} y="274" fontSize="var(--rams-detail-preview-export-title-size)">
            MENDOZA
          </text>
          <text x={square ? 160 : 120} y="294" fontSize="var(--rams-detail-preview-export-caption-size)">
            PRINT EXCHANGE / 08
          </text>
        </g>
      </svg>
      <Caption>
        {exported ? (
          <>
            Created{" "}
            <a href={exported.url} download={exported.name}>
              {exported.name}
            </a>{" "}
            · editable one-colour artwork
          </>
        ) : (
          "Download an original SVG in either proportion."
        )}
      </Caption>
    </Scene>
  );
}

const signs = [
  {
    district: "NORTE",
    line: "River walk",
    number: "01",
    path: "M32 95h240M32 115h200M32 135h160",
  },
  {
    district: "CENTRO",
    line: "Print room",
    number: "02",
    path: "M40 65v95h230M70 65v65h170M100 65v35h110",
  },
  {
    district: "SUR",
    line: "Book market",
    number: "03",
    path: "M35 150l45-80 45 80 45-80 45 80 45-80",
  },
];
export function MotionEditionNavigationDemo() {
  const [index, setIndex] = useState(0);
  const sign = signs[index]!;
  return (
    <Scene id="editions" title="Rosario / wayfinding sheets">
      <div style={row}>
        <ButtonGroup
          label="Wayfinding sheets"
          collapseLabels
          items={[
            {
              id: "previous",
              label: "Previous sheet",
              icon: <ArrowLeft />,
              disabled: index === 0,
              onSelect: () => setIndex((value) => Math.max(0, value - 1)),
            },
            {
              id: "next",
              label: "Next sheet",
              icon: <ArrowRight />,
              disabled: index === signs.length - 1,
              onSelect: () =>
                setIndex((value) => Math.min(signs.length - 1, value + 1)),
            },
          ]}
          menu={{
            label: "Choose sheet",
            items: signs.map((item, itemIndex) => ({
              id: item.number,
              label: `${item.number} / ${item.district}`,
              disabled: itemIndex === index,
              onSelect: () => setIndex(itemIndex),
            })),
          }}
        />
      </div>
      <svg
        role="img"
        aria-label={`Sheet ${index + 1}: ${sign.district}, ${sign.line}`}
        viewBox="0 0 320 220"
        style={proofArtwork}
      >
        <path d={sign.path} fill="none" stroke="currentColor" strokeWidth="var(--rams-detail-preview-sign-route-stroke)" />
        <g fill="currentColor" fontFamily="inherit">
          <text x="32" y="42" fontSize="var(--rams-detail-preview-sign-district-size)">
            {sign.number} / ROSARIO
          </text>
          <text x="32" y="187" fontSize="var(--rams-detail-preview-sign-name-size)">
            {sign.district}
          </text>
          <text x="32" y="205" fontSize="var(--rams-detail-preview-sign-number-size)">
            {sign.line.toUpperCase()}
          </text>
        </g>
      </svg>
      <Caption>
        Sheet {index + 1} of {signs.length} · {sign.line}
      </Caption>
    </Scene>
  );
}

export function MotionCompositionToolsDemo() {
  const [grid, setGrid] = useState(false);
  const [marks, setMarks] = useState(false);
  const [flipped, setFlipped] = useState(false);
  return (
    <Scene id="composition" title="Paraná / two-ink composition">
      <div style={row}>
        <FloatingButtonGroup
          label="Composition tools"
          variant="floating"
          iconOnly
          items={[
            {
              id: "grid",
              label: "Show alignment grid",
              icon: <Grid2X2 />,
              pressed: grid,
              onSelect: () => setGrid((value) => !value),
            },
            {
              id: "marks",
              label: "Show registration marks",
              icon: <ScanLine />,
              pressed: marks,
              onSelect: () => setMarks((value) => !value),
            },
            { type: "separator", id: "divider" },
            {
              id: "mirror",
              label: "Mirror composition",
              icon: <FlipHorizontal2 />,
              pressed: flipped,
              onSelect: () => setFlipped((value) => !value),
            },
          ]}
        />
      </div>
      <svg
        role="img"
        aria-label={`Paraná composition, ${flipped ? "mirrored" : "original"}${grid ? ", grid visible" : ""}${marks ? ", registration marks visible" : ""}`}
        viewBox="0 0 360 240"
        style={proofArtwork}
      >
        {grid && (
          <g stroke="currentColor" opacity="var(--rams-detail-preview-composition-grid-opacity)">
            {[60, 120, 180, 240, 300].map((x) => (
              <path key={x} d={`M${x} 24v192`} />
            ))}
            {[60, 120, 180].map((y) => (
              <path key={y} d={`M24 ${y}h312`} />
            ))}
          </g>
        )}
        <g transform={flipped ? "translate(360 0) scale(-1 1)" : undefined}>
          <path d="M55 42h124v154H55z" fill="currentColor" opacity="var(--rams-detail-preview-composition-shape-opacity)" />
          <path
            d="M105 178Q110 55 238 60Q302 62 295 195Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="var(--rams-detail-preview-composition-outline-stroke)"
          />
          <circle cx="118" cy="90" r="34" fill="currentColor" />
        </g>
        {marks && (
          <g stroke="currentColor" fill="none">
            {[
              [24, 24],
              [336, 24],
              [24, 216],
              [336, 216],
            ].map(([x, y]) => (
              <path
                key={`${x}-${y}`}
                d={`M${x! - 7} ${y}h14M${x} ${y! - 7}v14`}
              />
            ))}
          </g>
        )}
      </svg>
      <Caption>
        Grid {grid ? "on" : "off"} · registration {marks ? "on" : "off"} ·{" "}
        {flipped ? "mirrored" : "original orientation"}
      </Caption>
    </Scene>
  );
}

export function MotionBlockPrintToolsDemo() {
  const [turns, setTurns] = useState(0);
  const [mirrored, setMirrored] = useState(false);
  const [negative, setNegative] = useState(false);
  const pristine = turns === 0 && !mirrored && !negative;
  return (
    <Scene id="block-print" title="La Plata / block-print matrix">
      <div style={row}>
        <ExpandingButtonGroup
          label="Block-print tools"
          defaultExpanded="rotate"
          items={[
            {
              id: "rotate",
              label: "Rotate",
              doneLabel: "Rotated",
              icon: <RotateCw />,
              onSelect: () => setTurns((value) => (value + 1) % 4),
            },
            {
              id: "mirror",
              label: "Mirror",
              doneLabel: "Mirrored",
              icon: <FlipHorizontal2 />,
              onSelect: () => setMirrored((value) => !value),
            },
            {
              id: "negative",
              label: "Invert",
              doneLabel: "Inverted",
              icon: <SunMoon />,
              onSelect: () => setNegative((value) => !value),
            },
            {
              id: "reset",
              label: "Reset",
              icon: <RotateCcw />,
              disabled: pristine,
              onSelect: () => {
                setTurns(0);
                setMirrored(false);
                setNegative(false);
              },
            },
          ]}
        />
      </div>
      <svg
        role="img"
        aria-label={`Block-print matrix: ${turns * 90} degrees, ${mirrored ? "mirrored" : "unmirrored"}, ${negative ? "negative" : "positive"}`}
        viewBox="0 0 360 230"
        style={proofArtwork}
      >
        <g
          transform={`translate(180 112) rotate(${turns * 90}) scale(${mirrored ? -1 : 1} 1)`}
        >
          <rect
            x="-80"
            y="-80"
            width="160"
            height="160"
            fill={negative ? "currentColor" : "none"}
            stroke="currentColor"
          />
          <g fill={negative ? "var(--rams-detail-background)" : "currentColor"}>
            <path d="M-60-60h40V60h-40zM0-60h60v40H0zM0 0h40v60H0z" />
            <circle cx="60" cy="60" r="20" />
          </g>
        </g>
        <text
          x="180"
          y="215"
          textAnchor="middle"
          fill="currentColor"
          fontFamily="inherit"
          fontSize="var(--rams-detail-preview-block-print-caption-size)"
        >
          MATRIX 12 / LA PLATA
        </text>
      </svg>
      <Caption>
        {turns * 90}° · {mirrored ? "mirrored" : "unmirrored"} ·{" "}
        {negative ? "negative" : "positive"} plate
      </Caption>
    </Scene>
  );
}
