"use client";
import { Button } from "@/primitives/button";
import { printPreviewGeometry } from "@/variants/print-preview-geometry";
import { useState } from "react";
import {
  ResizablePanel,
  ResizablePanels,
} from "@/variants/vendor/registry/components/resizable-panels/resizable-panels";
import { Carousel } from "@/variants/vendor/registry/components/carousel/carousel";
import { ScrollArea } from "@/variants/vendor/registry/components/scroll-area/scroll-area";

const ink = "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))";
const paper = "var(--background, var(--rams-surface, var(--rams-detail-native-surface-fill-fallback)))";
const muted = "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))";
const border = "var(--border, var(--rams-border, var(--rams-detail-native-border-paint-fallback)))";
const surface = "var(--card, var(--rams-surface, var(--rams-detail-native-surface-fill-fallback)))";

const studies = [
  {
    id: "riverbend",
    code: "P01",
    title: "Riverbend",
    detail: "A broad curve meets the river bank.",
  },
  {
    id: "railrhythm",
    code: "P02",
    title: "Railrhythm",
    detail: "Parallel rails cross a single line.",
  },
  {
    id: "openframe",
    code: "P03",
    title: "Openframe",
    detail: "An open border frames a solid mark.",
  },
] as const;

type StudyId = (typeof studies)[number]["id"];

function StudyArtwork({
  study,
  className,
}: {
  study: StudyId;
  className?: string;
}) {
  const selected = studies.find((item) => item.id === study)!;
  return (
    <svg
      className={className}
      viewBox="0 0 480 300"
      role="img"
      aria-label={`${selected.title} original print study`}
      style={{ display: "block", width: "100%", height: "100%", color: ink }}
    >
      <rect width="480" height="300" fill={paper} />
      <rect
        x="28"
        y="24"
        width="424"
        height="252"
        fill="none"
        stroke={ink}
        strokeOpacity="var(--rams-detail-preview-print-study-frame-opacity)"
      />
      {study === "riverbend" ? (
        <g fill="none" stroke={ink}>
          <path d="M58 204c66-80 110-76 164-24s91 60 200-36" strokeWidth="var(--rams-detail-preview-river-study-main-stroke)" />
          <path d="M58 232c72-52 107-50 160-10s93 47 202-18" strokeWidth="var(--rams-detail-preview-river-study-second-stroke)" />
          <circle cx="343" cy="91" r="27" fill={ink} stroke="none" />
        </g>
      ) : study === "railrhythm" ? (
        <g fill="none" stroke={ink}>
          <path d="M88 62v176M128 62v176M168 62v176M208 62v176M248 62v176M288 62v176M328 62v176M368 62v176" strokeWidth="var(--rams-detail-preview-rail-study-vertical-stroke)" />
          <path d="M64 186h352" strokeWidth="var(--rams-detail-preview-rail-study-cross-stroke)" />
          <circle cx="368" cy="82" r="18" fill={ink} stroke="none" />
        </g>
      ) : (
        <g fill="none" stroke={ink}>
          <path d="M92 74h204M92 74v152M92 226h204M296 74v54M296 181v45M296 226h92M388 226v-75M388 112V74h-92" strokeWidth="var(--rams-detail-preview-courtyard-study-stroke)" />
          <path d="M210 116 270 176 210 210 154 157Z" fill={ink} stroke="none" />
          <circle cx="354" cy="108" r="12" fill={ink} stroke="none" />
        </g>
      )}
      <text x="42" y="262" fill={muted} fontSize="var(--rams-detail-preview-print-study-caption-type)" letterSpacing="var(--rams-detail-preview-print-study-caption-tracking)">
        {selected.code} · ONE INK
      </text>
    </svg>
  );
}



export function ResizablePanelsDemo() {
  const [studyIndex, setStudyIndex] = useState(0);
  const { choicesPercent, minSize } = printPreviewGeometry.readingPanels;
  const proofPercent = 100 - choicesPercent;
  const [shares, setShares] = useState([choicesPercent, proofPercent]);
  const study = studies[studyIndex]!;

  return (
    <section style={{ width: "100%", maxWidth: "var(--rams-detail-preview-resizable-measure)", marginInline: "auto" }}>
      <div
        style={{
          width: "100%",
          height: "var(--rams-detail-preview-resizable-height)",
          overflow: "hidden",
          border: `var(--rams-detail-primitive-border-width) solid ${border}`,
          borderRadius: "var(--rams-detail-radius-panel)",
          background: surface,
        }}
      >
        <ResizablePanels
          label="Print plate choices and selected proof"
          onLayoutChange={setShares}
        >
          <ResizablePanel
            id="reading-layout-plate-choices"
            label="Plate choices"
            defaultSize={choicesPercent}
            minSize={minSize}
            collapsible
          >
            <div
              style={{
                display: "flex",
                height: "100%",
                minWidth: 0,
                flexDirection: "column",
                gap: "var(--rams-detail-space-2)",
                padding: "var(--rams-detail-space-2)",
                paddingInline: "min(var(--rams-detail-space-2), var(--rams-detail-preview-reading-pane-inset-cap))",
                boxSizing: "border-box",
                background: surface,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: muted,
                  fontSize: "var(--type-caption-size)",
                  fontWeight: "var(--rams-detail-preview-reading-study-heading-weight)",
                }}
              >
                Plates
              </h2>
              <div style={{ display: "grid", gap: "var(--rams-detail-space-1)" }}>
                {studies.map((item, index) => (
                  <Button
                    variant="outline"
                    size="icon-sm"
                    key={item.id}
                    type="button"
                    aria-label={`Choose plate ${item.code}: ${item.title}`}
                    aria-pressed={studyIndex === index}
                    onClick={() => setStudyIndex(index)}
                    style={{
                      width: "100%",
                      minWidth: 0,
                      paddingInline: "var(--rams-detail-preview-reading-plate-button-inset)",
                      fontWeight: studyIndex === index ? "var(--rams-detail-preview-reading-study-heading-weight)" : "var(--type-control-weight)",
                    }}
                  >
                    {item.code}
                  </Button>
                ))}
              </div>
            </div>
          </ResizablePanel>
          <ResizablePanel
            id="reading-layout-selected-proof"
            label="Selected proof"
            defaultSize={proofPercent}
            minSize={minSize}
          >
            <ScrollArea label="Selected proof canvas" orientation="both" scrollbars="always" fade={0} viewportStyle={{ height: "100%" }} style={{ width: "100%", height: "100%" }}>
            <article
              style={{
                display: "grid",
                width: "100%",
                height: "100%",
                minWidth: "var(--rams-detail-preview-reading-proof-content-measure)",
                gridTemplateRows: "auto minmax(0, 1fr)",
                gap: "var(--rams-detail-space-2)",
                padding: "var(--rams-detail-space-2)",
                paddingInline: "min(var(--rams-detail-space-2), var(--rams-detail-preview-reading-pane-inset-cap))",
                boxSizing: "border-box",
                background: surface,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "var(--type-title-size)",
                    fontWeight: "var(--rams-detail-preview-reading-study-heading-weight)",
                    lineHeight: "var(--type-heading-leading)",
                  }}
                >
                  {study.title}
                </h2>
                <p
                  style={{
                    margin: "var(--rams-detail-space-1) 0 0",
                    color: muted,
                    fontSize: "var(--type-caption-size)",
                  }}
                >
                  {study.detail}
                </p>
              </div>
              <div style={{ minWidth: 0, minHeight: 0, overflow: "hidden" }}>
                <StudyArtwork study={study.id} />
              </div>
            </article>
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanels>
      </div>
      <output
        aria-label="Settled panel shares"
        style={{ display: "block", marginTop: "var(--rams-detail-preview-reading-share-gap)", color: muted, fontSize: "var(--type-caption-size)" }}
      >
        Plate choices {Math.round(shares[0]!)}% · Proof {Math.round(shares[1]!)}%
      </output>
    </section>
  );
}

export function CarouselDemo() {
  const [index, setIndex] = useState(0);
  const study = studies[index]!;

  return (
    <section style={{ width: "100%", maxWidth: "var(--rams-detail-preview-print-surface-measure)", marginInline: "auto" }}>
      <Carousel
        label="Original print studies"
        index={index}
        onIndexChange={setIndex}
        slideSize="var(--rams-detail-preview-carousel-study-slide)"
        slideLabel={(slideIndex) => studies[slideIndex]?.title ?? "Print study"}
      >
        {studies.map((item) => (
          <figure
            key={item.id}
            style={{
              display: "grid",
              height: "100%",
              gridTemplateRows: "minmax(0, 1fr) auto",
              margin: 0,
              overflow: "hidden",
              border: `var(--rams-detail-primitive-border-width) solid ${border}`,
              borderRadius: "var(--rams-detail-radius-surface)",
              background: paper,
            }}
          >
            <div style={{ minWidth: 0, minHeight: 0, padding: "var(--rams-detail-preview-carousel-study-art-inset)" }}>
              <StudyArtwork study={item.id} />
            </div>
            <figcaption
              style={{
                borderTop: `var(--rams-detail-separator-thickness) solid ${border}`,
                padding: "var(--rams-detail-preview-carousel-caption-inset)",
                color: muted,
                fontSize: "var(--type-caption-size)",
              }}
            >
              {item.code} · {item.title}
            </figcaption>
          </figure>
        ))}
      </Carousel>
      <div
        aria-live="polite"
        style={{
          minHeight: "var(--rams-detail-preview-carousel-readout-block)",
          marginTop: "var(--rams-detail-preview-carousel-readout-gap)",
          paddingInline: "var(--rams-detail-preview-carousel-readout-inset)",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "var(--type-title-size)",
            fontWeight: "var(--rams-detail-preview-reading-study-heading-weight)",
          }}
        >
          {study.title}
        </h2>
        <p style={{ margin: "var(--rams-detail-preview-carousel-readout-copy-gap) 0 0", color: muted, fontSize: "var(--type-body-size)" }}>
          {study.detail}
        </p>
      </div>
    </section>
  );
}
