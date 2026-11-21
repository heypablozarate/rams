"use client";

import * as React from "react";
import { useId, useState, useLayoutEffect, useRef } from "react";
import { Button } from "@/primitives/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/primitives/select";
import { AnimatedCounter } from "@/variants/vendor/registry/components/animated-counter/animated-counter";

const editionCounts = [
  { edition: "03", copies: 480 },
  { edition: "04", copies: 600 },
  { edition: "05", copies: 720 },
  { edition: "06", copies: 840 },
  { edition: "07", copies: 960 },
  { edition: "08", copies: 1080 },
] as const;

const sceneStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  width: "100%",
  maxWidth: "var(--rams-detail-preview-print-scene-measure)",
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

export function CordobaBookletCopyCounterDemo() {
  const selectId = useId();
  const [edition, setEdition] = useState("08");
  const [addedCopies, setAddedCopies] = useState(0);
  const baseCopies = editionCounts.find((entry) => entry.edition === edition)?.copies ?? editionCounts[editionCounts.length - 1].copies;
  const value = baseCopies + addedCopies;
  const addRef = useRef<HTMLButtonElement>(null), resetRef = useRef<HTMLButtonElement>(null);
  const focusAfterChange = useRef<"add" | "reset" | null>(null);
  useLayoutEffect(() => {
    const destination = focusAfterChange.current;
    focusAfterChange.current = null;
    const target = destination === "add" ? addRef.current : destination === "reset" ? resetRef.current : null;
    if (target && !target.disabled) target.focus();
  }, [addedCopies]);

  function selectEdition(next: string) {
    setEdition(next);
    setAddedCopies(0);
  }

  return (
    <section style={sceneStyle} aria-labelledby="copy-counter-title">
      <header>
        <p style={{ ...noteStyle, marginBottom: "var(--rams-detail-preview-kicker-gap)" }}>Córdoba · sample booklet worksheet</p>
        <h2 id="copy-counter-title" style={{ margin: 0, fontSize: "var(--type-title-size, var(--rams-detail-preview-print-scene-title-size-fallback))", fontWeight: "var(--type-title-weight)", lineHeight: "var(--type-title-leading)", letterSpacing: "var(--type-title-tracking)", overflowWrap: "anywhere" }}>
          Copy count for the selected sample edition
        </h2>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--rams-detail-space-3, calc(var(--rams-detail-preview-space-step-fallback) * 3))" }}>
        <div style={{ display: "grid", minWidth: 0, width: "100%" }}>
          <AnimatedCounter
            value={value}
            label={`Copies · Edition ${edition}`}
            decimals={0}
            animateOnView
            locale="en-US"
          />
        </div>
        <div style={{ display: "grid", gap: "var(--rams-detail-space-1, var(--rams-detail-preview-space-step-fallback))" }} aria-live="polite">
          <p style={noteStyle}>Worksheet baseline: {baseCopies.toLocaleString("en-US")} copies.</p>
          <p style={noteStyle}>Local adjustment: +{addedCopies.toLocaleString("en-US")} copies.</p>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--rams-detail-space-3, calc(var(--rams-detail-preview-space-step-fallback) * 3))" }}>
        <div style={{ display: "grid", width: "100%", maxWidth: "var(--rams-detail-preview-counter-field-measure)", gap: "var(--rams-detail-space-1, var(--rams-detail-preview-space-step-fallback))" }}>
          <label id={`${selectId}-label`} htmlFor={selectId} style={{ fontSize: "var(--type-caption-size, var(--rams-detail-preview-print-scene-caption-size-fallback))" }}>Sample edition</label>
          <Select value={edition} onValueChange={selectEdition}>
            <SelectTrigger id={selectId} aria-labelledby={`${selectId}-label`}>
              <SelectValue>{edition}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {editionCounts.map((entry) => (
                <SelectItem key={entry.edition} value={entry.edition}>Edition {entry.edition} · {entry.copies.toLocaleString("en-US")} copies</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--rams-detail-space-2, calc(var(--rams-detail-preview-space-step-fallback) * 2))" }}>
          <Button ref={addRef} type="button" style={{ flex: "1 1 var(--rams-detail-preview-counter-action-basis)" }} onClick={(event) => { if (addedCopies >= 96 && event.currentTarget === document.activeElement) focusAfterChange.current = "reset"; setAddedCopies((current) => Math.min(120, current + 24)); }} disabled={addedCopies >= 120}>
            Add 24 copies
          </Button>
          <Button ref={resetRef} type="button" variant="secondary" style={{ flex: "1 1 var(--rams-detail-preview-counter-action-basis)" }} onClick={(event) => { if (event.currentTarget === document.activeElement) focusAfterChange.current = "add"; setAddedCopies(0); }} disabled={addedCopies === 0}>
            Reset total
          </Button>
        </div>
      </div>
      <p style={noteStyle}>The edition selector uses fixed sample counts; the add and reset controls change this worksheet display only.</p>
    </section>
  );
}
