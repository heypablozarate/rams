import { printPreviewGeometry } from "@/variants/print-preview-geometry";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Button } from "@/primitives/button";
import { Breadcrumb } from "@/variants/vendor/registry/components/breadcrumb/breadcrumb";
import { Pagination } from "@/variants/vendor/registry/components/pagination/pagination";

const ink = "var(--foreground, var(--rams-ink))";
const paper = "var(--background, var(--rams-surface))";
const muted = "var(--muted-foreground, var(--rams-muted))";
const layout: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  width: "100%",
  minWidth: 0,
  gap: "var(--rams-detail-space-4)",
  color: ink,
  fontSize: "var(--type-body-size)",
  lineHeight: "var(--type-body-leading)",
  overflowWrap: "anywhere",
};
const note: CSSProperties = {
  margin: 0,
  color: muted,
  fontSize: "var(--type-caption-size)",
  lineHeight: "var(--type-body-leading)",
  overflowWrap: "anywhere",
};
const list: CSSProperties = {
  ...layout,
  listStyle: "none",
  margin: 0,
  padding: 0,
};

type ArchiveLocation =
  | "archive"
  | "river"
  | "plate-01"
  | "plate-02"
  | "plate-03";
const archivePlates: {
  id: ArchiveLocation;
  label: string;
  title: string;
  process: string;
  paper: string;
  trim: string;
}[] = [
  {
    id: "plate-01",
    label: "Plate 01",
    title: "North bank",
    process: "Line etching",
    paper: "Uncoated, 120 gsm",
    trim: "90 × 140 mm",
  },
  {
    id: "plate-02",
    label: "Plate 02",
    title: "Channel bend",
    process: "Two-pass stencil",
    paper: "Rag, 180 gsm",
    trim: "105 × 148 mm",
  },
  {
    id: "plate-03",
    label: "Plate 03",
    title: "Low-water grid",
    process: "Relief print",
    paper: "Cotton, 160 gsm",
    trim: "140 × 200 mm",
  },
];

function archivePath(location: ArchiveLocation) {
  const root = { id: "archive" as ArchiveLocation, label: "Archive" };
  if (location === "archive") return [root];
  const collection = { id: "river" as ArchiveLocation, label: "River atlas" };
  if (location === "river") return [root, collection];
  const plate = archivePlates.find((item) => item.id === location)!;
  return [root, collection, { id: plate.id, label: plate.label }];
}

export function MotionPrintArchiveBreadcrumbDemo() {
  const [location, setLocation] = useState<ArchiveLocation>("plate-03");
  const headingId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const previous = useRef(location);
  const path = archivePath(location);
  const current = path[path.length - 1]!;
  const plate = archivePlates.find((item) => item.id === location);
  useEffect(() => {
    if (previous.current === location) return;
    previous.current = location;
    heading.current?.focus({ preventScroll: true });
  }, [location]);
  return (
    <section
      style={layout}
      aria-label="Rosario print archive"
      data-navigation-scene="archive"
    >
      <p style={note}>Rosario / print archive</p>
      <Breadcrumb
        ariaLabel="Archive path"
        items={path.map((item, index) =>
          index === path.length - 1
            ? { label: item.label }
            : { label: item.label, onClick: () => setLocation(item.id) },
        )}
      />
      <header
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          minWidth: 0,
          gap: "var(--rams-detail-preview-print-study-copy-gap)",
        }}
      >
        <h3
          ref={heading}
          id={headingId}
          tabIndex={-1}
          style={{
            margin: 0,
            fontSize: "var(--type-body-size)",
            fontWeight: "var(--type-action-weight)",
          }}
        >
          {current.label}
        </h3>
        <p style={note}>
          {location === "archive"
            ? "Edition studies arranged by collection."
            : location === "river"
              ? "Three plate studies of the river edge."
              : plate!.title}
        </p>
      </header>
      {location === "archive" && (
        <ul style={list}>
          <li style={{ display: "grid", gap: "var(--rams-detail-preview-list-gap)", minWidth: 0 }}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("river")}
            >
              Open River atlas
            </Button>
            <p style={note}>3 plates · etching, stencil and relief.</p>
          </li>
        </ul>
      )}
      {location === "river" && (
        <ul style={list}>
          {archivePlates.map((item) => (
            <li
              key={item.id}
              style={{ display: "grid", gap: "var(--rams-detail-preview-list-gap)", minWidth: 0 }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation(item.id)}
              >
                Open {item.label}
              </Button>
              <p style={note}>
                {item.title} · {item.process}
              </p>
            </li>
          ))}
        </ul>
      )}
      {plate && (
        <>
          <svg
            role="img"
            aria-label={`${plate.label}, ${plate.title}`}
            viewBox="0 0 280 180"
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              minWidth: 0,
              color: ink,
              background: paper,
            }}
          >
            <rect
              x="20"
              y="20"
              width="240"
              height="140"
              fill="none"
              stroke="currentColor"
            />
            {location === "plate-01" ? (
              <g fill="none" stroke="currentColor">
                <path d="M35 134Q94 36 151 98T245 58" strokeWidth="var(--rams-detail-preview-navigation-track-stroke)" />
                <path d="M35 146Q94 48 151 110T245 70" />
                <path d="M42 46h65M42 52h43" />
              </g>
            ) : location === "plate-02" ? (
              <g fill="currentColor">
                <path d="M40 142Q65 41 132 45v97Z" opacity="var(--rams-detail-preview-navigation-underprint-opacity)" />
                <path d="M108 142Q150 30 240 74v68Z" opacity="var(--rams-detail-preview-navigation-overprint-opacity)" />
                <circle cx="188" cy="67" r="16" />
              </g>
            ) : (
              <g stroke="currentColor" fill="none">
                {[66, 114, 162, 210].map((x) => (
                  <path key={x} d={`M${x} 35v110`} />
                ))}
                {[50, 80, 110, 140].map((y) => (
                  <path key={y} d={`M35 ${y}h210`} />
                ))}
                <path d="M35 125Q104 42 171 102T245 63" strokeWidth="var(--rams-detail-preview-navigation-route-stroke)" />
              </g>
            )}
          </svg>
          <dl style={{ ...layout, margin: 0, gap: "var(--rams-detail-preview-related-copy-gap)" }}>
            <div>
              <dt style={note}>Process</dt>
              <dd style={{ margin: 0 }}>{plate.process}</dd>
            </div>
            <div>
              <dt style={note}>Paper</dt>
              <dd style={{ margin: 0 }}>{plate.paper}</dd>
            </div>
            <div>
              <dt style={note}>Trim</dt>
              <dd style={{ margin: 0 }}>{plate.trim}</dd>
            </div>
          </dl>
        </>
      )}
    </section>
  );
}

type ProofEdition = {
  code: string;
  edition: string;
  plates: [string, string][];
};
const proofEditions: ProofEdition[] = [
  {
    code: "RL",
    edition: "River ledger",
    plates: [
      ["Bank", "Drypoint"],
      ["Reed", "Stencil"],
      ["Wake", "Relief"],
      ["Silt", "Line print"],
    ],
  },
  {
    code: "TR",
    edition: "Tile rhythm",
    plates: [
      ["Corner", "Relief"],
      ["Joint", "Drypoint"],
      ["Glaze", "Stencil"],
      ["Edge", "Line print"],
    ],
  },
  {
    code: "MT",
    edition: "Market type",
    plates: [
      ["Awning", "Stencil"],
      ["Crate", "Relief"],
      ["Label", "Line print"],
      ["Stall", "Drypoint"],
    ],
  },
  {
    code: "RS",
    edition: "Rail study",
    plates: [
      ["Sleeper", "Relief"],
      ["Switch", "Line print"],
      ["Signal", "Stencil"],
      ["Track", "Drypoint"],
    ],
  },
  {
    code: "SH",
    edition: "Roof shadows",
    plates: [
      ["Ridge", "Drypoint"],
      ["Eave", "Stencil"],
      ["Vent", "Line print"],
      ["Pitch", "Relief"],
    ],
  },
  {
    code: "GC",
    edition: "Garden cuts",
    plates: [
      ["Seed", "Stencil"],
      ["Leaf", "Relief"],
      ["Stem", "Drypoint"],
      ["Petal", "Line print"],
    ],
  },
  {
    code: "CY",
    edition: "Courtyard",
    plates: [
      ["Arch", "Relief"],
      ["Paving", "Line print"],
      ["Well", "Drypoint"],
      ["Gate", "Stencil"],
    ],
  },
];
const proofs = proofEditions.flatMap((edition) =>
  edition.plates.map(([title, process], index) => ({
    id: `${edition.code}-${String(index + 1).padStart(2, "0")}`,
    title,
    edition: edition.edition,
    process,
  })),
);

function proofWindow(page: number) {
  const { pageSize } = printPreviewGeometry.proofIndex;
  const start = (page - 1) * pageSize;
  return {
    records: proofs.slice(start, start + pageSize),
    first: start + 1,
    last: Math.min(start + pageSize, proofs.length),
    total: proofs.length,
    pageCount: Math.ceil(proofs.length / pageSize),
  };
}

export function MotionProofIndexPaginationDemo() {
  const [page, setPage] = useState(1);
  const shown = proofWindow(page);
  return (
    <section
      style={layout}
      aria-label="Córdoba proof index"
      data-navigation-scene="proof-index"
    >
      <header>
        <p style={note}>Córdoba / proof index</p>
        <strong>28 plates from seven edition studies</strong>
      </header>
      <ul style={list}>
        {shown.records.map((record) => (
          <li
            key={record.id}
            data-proof-id={record.id}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              minWidth: 0,
              gap: "var(--rams-detail-preview-print-study-copy-gap)",
            }}
          >
            <strong style={{ fontWeight: "var(--type-action-weight)" }}>
              {record.id} · {record.title}
            </strong>
            <span style={note}>{record.edition}</span>
            <span style={note}>{record.process}</span>
          </li>
        ))}
      </ul>
      <output style={note}>
        Showing proofs {shown.first}–{shown.last} of {shown.total}.
      </output>
      <Pagination
        page={page}
        pageCount={shown.pageCount}
        onPageChange={setPage}
        label="Proof index pages"
      />
    </section>
  );
}
