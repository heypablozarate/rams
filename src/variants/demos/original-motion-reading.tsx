import { useState, type ReactNode } from "react";
import { Accordion } from "@/variants/vendor/registry/components/accordion/accordion";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/variants/vendor/registry/components/tabs/tabs";
import { Alert } from "@/variants/vendor/registry/components/alert/alert";
import { Button } from "@/primitives/button";

// Supporting artwork stays subordinate to the actual interactive control.
const previewFeedbackStyle = {
  display: "block", width: "min(100%, var(--rams-detail-preview-proof-artwork-inline-max))",
  height: "var(--rams-detail-preview-proof-artwork-block-max)",
  minWidth: 0, objectFit: "contain", justifySelf: "start",
} as const;

function ReadingExample({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gap: "var(--rams-detail-preview-reading-section-gap)",
        width: "100%",
        maxWidth: "var(--rams-detail-preview-measure-wide)",
        minWidth: 0,
        marginInline: "auto",
        fontSize: "var(--type-control-size)",
        color: "var(--foreground,var(--rams-ink))",
      }}
    >
      {children}
    </div>
  );
}

export function AccordionDemo() {
  return (
    <ReadingExample>
      <Accordion
        items={[
          {
            title: "Which paper holds the fold?",
            content:
              "Use 160 gsm uncoated stock for Patio / 09. Score the centre before folding so the cover closes flat.",
          },
          {
          title: "How is the ink prepared?",
            content:
            "Print one solid ink. Leave the paper unprinted around the title; the lighter areas come from the stock, not a second ink.",
          },
          {
            title: "Where does the colophon go?",
            content:
              "Place the edition number and Rosario imprint on the final inside page, below the fold diagram.",
          },
        ]}
      />
    </ReadingExample>
  );
}

function StockStudy() {
  return (
    <svg
      viewBox="0 0 300 160"
      role="img"
      aria-label="Patio stock sample"
      style={{
        ...previewFeedbackStyle,
        color: "inherit",
        background: "var(--muted,var(--rams-subtle))",
      }}
    >
      <rect
        x="72"
        y="20"
        width="156"
        height="120"
        fill="none"
        stroke="currentColor"
      />
      <path
        d="M90 44h82m-82 12h120m-120 12h120m-120 12h74"
        stroke="currentColor"
      />
      <text x="90" y="119" fontSize="var(--rams-detail-preview-stock-study-type)" fill="currentColor">
        PATIO / 09
      </text>
    </svg>
  );
}

function ImpositionStudy() {
  return (
    <svg
      viewBox="0 0 300 160"
      role="img"
      aria-label="Four-page imposition: back, front, inside left and inside right"
      style={{
        ...previewFeedbackStyle,
        color: "inherit",
        background: "var(--muted,var(--rams-subtle))",
      }}
    >
      <g fill="none" stroke="currentColor">
        <rect x="28" y="20" width="108" height="120" />
        <rect x="164" y="20" width="108" height="120" />
        <path d="M82 20v120m136-120v120" strokeDasharray="var(--rams-detail-preview-fold-study-crease-dash)" />
      </g>
      <g fill="currentColor" fontSize="var(--rams-detail-preview-fold-study-type)" textAnchor="middle">
        <text x="55" y="84">
          4
        </text>
        <text x="109" y="84">
          1
        </text>
        <text x="191" y="84">
          2
        </text>
        <text x="245" y="84">
          3
        </text>
      </g>
    </svg>
  );
}

export function TabsDemo() {
  return (
    <ReadingExample>
      <Tabs defaultValue="stock">
        <TabsList aria-label="Patio production studies">
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="ink">Ink</TabsTrigger>
          <TabsTrigger value="imposition">Imposition</TabsTrigger>
        </TabsList>
        <TabsContent value="stock">
          <StockStudy />
          <p>Uncoated stock · 160 gsm</p>
          <p>Score the centre before folding the cover.</p>
        </TabsContent>
        <TabsContent value="ink">
          <div
            role="img"
            aria-label="Single-ink title study"
            style={{
              paddingBlock: "var(--rams-detail-preview-reading-section-gap)",
              fontSize: "var(--type-heading-size)",
              fontWeight: "var(--rams-detail-preview-reading-study-heading-weight)",
              lineHeight: "var(--rams-detail-preview-single-ink-heading-leading)",
              letterSpacing: "var(--rams-detail-preview-single-ink-heading-tracking)",
            }}
          >
            Río arriba
          </div>
          <p>One solid ink. The unprinted stock supplies the contrast.</p>
        </TabsContent>
        <TabsContent value="imposition">
          <ImpositionStudy />
          <p>Outside: pages 4–1. Inside: pages 2–3.</p>
        </TabsContent>
      </Tabs>
    </ReadingExample>
  );
}

function CoverPlate({ marks }: { marks: boolean }) {
  return (
    <svg
      viewBox="0 0 300 150"
      role="img"
      aria-label={
        "Patio cover " + (marks ? "with four trim marks" : "without trim marks")
      }
      style={{
        ...previewFeedbackStyle,
        color: "inherit",
        background: "var(--muted,var(--rams-subtle))",
      }}
    >
      <rect
        x="35"
        y="25"
        width="230"
        height="100"
        fill="none"
        stroke="currentColor"
      />
      <text
        x="150"
        y="83"
        textAnchor="middle"
        fontSize="var(--rams-detail-preview-cover-study-type)"
        fill="currentColor"
      >
        PATIO / 09
      </text>
      {marks && (
        <g data-trim-marks fill="none" stroke="currentColor">
          <path d="M23 25h-8m20-12V5M265 13V5m12 20h8M23 125h-8m20 12v8m230-8v8m12-20h8" />
        </g>
      )}
    </svg>
  );
}

export function AlertDemo() {
  const [marks, setMarks] = useState(false);
  return (
    <ReadingExample>
      <Alert
        tone={marks ? "success" : "warning"}
        title={marks ? "Plate ready" : "Trim marks missing"}
      >
        <p>
          {marks
            ? "Four trim marks surround the cover."
            : "Add four corner marks to the cover plate."}
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setMarks((value) => !value)}
        >
          {marks ? "Remove marks" : "Add marks"}
        </Button>
      </Alert>
      <CoverPlate marks={marks} />
    </ReadingExample>
  );
}
