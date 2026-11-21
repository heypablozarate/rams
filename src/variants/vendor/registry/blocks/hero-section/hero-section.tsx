"use client";

import type { ReactNode } from "react";
import { HeroLumen } from "./hero-lumen";
import { HeroRelay } from "./hero-relay";
import { HeroCadence } from "./hero-cadence";
import { HeroMesh } from "./hero-mesh";
import type { HeroMeshPoint } from "./hero-mesh";
import { HeroContent } from "./hero-content";
import type { HeroAction, HeroInstallCommand } from "./hero-content";
import styles from "./hero-section.module.css";

export { HeroCadence, HeroContent, HeroLumen, HeroMesh, HeroRelay };
export type { HeroAction, HeroInstallCommand, HeroMeshPoint };

export type HeroSectionVariant = "centered" | "split" | "minimal";

export interface HeroSectionProps {
  /**
   * `centered` presents a signature-order study, `split` places a cover-plate study beside the copy,
   * and `minimal` is a content-height editorial opening. These layouts follow their supplied content.
   */
  variant?: HeroSectionVariant;
  /** Plays the entrance once on mount. Defaults to true. */
  animateIn?: boolean;
  /** The main call to action. With `doneLabel` and no `href`, the button confirms in place. */
  primaryAction?: HeroAction | null;
  /** The second call to action. */
  secondaryAction?: HeroAction | null;
  /**
   * Your own headline. When set, the hero renders your content in the chosen layout (see `HeroContent`) instead of the
   * designed sample, together with the props below.
   */
  title?: string;
  description?: string;
  announcement?: HeroAction | null;
  /** Install commands for your own content; the first one is shown with a copy button. */
  install?: HeroInstallCommand[] | null;
  /** A visual beside your own content in the split layout. */
  media?: ReactNode;
  /** Small facts under your own content, such as the version and license. */
  meta?: string[];
  /** Kept for compatibility; highlighted phrases render as plain text. */
  highlight?: string;
  className?: string;
}

/**
 * An editorial opening by default. The explicit centered/split layouts preserve the designed product compositions.
 */
export function HeroSection({ variant = "minimal", animateIn = true, primaryAction, secondaryAction, title, description, announcement, install, media, meta, className }: HeroSectionProps) {
  if (title) return <HeroContent layout={variant} title={title} description={description} announcement={announcement} primaryAction={primaryAction} secondaryAction={secondaryAction} install={install} media={media} meta={meta} animateIn={animateIn} className={className} />;
  const actions = { primaryAction: primaryAction ?? undefined, secondaryAction: secondaryAction ?? undefined };
  if (variant === "split") return <HeroRelay animateIn={animateIn} className={className} {...actions} />;
  if (variant === "minimal") return <HeroContent layout="minimal" title="Folio 21: a booklet planned from the fold." description="The 24-page sample uses three 8-page signatures, uncoated stock, and a two-plate cover." animateIn={animateIn} className={className} primaryAction={primaryAction} secondaryAction={secondaryAction} />;
  return <HeroLumen animateIn={animateIn} className={className} {...actions} />;
}

/** The catalog presents the editorial layout; explicit legacy layouts remain available through the API. */
export function HeroSectionBlock({ variant = "minimal" }: { variant?: HeroSectionVariant }) {
  return <div className={["rams-hero-section", styles.preview].join(" ")}><HeroSection variant={variant} /></div>;
}

export default HeroSectionBlock;
