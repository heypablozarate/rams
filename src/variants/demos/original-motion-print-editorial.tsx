"use client";

import * as React from "react";
import { collectionPresentation } from "@/primitives/collection-presentation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/primitives/select";
import { HeroSection } from "@/variants/vendor/registry/blocks/hero-section/hero-section";
import { FaqSection, faqExampleItems, type FaqSectionVariant } from "@/variants/vendor/registry/blocks/faq-section/faq-section";
import { blogPosts, blogCategories } from "@/variants/vendor/registry/blocks/blog-grid/blog-grid-data";
import { BlogGrid } from "@/variants/vendor/registry/blocks/blog-grid/blog-grid";
import { comparisonColumns, comparisonSections } from "@/variants/vendor/registry/blocks/comparison-table/comparison-table-data";
import { ComparisonTable } from "@/variants/vendor/registry/blocks/comparison-table/comparison-table";

const sceneStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  width: "100%",
  gap: "var(--rams-detail-space-4)",
  color: "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))",
  fontSize: "var(--type-body-size, var(--rams-detail-native-input-size-fallback))",
  lineHeight: "var(--rams-detail-preview-print-scene-leading)",
};

const controlStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: "var(--rams-detail-space-1)",
  width: "min(100%, var(--rams-detail-preview-print-layout-picker-measure))",
  color: "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))",
  fontSize: "var(--type-caption-size)",
  lineHeight: "var(--type-caption-leading)",
};

const noteStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))",
  fontSize: "var(--type-caption-size)",
  lineHeight: "var(--type-caption-leading)",
};

function SignaturePlanDiagram() {
  const id = React.useId();
  return (
    <svg viewBox="0 0 360 210" role="img" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} style={{ display: "block", width: "min(100%, var(--rams-detail-preview-measure-wide))", height: "auto" }}>
      <title id={`${id}-title`}>Folio 21 signature plan</title>
      <desc id={`${id}-description`}>Three folded signatures, each containing eight pages, make the 24-page booklet; the cover is shown separately.</desc>
      <rect x="18" y="18" width="324" height="174" rx="var(--rams-detail-preview-signature-plan-sheet-radius)" fill="none" stroke="currentColor" strokeWidth="var(--rams-detail-preview-signature-plan-border-stroke)" />
      <path d="M180 18v174M18 105h324" stroke="currentColor" strokeWidth="var(--rams-detail-preview-signature-plan-fold-stroke)" />
      <text x="99" y="75" textAnchor="middle" fill="currentColor" fontSize="var(--rams-detail-preview-signature-plan-label-size)">I · 8 pages</text>
      <text x="261" y="75" textAnchor="middle" fill="currentColor" fontSize="var(--rams-detail-preview-signature-plan-label-size)">II · 8 pages</text>
      <text x="99" y="151" textAnchor="middle" fill="currentColor" fontSize="var(--rams-detail-preview-signature-plan-label-size)">III · 8 pages</text>
      <text x="261" y="151" textAnchor="middle" fill="currentColor" fontSize="var(--rams-detail-preview-signature-plan-label-size)">Cover sheet</text>
    </svg>
  );
}

export function LaPlataFolio21EditorialHeroDemo() {
  const [planOpen, setPlanOpen] = React.useState(false);
  return (
    <section style={{ ...sceneStyle, color: "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))", lineHeight: "var(--rams-detail-preview-print-scene-leading)" }} aria-label="Folio 21 print editorial opening">
      <HeroSection
        variant="minimal"
        title="A folio planned from the fold"
        description="La Plata’s Folio 21 pairs a 24-page text block with a two-ink cover. These notes follow the sheet from imposition through trim."
        announcement={{ label: "Open plan", onClick: () => setPlanOpen(true) }}
        primaryAction={{ label: "Sheet plan", onClick: () => setPlanOpen((current) => !current) }}
        secondaryAction={null}
        meta={["140 sample copies", "Three 8-page signatures", "100 gsm uncoated text"]}
        animateIn={false}
      />
      {planOpen && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--rams-detail-space-2)" }} aria-live="polite">
          <strong>Sheet plan · Folio 21</strong>
          <SignaturePlanDiagram />
          <p style={{ margin: 0 }}>Three 8-page signatures make 24 pages. Keep the cover rule 5 mm inside trim; use black for text and oxide-red for the rule.</p>
        </div>
      )}
    </section>
  );
}


const faqLayouts: { value: FaqSectionVariant; label: string }[] = [
  { value: "accordion", label: "Accordion" },
  { value: "columns", label: "Topic columns" },
  { value: "search", label: "Search" },
];

export function LaPlataFolio21ProofFaqDemo() {
  const [layout, setLayout] = React.useState<FaqSectionVariant>("accordion");
  return (
    <section style={sceneStyle} aria-label="Folio 21 proof questions">
      <label style={controlStyle}>
        Question layout
        <Select value={layout} onValueChange={(value) => setLayout(value as FaqSectionVariant)}>
          <SelectTrigger aria-label="Question layout"><SelectValue /></SelectTrigger>
          <SelectContent>{faqLayouts.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
        </Select>
      </label>
      <FaqSection
        variant={layout}
        title="Folio 21 · proof questions"
        description="Specifications for the booklet sample, from signature count to cover trim."
        items={faqExampleItems}
        multiple
        contact={null}
      />
    </section>
  );
}


export function ArgentinePrintJournalGridDemo() {
  return (
    <section style={sceneStyle} aria-label="Argentine print journal articles">
      <p style={noteStyle}>Print notes · La Plata and Córdoba · October 2026</p>
      <BlogGrid
        title="From the print ledger"
        description="Short field notes on folding, paper, plates, and proof review."
        posts={blogPosts}
        categories={blogCategories}
        pageSize={collectionPresentation.journalDemoPageSize}
        showFeatured
      />
    </section>
  );
}


export function LaPlataFolio21PrintSpecificationComparisonDemo() {
  const [selected, setSelected] = React.useState(false);
  return (
    <section style={sceneStyle} aria-label="Folio 21 sample specification comparison">
      <ComparisonTable
        title="Folio 21 · print specs"
        description="Compare the two-plate cover plan with a black-only proof and a folded paper dummy."
        columns={comparisonColumns}
        sections={comparisonSections}
        cta={{ label: "Use two plates", doneLabel: "Spec selected", onClick: () => setSelected(true) }}
      />
      {selected && <p style={noteStyle} aria-live="polite">Worksheet selection: Folio 21 · two plates · 140 sample copies · 100 gsm text stock.</p>}
    </section>
  );
}
