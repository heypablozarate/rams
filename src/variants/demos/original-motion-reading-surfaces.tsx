"use client";

import { useState } from "react";
import { Card } from "@/variants/vendor/registry/components/card/card";
import { ScrollArea } from "@/variants/vendor/registry/components/scroll-area/scroll-area";

const ink = "var(--rams-detail-foreground)";
const paper = "var(--rams-detail-background)";
const gap = "var(--rams-detail-space-1)";

function DeltaFoldArtwork() {
  return (
    <svg
      viewBox="0 0 480 400"
      role="img"
      aria-label="Original Delta fold relief print, with a dark river bend on a paper sheet"
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      <rect width="480" height="400" fill={paper} />
      <rect x="105" y="20" width="270" height="360" fill="none" stroke={ink} strokeWidth="var(--rams-detail-preview-paper-study-edge-stroke)" />
      <path d="M150 65h180v270H150z" fill="none" stroke={ink} strokeOpacity="var(--rams-detail-preview-paper-study-guide-opacity)" strokeWidth="var(--rams-detail-preview-paper-study-guide-stroke)" strokeDasharray="var(--rams-detail-preview-paper-study-guide-dash)" />
      <path d="M163 277c33-83 52-82 79-22s54 57 78-67M163 295c35-78 53-77 78-19s50 52 80-61" fill="none" stroke={ink} strokeWidth="var(--rams-detail-preview-paper-study-image-stroke)" strokeLinecap="round" />
      <path d="M168 92h52m-52 12h32M286 309h34" fill="none" stroke={ink} strokeWidth="var(--rams-detail-preview-paper-study-detail-stroke)" strokeLinecap="round" />
      <circle cx="288" cy="102" r="17" fill={ink} fillOpacity="var(--rams-detail-preview-paper-study-tint-opacity)" stroke={ink} strokeWidth="var(--rams-detail-preview-paper-study-detail-stroke)" />
    </svg>
  );
}

export function CardDemo() {
  return (
    <Card
      title="Delta fold · proof 04"
      description="Cotton rag paper, 180 × 240 mm; ink field, 120 × 180 mm."
      meta="Rosario print index"
      media={<DeltaFoldArtwork />}
      style={{ width: "100%", maxWidth: "var(--rams-detail-preview-card-measure)", minWidth: 0 }}
      details={
        <div style={{ minWidth: 0 }}>
          <p style={{ marginBlock: 0 }}>
            A single relief pass follows the river bend. The top and side margins keep the ink field centered on the folded sheet.
          </p>
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              gap: "var(--rams-detail-space-1)",
              marginBlock: "var(--rams-detail-space-1)",
            }}
          >
            <div>
              <dt>Paper</dt>
              <dd style={{ marginInlineStart: 0 }}>Cotton rag · 180 × 240 mm · 280 gsm</dd>
            </div>
            <div>
              <dt>Ink field</dt>
              <dd style={{ marginInlineStart: 0 }}>Relief print · 120 × 180 mm · one dark pass</dd>
            </div>
            <div>
              <dt>Fold</dt>
              <dd style={{ marginInlineStart: 0 }}>Vertical crease · 30 mm unprinted edge</dd>
            </div>
          </dl>
        </div>
      }
    />
  );
}

const stockRecords = [
  { code: "Delta fold 04", city: "Rosario", paper: "Cotton rag", gsm: 280, sheets: 24, process: "Relief" },
  { code: "River bend 05", city: "Paraná", paper: "Uncoated book", gsm: 220, sheets: 18, process: "Linocut" },
  { code: "Harbor map 06", city: "Buenos Aires", paper: "Recycled cover", gsm: 300, sheets: 16, process: "Screenprint" },
  { code: "Hill line 07", city: "Córdoba", paper: "Cotton rag", gsm: 250, sheets: 21, process: "Drypoint" },
  { code: "Garden grid 08", city: "Santa Fe", paper: "Uncoated book", gsm: 180, sheets: 32, process: "Relief" },
  { code: "Wind study 09", city: "Mendoza", paper: "Linen finish", gsm: 240, sheets: 14, process: "Monotype" },
  { code: "Market plan 10", city: "Salta", paper: "Recycled cover", gsm: 320, sheets: 12, process: "Screenprint" },
  { code: "Rail notes 11", city: "La Plata", paper: "Cotton rag", gsm: 280, sheets: 20, process: "Etching" },
  { code: "Courtyard 12", city: "Tucumán", paper: "Uncoated book", gsm: 200, sheets: 26, process: "Linocut" },
  { code: "Estuary 13", city: "Mar del Plata", paper: "Linen finish", gsm: 260, sheets: 15, process: "Drypoint" },
  { code: "Roofline 14", city: "San Juan", paper: "Recycled cover", gsm: 300, sheets: 19, process: "Monotype" },
  { code: "Orchard 15", city: "Neuquén", paper: "Cotton rag", gsm: 240, sheets: 22, process: "Relief" },
];

export function ScrollAreaDemo() {
  const [moreBelow, setMoreBelow] = useState(true);

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        gap,
        width: "100%",
        minWidth: 0,
      }}
      aria-label="Argentine paper-stock inventory"
    >
      <ScrollArea
        label="Twelve paper-stock records"
        orientation="vertical"
        scrollbars="always"
        maxHeight="var(--rams-detail-preview-reading-stock-viewport-max)"
        style={{ width: "100%", minWidth: 0 }}
        viewportStyle={{ paddingInline: gap }}
        onEdgeChange={(edges) => setMoreBelow(edges.bottom)}
      >
        <ol style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", margin: 0, padding: 0, listStyle: "none", minWidth: 0 }}>
          {stockRecords.map((record, index) => (
            <li
              key={record.code}
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr)",
                gap: "calc(var(--rams-detail-space-1) * 0.5)",
                minWidth: 0,
                paddingBlock: "var(--rams-detail-space-2)",
                borderBottom: index === stockRecords.length - 1 ? 0 : "var(--rams-detail-separator-thickness) solid var(--border, var(--rams-border, currentColor))",
              }}
            >
              <strong>{record.code} · {record.city}</strong>
              <span>{record.paper} · {record.gsm} gsm · {record.sheets} sheets</span>
              <span style={{ color: "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))" }}>{record.process}</span>
            </li>
          ))}
        </ol>
      </ScrollArea>
      <p role="status" style={{ marginBlock: 0, color: "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))" }}>
        {moreBelow ? "More stock below" : "End of stock list"}
      </p>
    </section>
  );
}
