"use client";

import { useId, useState } from "react";
import { heroArtwork as artwork } from "./motion-hero-artwork-tokens";
import { HeroContent } from "./motion-hero-content";
import type { HeroAction } from "./motion-hero-content";

export interface HeroCadenceProps {
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
  animateIn?: boolean;
  className?: string;
}

function ColophonStudy({ showMarks }: { showMarks: boolean }) {
  const uid = useId();
  const a = artwork.colophon, shared = artwork.shared;
  return <figure aria-label="Folio 21 editorial colophon study" style={artwork.figureStyle}>
    <svg viewBox={a.viewBox} role="img" aria-labelledby={`${uid}-title ${uid}-description`} style={artwork.svgStyle}>
      <title id={`${uid}-title`}>Folio 21 colophon layout</title>
      <desc id={`${uid}-description`}>A typographic colophon with {showMarks ? "trim and folio marks" : "a clear page edge"}.</desc>
      <rect {...a.frame} fill="var(--rams-detail-surface)" stroke="var(--rams-detail-border)" />
      <rect {...a.sheet} fill="var(--rams-detail-background)" stroke="var(--rams-detail-border)" />
      {showMarks && <g fill="none" stroke="currentColor" strokeOpacity={a.marks.opacity} strokeWidth={a.marks.stroke}>
        <path d={a.marks.path} />
        <path d={a.marks.guides} strokeDasharray={a.marks.dash.join(" ")} />
      </g>}
      <text x={a.textX} y={a.eyebrow.y} fill="currentColor" opacity={a.eyebrow.opacity} fontSize={a.eyebrow.size} fontFamily="inherit" letterSpacing={shared.tracking}>FOLIO 21 · BUENOS AIRES</text>
      <text x={a.textX} y={a.title.y} fill="currentColor" fontSize={a.title.size} fontFamily="inherit" fontWeight={a.title.weight}>A note on the edition</text>
      <path d={a.rules.path} stroke="currentColor" strokeOpacity={a.rules.opacity} strokeWidth={a.rules.stroke} />
      <text x={a.textX} y={a.captionBaselines[0]} fill="currentColor" opacity={shared.bodyOpacity} fontSize={shared.captionSize} fontFamily="inherit">Printed in three signatures · 24 pages</text>
      <text x={a.textX} y={a.captionBaselines[1]} fill="currentColor" opacity={shared.bodyOpacity} fontSize={shared.captionSize} fontFamily="inherit">Uncoated stock · two-plate cover</text>
      <text x={a.folio.x} y={a.folio.y} textAnchor="end" fill="currentColor" opacity={a.folio.opacity} fontSize={a.folio.size} fontFamily="inherit">21</text>
    </svg>
  </figure>;
}

/** Editorial colophon with local reveal controls and a print-mark view. */
export function HeroCadence({ primaryAction, secondaryAction, animateIn = true, className }: HeroCadenceProps) {
  const [revealed, setRevealed] = useState(false);
  const [showMarks, setShowMarks] = useState(false);
  const actions = {
    primaryAction: primaryAction ?? { label: "Colophon", onClick: () => setRevealed(value => !value) },
    secondaryAction: secondaryAction ?? { label: "View folio marks", onClick: () => setShowMarks(value => !value) },
  };
  return <HeroContent
    layout="minimal"
    title="A colophon for a considered edition."
    description="Folio 21 is a fictional booklet study: three signatures, uncoated stock, and a two-plate cover."
    media={<div style={{ display: "grid", gap: "var(--rams-detail-space-3)" }}>
      <ColophonStudy showMarks={showMarks} />
      {revealed && <p role="status" style={{ margin: artwork.figureStyle.margin, color: "var(--rams-detail-text-secondary)", fontSize: "var(--rams-detail-text-sm)" }}>
        Colophon · Edition 21 · Printed in three 8-page signatures on uncoated stock.
      </p>}
    </div>}
    meta={["Editorial colophon", "24-page fictional booklet"]}
    animateIn={animateIn}
    className={className}
    {...actions}
  />;
}

export default HeroCadence;
