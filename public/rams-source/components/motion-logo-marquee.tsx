"use client";
import "./motion-fields.css";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "./use-motion-preference";
import { Pause, Play } from "lucide-react";
import { Button } from "./button";
import styles from "./motion-logo-marquee.module.css";

export interface LogoMarqueeBrand {
  name: string;
  /** Monochrome SVG, drawn as a mask in the text color. */
  icon: string;
  /** Single brand color for the mark in color tone. Leave out for brands whose mark is black or white. */
  color?: string;
  /** Full color SVG for multicolor marks, used in color tone instead of `icon`. */
  colorIcon?: string;
}

export type LogoMarqueeTone = "color" | "mono";

export interface LogoMarqueeProps {
  title?: string;
  description?: string;
  brands?: LogoMarqueeBrand[];
  /** `color` shows each mark in its official colors; `mono` draws every mark in the text color. */
  tone?: LogoMarqueeTone;
  /** Start with motion paused; the default remains playing. */
  defaultPaused?: boolean;
}


function BrandMark({ brand, tone }: { brand: LogoMarqueeBrand; tone: LogoMarqueeTone }) {
  if (tone === "color" && brand.colorIcon) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={styles.brandMark} src={brand.colorIcon} alt="" draggable={false} />;
  }
  return (
    <span
      className={styles.brandMark}
      style={{ maskImage: `url("${brand.icon}")`, WebkitMaskImage: `url("${brand.icon}")`, color: tone === "color" ? brand.color : undefined }}
      aria-hidden="true"
    />
  );
}

function BrandList({ brands, tone, duplicate = false }: { brands: LogoMarqueeBrand[]; tone: LogoMarqueeTone; duplicate?: boolean }) {
  return (
    <ul className={styles.brandList} aria-label={duplicate ? undefined : "Brand marks"} aria-hidden={duplicate || undefined}>
      {brands.map((brand, index) => (
        <li className={styles.brand} key={`${brand.name}-${index}`}>
          <BrandMark brand={brand} tone={tone} />
          <span className={styles.brandName}>{brand.name}</span>
        </li>
      ))}
    </ul>
  );
}

export function LogoMarquee({
  title = "Brand marks",
  description = "Pause the row to inspect each mark.",
  brands = [],
  tone = "color",
  defaultPaused = false,
}: LogoMarqueeProps) {
  const titleId = useId();
  const [paused, setPaused] = useState(defaultPaused);
  const reduced = useReducedMotion();
  const regionRef = useRef<HTMLElement>(null);
  const pauseRef = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    if (reduced && document.activeElement === pauseRef.current) regionRef.current?.focus({ preventScroll: true });
  }, [reduced]);

  return (
    <section ref={regionRef} className={styles.section} data-tone={tone} aria-labelledby={titleId} tabIndex={-1}>
      <div className={styles.intro}>
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
      </div>

      <div className={styles.marquee} role="region" aria-label="Brand marks">
        <div className={`${styles.track}${paused ? ` ${styles.paused}` : ""}`}>
          <BrandList brands={brands} tone={tone} />
          <BrandList brands={brands} tone={tone} duplicate />
        </div>
      </div>

      <div className={styles.footer}>
        <Button
          ref={pauseRef}
          type="button"
          variant="ghost"
          size="sm"
          className={styles.motionButton}
          aria-label={paused ? "Play logo motion" : "Pause logo motion"}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? <><Play size="var(--rams-detail-motion-button-glyph-size)" strokeWidth="var(--rams-detail-logo-marquee-control-glyph-stroke)" aria-hidden="true" />Play</> : <><Pause size="var(--rams-detail-motion-button-glyph-size)" strokeWidth="var(--rams-detail-logo-marquee-control-glyph-stroke)" aria-hidden="true" />Pause</>}
        </Button>
        <span className={styles.motionStatus} aria-live="polite">
          {paused ? "Motion paused" : ""}
        </span>
      </div>
    </section>
  );
}

export default LogoMarquee;
