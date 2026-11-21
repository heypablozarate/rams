"use client";

import { useState, type CSSProperties } from "react";
import { Archive, Check } from "rams-icons";
import { Button } from "@/primitives/button";
import { OtpInput } from "@/variants/vendor/registry/components/otp-input/otp-input";
import { SwipeActions, SwipeActionsRow } from "@/variants/vendor/registry/components/swipe-actions/swipe-actions";
import { CardStack } from "@/variants/vendor/registry/components/card-stack/card-stack";

const sceneStyle: CSSProperties = { display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--rams-detail-space-4, calc(var(--rams-detail-preview-space-step-fallback) * 4))", width: "100%", maxWidth: "var(--rams-detail-preview-measure-editorial)", minWidth: 0, color: "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))", fontSize: "var(--type-body-size, var(--rams-detail-native-body-size-fallback))", lineHeight: "var(--type-body-leading, var(--rams-detail-native-body-leading-fallback))" };
const headingStyle: CSSProperties = { margin: 0, fontSize: "var(--type-title-size, var(--rams-detail-preview-print-scene-title-size-fallback))", lineHeight: "var(--type-title-leading)", fontWeight: "var(--type-title-weight)", letterSpacing: "var(--type-title-tracking)", overflowWrap: "anywhere" };
const copyStyle: CSSProperties = { margin: 0, overflowWrap: "anywhere" };

export function RosarioWorksheetOtpDemo() {
  const [value, setValue] = useState("");
  const complete = value.length === 6;
  return <section
    style={{
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr)",
      gap: "var(--rams-detail-space-4)",
      inlineSize: "100%",
      maxInlineSize: "var(--rams-detail-preview-measure-editorial)",
      minInlineSize: 0,
      color: "var(--rams-detail-foreground)",
      fontSize: "var(--type-body-size)",
      lineHeight: "var(--type-body-leading)",
    }}
    aria-label="Rosario worksheet code"
  >
    <h2
      style={{
        margin: 0,
        fontSize: "var(--type-title-size)",
        lineHeight: "var(--type-title-leading)",
        fontWeight: "var(--type-title-weight)",
        letterSpacing: "var(--type-title-tracking)",
        overflowWrap: "anywhere",
      }}
    >
      Match the paper worksheet
    </h2>
    <OtpInput label="Worksheet code" description="Enter the six digits printed on the sample worksheet: 731408." value={value} onValueChange={setValue} error={complete && value !== "731408" ? "The code does not match worksheet 731408." : undefined} />
    <p role="status" style={copyStyle}>{value === "731408" ? "Worksheet 731408 selected." : "No worksheet selected."}</p>
    <Button variant="outline" onClick={() => setValue("")}>Clear worksheet code</Button>
  </section>;
}

const proofRows = [
  { id: "rosario", title: "Rosario fold proof", detail: "Check the two ink plates against the corner marks.", sheet: "A3" },
  { id: "mendoza", title: "Mendoza poster proof", detail: "Check the title spacing before the square crop.", sheet: "A2" },
  { id: "laplata", title: "La Plata booklet proof", detail: "Check the page order on the four-sheet dummy.", sheet: "A4" },
];

export function PrintProofSwipeActionsDemo() {
  const [rows, setRows] = useState(proofRows);
  const [checked, setChecked] = useState<string[]>([]);
  const [archived, setArchived] = useState<string[]>([]);
  return <section style={{ ...sceneStyle, gap: "var(--rams-detail-space-4, var(--rams-detail-preview-scene-gap))" }} aria-label="Print proof triage">
    <h2 style={headingStyle}>Review the three proof sheets</h2>
    <SwipeActions label="Proof sheets" emptyState={<p style={copyStyle}>All three proofs are archived.</p>}>
      {rows.map(row => <SwipeActionsRow key={row.id} label={row.title}
        leading={[{ label: checked.includes(row.id) ? "Mark unchecked" : "Mark checked", icon: <Check aria-hidden="true" />, tone: "accent", keepRow: true, onSelect: () => setChecked(current => current.includes(row.id) ? current.filter(id => id !== row.id) : [...current, row.id]) }]}
        trailing={[{ label: "Archive proof", icon: <Archive aria-hidden="true" />, onSelect: () => { setRows(current => current.filter(item => item.id !== row.id)); setArchived(current => [...current, row.title]); } }]}>
        <div style={{ display: "grid", minWidth: 0, gap: "var(--rams-detail-space-1, var(--rams-detail-preview-space-step-fallback))", paddingBlock: "var(--rams-detail-preview-swipe-copy-block-inset)" }}>
          <strong style={{ ...copyStyle, fontSize: "var(--type-control-size, var(--rams-detail-native-control-size-fallback))" }}>{row.title}</strong>
          <p style={{ ...copyStyle, fontSize: "var(--type-caption-size, var(--rams-detail-preview-print-scene-caption-size-fallback))" }}>{row.detail}</p>
          <span style={{ fontSize: "var(--type-caption-size, var(--rams-detail-preview-print-scene-caption-size-fallback))" }}>{row.sheet} · {checked.includes(row.id) ? "Checked" : "Unchecked"}</span>
        </div>
      </SwipeActionsRow>)}
    </SwipeActions>
    <p role="status" style={copyStyle}>{archived.length ? `Archived proofs: ${archived.join("; ")}.` : "No proofs archived."}</p>
    <Button variant="outline" onClick={() => { setRows(proofRows); setChecked([]); setArchived([]); }}>Restore proofs</Button>
  </section>;
}

const coverStudies = [
  { id: "fold", title: "Fold", description: "Two offset rules cross the paper fold.", shape: "var(--rams-detail-preview-cover-study-fold)" },
  { id: "arc", title: "Arc", description: "A single curved line meets the page edge.", shape: "var(--rams-detail-preview-cover-study-arc)" },
  { id: "steps", title: "Steps", description: "Three short bars follow the trim margin.", shape: "var(--rams-detail-preview-cover-study-steps)" },
];

export function CordobaCoverCardStackDemo() {
  const [decisions, setDecisions] = useState<Record<string, "left" | "right">>({});
  return <section style={sceneStyle} aria-label="Córdoba cover study selection">
    <h2 style={headingStyle}>Choose a booklet cover study</h2>
    <CardStack items={coverStudies} getKey={item => item.id} getLabel={item => item.title} label="Cover studies" labels={{ left: "Pass", right: "Keep" }} outcomes={{ left: "passed", right: "kept" }}
      onDecide={(item, decision) => setDecisions(current => ({ ...current, [item.id]: decision }))}
      onUndo={item => setDecisions(current => { const next = { ...current }; delete next[item.id]; return next; })}
      onReset={() => setDecisions({})}
      renderCard={item => <article style={{ display: "grid", gap: "var(--rams-detail-space-3, calc(var(--rams-detail-preview-space-step-fallback) * 3))", padding: "var(--rams-detail-space-5, calc(var(--rams-detail-preview-space-step-fallback) * 5))", minWidth: 0 }}>
        <div aria-hidden="true" style={{ height: "var(--rams-detail-preview-cover-study-art-height)", color: "var(--rams-detail-accent)", backgroundImage: item.shape }} />
        <h3 style={headingStyle}>{item.title}</h3>
        <p style={copyStyle}>{item.description}</p>
      </article>} />
    <p role="status" style={copyStyle}>{Object.keys(decisions).length ? `Kept studies: ${coverStudies.filter(item => decisions[item.id] === "right").map(item => item.title).join(", ") || "none"}. Reviewed ${Object.keys(decisions).length} of 3.` : "No cover studies reviewed."}</p>
  </section>;
}
