"use client";

import { useId, useState } from "react";
import { heroArtwork as artwork } from "./hero-artwork-tokens";
import { HeroContent } from "./hero-content";
import type { HeroAction } from "./hero-content";

export interface HeroRelayProps {
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
  animateIn?: boolean;
  className?: string;
}

type Plate = "accent" | "black";

function PlateStudy({ plate }: { plate: Plate }) {
  const a = artwork.plate, shared = artwork.shared;
  const accent = plate === "accent";
  const uid = useId();
  return <figure aria-label={`Folio 21 ${accent ? "oxide-red" : "black"} ink plate`} style={artwork.figureStyle}>
    <svg viewBox={a.viewBox} role="img" aria-labelledby={`${uid}-title ${uid}-description`} style={artwork.svgStyle}>
      <title id={`${uid}-title`}>Folio 21 ink plate study</title>
      <desc id={`${uid}-description`}>A two-plate cover registration drawing. The selected plate is {accent ? "oxide-red" : "black"}.</desc>
      <rect {...a.frame} fill="var(--rams-detail-surface)" stroke="var(--rams-detail-border)" />
      <text x={shared.labelInset} y={shared.labelBaseline} fill="currentColor" fontSize={shared.labelSize} fontFamily="inherit" letterSpacing={shared.tracking}>FOLIO 21 · COVER PLATES</text>
      <text x={a.rightLabelX} y={shared.labelBaseline} textAnchor="end" fill="currentColor" opacity={shared.noteOpacity} fontSize={shared.captionSize} fontFamily="inherit">{accent ? "PLATE R / OXIDE-RED" : "PLATE K / BLACK"}</text>
      <g transform={accent ? a.registrationTransform : undefined} fill="none" stroke={accent ? "var(--rams-detail-accent)" : "currentColor"} strokeWidth={accent ? a.accentStroke : a.blackStroke} strokeOpacity={accent ? a.accentOpacity : a.blackOpacity}>
        <rect x={a.sheet.x} y={a.sheet.y} width={a.sheet.width} height={a.sheet.height} rx={a.sheet.radius} />
        <path d={a.letterform} />
        <path d={a.marks.path} strokeWidth={a.marks.stroke} />
      </g>
      <rect x={a.swatch.x} y={a.swatch.y} width={a.swatch.size} height={a.swatch.size} rx={a.swatch.radius} fill={accent ? "var(--rams-detail-accent)" : "currentColor"} fillOpacity={accent ? a.accentOpacity : a.blackOpacity} />
      <text x={a.captionX} y={a.footerBaseline} fill="currentColor" opacity={shared.bodyOpacity} fontSize={shared.captionSize} fontFamily="inherit">{accent ? "Oxide-red ink layer" : "Black ink layer"}</text>
      <text x={a.rightLabelX} y={a.footerBaseline} textAnchor="end" fill="currentColor" opacity={shared.noteOpacity} fontSize={shared.captionSize} fontFamily="inherit">Registration marks shown</text>
    </svg>
  </figure>;
}

/** Split ink-plate study with a local selection that changes the plate drawing. */
export function HeroRelay({ primaryAction, secondaryAction, animateIn = true, className }: HeroRelayProps) {
  const [plate, setPlate] = useState<Plate>("accent");
  const actions = {
    primaryAction: primaryAction ?? { label: "Red plate", onClick: () => setPlate("accent") },
    secondaryAction: secondaryAction ?? { label: "Black plate", onClick: () => setPlate("black") },
  };
  return <HeroContent
    layout="split"
    title="Separate the ink before the run."
    description="A fictional two-plate cover study for Folio 21. Select a plate to inspect its drawing and registration marks."
    media={<PlateStudy plate={plate} />}
    meta={["R / oxide-red", "K / black", "Local illustration"]}
    animateIn={animateIn}
    className={className}
    {...actions}
  />;
}

export default HeroRelay;
