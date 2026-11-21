"use client";

import { printPreviewGeometry } from "@/variants/print-preview-geometry";
import { useId, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/primitives/select";
import { ImageCompare } from "@/variants/vendor/registry/components/image-compare/image-compare";
import { SignaturePad } from "@/variants/vendor/registry/components/signature-pad/signature-pad";
import LogoMarquee, {
  type LogoMarqueeBrand,
  type LogoMarqueeTone,
} from "@/variants/vendor/registry/blocks/logo-marquee/logo-marquee";

const ink = "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))";
const paper = "var(--background, var(--rams-surface, var(--rams-detail-native-surface-fill-fallback)))";
const controlGap = "var(--rams-detail-space-1)";

export function SignaturePadDemo() {
  return (
    <SignaturePad
      signer="Rosario edition · 07"
      hint="Draw an edition mark"
      fileName="rosario-edition-07"
      label="Draw the edition mark"
    />
  );
}

function FirstProof() {
  return (
    <svg
      viewBox="0 0 600 400"
      role="img"
      aria-label="First proof with a light contour and four dashed guides"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <rect width="600" height="400" fill={paper} />
      <path d="M62 279 165 144l92 91 72-105 209 152H62Z" fill="none" stroke={ink} strokeWidth="var(--rams-detail-preview-compare-proof-outline-stroke)" />
      <path d="M64 314h472M64 326h302M80 70v264M520 70v264" fill="none" stroke={ink} strokeOpacity="var(--rams-detail-preview-compare-proof-guide-opacity)" strokeWidth="var(--rams-detail-preview-compare-proof-detail-stroke)" strokeDasharray="var(--rams-detail-preview-compare-proof-guide-dash)" />
      <circle cx="302" cy="116" r="38" fill="none" stroke={ink} strokeOpacity="var(--rams-detail-preview-compare-proof-sun-outline-opacity)" strokeWidth="var(--rams-detail-preview-compare-proof-detail-stroke)" />
    </svg>
  );
}

function RevisedProof() {
  return (
    <svg
      viewBox="0 0 600 400"
      role="img"
      aria-label="Revised print proof with a dark landscape, sun, and registration crosses"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <rect width="600" height="400" fill={paper} />
      <rect x="42" y="40" width="516" height="320" fill="none" stroke={ink} strokeWidth="var(--rams-detail-preview-compare-proof-detail-stroke)" />
      <circle cx="414" cy="132" r="54" fill={ink} fillOpacity="var(--rams-detail-preview-compare-proof-sun-wash-opacity)" stroke={ink} strokeWidth="var(--rams-detail-preview-compare-proof-outline-stroke)" />
      <path d="M64 282 176 164l70 74 81-103 50 58 58-40 101 129H64Z" fill={ink} fillOpacity="var(--rams-detail-preview-compare-proof-landscape-wash-opacity)" stroke={ink} strokeWidth="var(--rams-detail-preview-compare-proof-landscape-stroke)" />
      <path d="M64 310c85-31 142-27 216 1s152 22 256-12M55 25h30m-15-15v30m430-15h30m-15-15v30M55 375h30m-15-15v30m430-15h30m-15-15v30" fill="none" stroke={ink} strokeWidth="var(--rams-detail-preview-compare-proof-detail-stroke)" />
      <path d="M78 340h444" stroke={ink} strokeOpacity="var(--rams-detail-preview-compare-proof-caption-rule-opacity)" strokeWidth="var(--rams-detail-preview-compare-proof-detail-stroke)" />
    </svg>
  );
}

const markPaint = printPreviewGeometry.encodedArtwork.marqueeMark;
const makeMark = (contents: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${contents}</svg>`)}`;

const editionMarks: LogoMarqueeBrand[] = [
  {
    name: "Paraná Fold",
    icon: makeMark(`<path d="M5 6h22v20H5zM5 16h22M16 6v20" fill="none" stroke="${markPaint.ink}" stroke-width="${markPaint.outlineWidth}"/>`),
    color: "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))",
  },
  {
    name: "Córdoba Contour",
    icon: makeMark(`<path d="M3 23c4-14 8 0 13-14s9 8 13-2M4 28h24" fill="none" stroke="${markPaint.ink}" stroke-width="${markPaint.outlineWidth}" stroke-linecap="round"/>`),
    color: "var(--rams-brand-accent, var(--primary, var(--rams-primary)))",
  },
  {
    name: "Mendoza Crossline",
    icon: makeMark(`<path d="M16 3v26M3 16h26M7 7l18 18M25 7 7 25" fill="none" stroke="${markPaint.ink}" stroke-width="${markPaint.crosslineWidth}"/>`),
    color: "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))",
  },
];

export function ImageCompareDemo() {
  const [position, setPosition] = useState(50);

  return (
    <figure style={{ margin: 0, width: "100%", minWidth: 0 }}>
      <ImageCompare
        before={<FirstProof />}
        after={<RevisedProof />}
        position={position}
        onPositionChange={setPosition}
        labels={["First proof", "Revised proof"]}
        label="Compare the first and revised print proofs"
      />
      <figcaption style={{ marginTop: controlGap, color: "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))" }}>
        The first proof is on the left. The revised proof on the right adds a filled landscape, a larger sun, and registration crosses.
      </figcaption>
    </figure>
  );
}

export function LogoMarqueeDemo() {
  const id = useId();
  const [tone, setTone] = useState<LogoMarqueeTone>("color");

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "end", gap: controlGap, marginBlockEnd: controlGap, minWidth: 0 }}>
        <label htmlFor={id}>Mark tone</label>
        <Select value={tone} onValueChange={(next) => setTone(next as LogoMarqueeTone)}>
          <SelectTrigger id={id} aria-label="Mark tone">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="color">Ink tones</SelectItem>
            <SelectItem value="mono">Single tone</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <LogoMarquee
        title="Edition marks in motion"
        description="Play or pause the row to inspect each original print mark."
        defaultPaused
        brands={editionMarks}
        tone={tone}
      />
    </>
  );
}
