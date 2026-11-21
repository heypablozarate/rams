"use client";

import { useState } from "react";
import { printPreviewGeometry } from "@/variants/print-preview-geometry";
import { Button } from "../../primitives/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/primitives/select";
import { CopyButton } from "@/variants/vendor/registry/components/copy-button/copy-button";
import { CodeBlock } from "@/variants/vendor/registry/components/code-block/code-block";
import { ExpandableText } from "@/variants/vendor/registry/components/expandable-text/expandable-text";
import {
  InViewTitle,
  type InViewTitleVariant,
} from "@/variants/vendor/registry/components/in-view-title/in-view-title";
import { TextMorph } from "@/variants/vendor/registry/components/text-morph/text-morph";
import { TextReveal } from "@/variants/vendor/registry/components/text-reveal/text-reveal";
import { TextShimmer } from "@/variants/vendor/registry/components/text-shimmer/text-shimmer";

const sectionStyle = {
  display: "grid",
  gap: "var(--rams-detail-space-3)",
  width: "100%",
  minWidth: 0,
  maxWidth: "var(--rams-detail-preview-measure-extra-wide)",
};

export function TextRevealDemo() {
  return (
    <section style={sectionStyle} aria-label="Printmaking sentence entrance">
      <TextReveal as="h2" text="A folded sheet records each pass." />
    </section>
  );
}

const entranceStyles: { variant: InViewTitleVariant; label: string }[] = [
  { variant: "word", label: "Word" },
  { variant: "line", label: "Line" },
  { variant: "blur", label: "Blur" },
  { variant: "tracking", label: "Tracking" },
  { variant: "wipe", label: "Wipe" },
];

export function InViewTitleDemo() {
  const [variant, setVariant] = useState<InViewTitleVariant>("blur");

  return (
    <section style={sectionStyle} aria-label="Print registration heading">
      <Select
        value={variant}
        onValueChange={(value) => setVariant(value as InViewTitleVariant)}
      >
        <SelectTrigger aria-label="Title entrance style">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          {entranceStyles.map((style) => (
            <SelectItem key={style.variant} value={style.variant}>
              {style.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <InViewTitle
        key={variant}
        text="Ink registration aligns across two plates."
        variant={variant}
        as="h2"
      />
    </section>
  );
}

export function TextMorphDemo() {
  const [paperProof, setPaperProof] = useState(false);
  const proofLabel = paperProof ? "Paper proof" : "Ink proof";

  return (
    <section style={sectionStyle} aria-label="Print plate label change">
      <p style={{ margin: 0 }}>
        Current proof: <TextMorph as="strong">{proofLabel}</TextMorph>
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={() => setPaperProof((current) => !current)}
      >
        {paperProof ? "Show ink proof" : "Show paper proof"}
      </Button>
    </section>
  );
}

export function TextShimmerDemo() {
  const [active, setActive] = useState(true);

  return (
    <section style={sectionStyle} aria-label="Status label shimmer">
      <div style={{ fontSize: "var(--type-heading-size)", fontWeight: "var(--rams-detail-text-shimmer-preview-emphasis)", lineHeight: "var(--type-heading-leading)", letterSpacing: "var(--type-heading-tracking)", overflowWrap: "anywhere" }}>
        <TextShimmer as="p" active={active}>
          Plate alignment sample
        </TextShimmer>
      </div>
      <Button
        type="button"
        variant="outline"
        aria-pressed={active}
        onClick={() => setActive((current) => !current)}
      >
        {active ? "Pause sweep" : "Resume sweep"}
      </Button>
      <p role="status" style={{ margin: 0 }}>
        {active ? "Sweep enabled" : "Sweep paused"}
      </p>
    </section>
  );
}

const plateCss = `.plate-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--rams-detail-space-2);
}

.plate-layout__mark {
  aspect-ratio: 4 / 3;
  border: var(--rams-detail-primitive-border-width) solid currentColor;
}`;

const editionReference = "ROS-24 / River fold";
export function CopyEditionReferenceDemo() {
  return (
    <section style={sectionStyle} aria-label="Copy edition reference">
      <p style={{ margin: 0 }}>{editionReference}</p>
      <CopyButton value={editionReference} label="Copy reference" />
    </section>
  );
}

export function CodeBlockDemo() {
  return (
    <section style={sectionStyle} aria-label="Plate layout source code">
      <CodeBlock
        filename="rosario-edition.css"
        language="css"
        code={plateCss}
        maxLines={printPreviewGeometry.codeBlock.maxLines}
      />
    </section>
  );
}

export function ExpandableTextDemo() {
  return (
    <section style={sectionStyle} aria-label="Print edition notes">
      <ExpandableText>
        At the Rosario workshop, a two-plate print begins with the lighter ink.
        The uncoated sheet rests against a fixed corner stop while the second
        plate adds a dark line drawing. A narrow margin protects the
        registration marks, and the finished sheet is folded only after the ink
        has dried. Each numbered copy is checked against the same paper size and
        plate alignment.
      </ExpandableText>
    </section>
  );
}
