"use client";

import { useState } from "react";
import { heroArtwork as artwork } from "./hero-artwork-tokens";
import { HeroContent } from "./hero-content";
import type { HeroAction } from "./hero-content";

export interface HeroLumenProps {
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
  animateIn?: boolean;
  className?: string;
}

type Imposition = "fold" | "flat";

function ImpositionStudy({ view }: { view: Imposition }) {
  const a = artwork.imposition, shared = artwork.shared;
  const isFlat = view === "flat";
  return <figure aria-label={`Folio 21 ${isFlat ? "flat sheet" : "folded signature"} imposition`} style={artwork.figureStyle}>
    <svg viewBox={a.viewBox} role="img" aria-label={`Folio 21 ${isFlat ? "flat 8-page sheet" : "folded 8-page signature"} imposition study. Page numbers show the reading order.`} style={artwork.svgStyle}>
      <rect {...a.frame} fill="var(--rams-detail-surface)" stroke="var(--rams-detail-border)" />
      <text x={shared.labelInset} y={shared.labelBaseline} fill="currentColor" fontSize={shared.labelSize} fontFamily="inherit" letterSpacing={shared.tracking}>FOLIO 21 · SIGNATURE A</text>
      <text x={a.rightLabelX} y={shared.labelBaseline} textAnchor="end" fill="currentColor" opacity={a.statusOpacity} fontSize={shared.captionSize} fontFamily="inherit">{isFlat ? "FLAT SHEET" : "FOLDED VIEW"}</text>
      {Array.from({ length: a.pageCount }, (_, i) => {
        const page = isFlat ? i + 1 : a.foldOrder[i]!;
        const col = i % a.columns, row = Math.floor(i / a.columns);
        const x = a.grid.x + col * a.grid.columnPitch, y = a.grid.y + row * a.grid.rowPitch;
        return <g key={i}>
          <rect x={x} y={y} width={a.page.width} height={a.page.height} rx={a.page.radius} fill={page === 1 ? "var(--rams-detail-accent)" : "var(--rams-detail-background)"} fillOpacity={page === 1 ? a.page.accentOpacity : 1} stroke="var(--rams-detail-border)" />
          <path d={a.lines.baselines.map((baseline, line) => `M${x + a.lines.inset} ${y + baseline}h${(page % 2 ? a.lines.oddWidths : a.lines.evenWidths)[line]}`).join("")} stroke="currentColor" strokeOpacity={a.lines.opacity} strokeWidth={a.lines.stroke} />
          <text x={x + a.lines.inset} y={y + a.pageNumber.baseline} fill="currentColor" fontSize={a.pageNumber.size} fontFamily="inherit">PAGE {String(page).padStart(a.pageNumber.digits, "0")}</text>
        </g>;
      })}
      <path d={a.fold.path} stroke="var(--rams-detail-border)" strokeDasharray={a.fold.dash.join(" ")} />
      <text x={shared.labelInset} y={a.footerBaseline} fill="currentColor" opacity={shared.noteOpacity} fontSize={shared.captionSize} fontFamily="inherit">8 pages · fold and trim plan</text>
      <text x={a.rightLabelX} y={a.footerBaseline} textAnchor="end" fill="currentColor" opacity={shared.noteOpacity} fontSize={shared.captionSize} fontFamily="inherit">{isFlat ? "1 → 8" : "8 → 1 → 2 → 7"}</text>
    </svg>
  </figure>;
}

/** Centered print imposition study with a local view switch. */
export function HeroLumen({ primaryAction, secondaryAction, animateIn = true, className }: HeroLumenProps) {
  const [view, setView] = useState<Imposition>("fold");
  const actions = {
    primaryAction: primaryAction ?? { label: "View flat sheet", onClick: () => setView("flat") },
    secondaryAction: secondaryAction ?? { label: "Folded sheet", onClick: () => setView("fold") },
  };
  return <HeroContent
    layout="centered"
    title="Plan the fold before the press."
    description="Folio 21 is a fictional 24-page booklet study. Select a view to compare the first 8-page signature."
    media={<ImpositionStudy view={view} />}
    meta={["24 pages", "3 × 8-page signatures", "Fictional imposition study"]}
    animateIn={animateIn}
    className={className}
    {...actions}
  />;
}

export default HeroLumen;
