"use client";

import * as React from "react";
import { useState } from "react";
import { SiteFooter as SiteFooterComponent, type SiteFooterColumn, type SiteFooterLink, type SiteFooterVariant } from "@/variants/vendor/registry/blocks/site-footer/site-footer";
import { StatsBand, type Stat } from "@/variants/vendor/registry/blocks/stats-band/stats-band";
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from "@/primitives/select";
import { stats as printWorksheetStats } from "@/variants/vendor/registry/blocks/stats-band/stats-band-data";

const sceneStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  width: "100%",
  maxWidth: "var(--rams-detail-preview-print-block-scene-measure)",
  minWidth: 0,
  gap: "var(--rams-detail-space-4, var(--rams-detail-preview-scene-gap))",
  marginInline: "auto",
  color: "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))",
  fontSize: "var(--type-body-size, var(--rams-detail-native-body-size-fallback))",
  lineHeight: "var(--rams-detail-preview-print-scene-leading)",
};

const noteStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))",
  fontSize: "var(--type-caption-size, var(--rams-detail-preview-print-scene-caption-size-fallback))",
  lineHeight: "var(--type-caption-leading)",
};

function LayoutSelect({label,options,value,onValueChange}:{label:string;options:{value:string;label:string}[];value:string;onValueChange:(value:string)=>void}){return <Select value={value} onValueChange={onValueChange}><SelectTrigger aria-label={label} style={{maxWidth:"100%"}}><SelectValue/></SelectTrigger><SelectContent>{options.map(option=><SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select>;}

const footerLinks: SiteFooterLink[] = [
  { label: "Edition plan", href: "#edition-plan" },
  { label: "Imposition notes", href: "#imposition-notes" },
  { label: "Colophon", href: "#colophon" },
];
const footerColumns: SiteFooterColumn[] = [
  { title: "Worksheet", links: footerLinks.slice(0, 2) },
  { title: "Publication", links: [footerLinks[2]!] },
];
const footerVariants = [
  { value: "columns", label: "Columns" },
  { value: "minimal", label: "Minimal" },
  { value: "logo", label: "Logo" },
];

export function CordobaBookletSiteFooterDemo() {
  const [variant, setVariant] = useState<SiteFooterVariant>("columns");
  const [lastDestination, setLastDestination] = useState<string | null>(null);
  return (
    <section style={sceneStyle} aria-labelledby="print-footer-title">
      <header>
        <p style={{ ...noteStyle, marginBottom: "var(--rams-detail-preview-kicker-gap)" }}>Córdoba · sample booklet</p>
        <h2 id="print-footer-title" style={{ margin: 0, fontSize: "var(--type-title-size, var(--rams-detail-preview-print-scene-title-size-fallback))", fontWeight: "var(--type-title-weight)", lineHeight: "var(--type-title-leading)", letterSpacing: "var(--type-title-tracking)", overflowWrap: "anywhere" }}>Print-room notes and navigation</h2>
      </header>
      <LayoutSelect label="Footer layout" options={footerVariants} value={variant} onValueChange={(next) => setVariant(next as SiteFooterVariant)} />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--rams-detail-space-3, calc(var(--rams-detail-preview-space-step-fallback) * 3))", padding: "var(--rams-detail-space-3, calc(var(--rams-detail-preview-space-step-fallback) * 3))", border: "var(--rams-detail-primitive-border-width) solid var(--rams-detail-border, currentColor)", borderRadius: "var(--rams-detail-radius, var(--rams-detail-preview-panel-radius-fallback))" }}>
        <section id="edition-plan" aria-labelledby="edition-plan-title">
          <h3 id="edition-plan-title" style={{ margin: 0, fontSize: "var(--type-body-size, var(--rams-detail-native-body-size-fallback))" }}>Edition plan</h3>
          <p style={noteStyle}>Sample Edition 08 worksheet · 240 copies · 16 pages.</p>
        </section>
        <section id="imposition-notes" aria-labelledby="imposition-notes-title">
          <h3 id="imposition-notes-title" style={{ margin: 0, fontSize: "var(--type-body-size, var(--rams-detail-native-body-size-fallback))" }}>Imposition notes</h3>
          <p style={noteStyle}>Four imposed sheets per copy; two sample ink plates: black and vermilion.</p>
        </section>
        <section id="colophon" aria-labelledby="colophon-title">
          <h3 id="colophon-title" style={{ margin: 0, fontSize: "var(--type-body-size, var(--rams-detail-native-body-size-fallback))" }}>Colophon</h3>
          <p style={noteStyle}>Illustrative print-room worksheet for the component preview; no external publication or service is linked.</p>
        </section>
      </div>
      <SiteFooterComponent
        variant={variant}
        brand={{ name: "Edition 08 notes", href: "#edition-plan" }}
        tagline="A sample booklet worksheet from the Córdoba print room."
        columns={footerColumns}
        links={footerLinks}
        legal={[]}
        socials={[]}
        newsletter={null}
        status={null}
        year={2026}
        onNavigate={(link) => setLastDestination(link.label)}
      />
      <p style={noteStyle} aria-live="polite">{lastDestination ? `Selected local section: ${lastDestination}.` : "Footer links point to sections in this sample page."}</p>
    </section>
  );
}

const statLayouts = [
  { value: "divided", label: "Divided" },
  { value: "plain", label: "Plain" },
];

export function CordobaBookletStatsBandDemo() {
  const [layout, setLayout] = useState<"plain" | "divided">("divided");
  return (
    <section style={sceneStyle} aria-labelledby="print-stats-title">
      <header>
        <p style={{ ...noteStyle, marginBottom: "var(--rams-detail-preview-kicker-gap)" }}>Córdoba · sample worksheet</p>
        <h2 id="print-stats-title" style={{ margin: 0, fontSize: "var(--type-title-size, var(--rams-detail-preview-print-scene-title-size-fallback))", fontWeight: "var(--type-title-weight)", lineHeight: "var(--type-title-leading)", letterSpacing: "var(--type-title-tracking)", overflowWrap: "anywhere" }}>Edition 08 production figures</h2>
      </header>
      <LayoutSelect label="Statistics layout" options={statLayouts} value={layout} onValueChange={(next) => setLayout(next as "plain" | "divided")} />
      <StatsBand
        key={layout}
        stats={printWorksheetStats}
        layout={layout}
        title="Sample booklet worksheet"
        description="Three finite planning figures from one fictional edition worksheet."
        locale="en-US"
      />
      <p style={noteStyle}>The small trend and distribution are the six run counts and ten trim-offset measurements described above; neither is a live feed.</p>
    </section>
  );
}
