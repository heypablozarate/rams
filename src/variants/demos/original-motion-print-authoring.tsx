"use client";

import * as React from "react";
import { printPreviewGeometry } from "@/variants/print-preview-geometry";
import { BillingToggle } from "@/variants/vendor/registry/components/billing-toggle/billing-toggle";
import { Button } from "@/variants/vendor/registry/components/button/button";
import {
  MentionInput,
  serializeMentions,
  type MentionValue,
} from "@/variants/vendor/registry/components/mention-input/mention-input";
import { RadioCards } from "@/variants/vendor/registry/components/radio-cards/radio-cards";
import {
  RichTextEditor,
  type RichTextValue,
} from "@/variants/vendor/registry/components/rich-text-editor/rich-text-editor";

const sceneStyle: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "minmax(0, 1fr)",
  width: "100%",
  maxWidth: "var(--rams-detail-preview-print-scene-measure-narrow)",
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

function Scene({
  title,
  place,
  children,
}: {
  title: string;
  place: string;
  children: React.ReactNode;
}) {
  return (
    <section style={sceneStyle} aria-label={`${place}: ${title}`}>
      <header>
        <p style={{ ...noteStyle, marginBottom: "var(--rams-detail-preview-kicker-gap)" }}>{place} · print room</p>
        <h2
          style={{
            margin: 0,
            fontSize: "var(--type-title-size, var(--rams-detail-preview-print-scene-title-size-fallback))",
            fontWeight: "var(--type-title-weight)",
            lineHeight: "var(--type-title-leading)",
            letterSpacing: "var(--type-title-tracking)",
          }}
        >
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

const samplePeople = [
  { id: "prepress-lead", name: "Prepress lead", role: "Role-only sample handle" },
  { id: "imposition-operator", name: "Imposition operator", role: "Role-only sample handle" },
];

const sampleChannels = [
  { id: "edition-18", name: "edition-18", description: "Edition 18 proof thread" },
  { id: "plate-check", name: "plate-check", description: "Registration and plate checks" },
  { id: "press-room", name: "press-room", description: "Local press-room notes" },
];

const emptyMention: MentionValue = { text: "", mentions: [] };

export function PrintProofMentionInputDemo() {
  const mentionControl = React.useRef<React.ElementRef<typeof MentionInput>>(null);
  const [value, setValue] = React.useState<MentionValue>(emptyMention);
  const [posted, setPosted] = React.useState<MentionValue | null>(null);
  const [status, setStatus] = React.useState("Notes remain local to this preview.");

  function submit(next: MentionValue) {
    if (!next.text.trim()) {
      setStatus("Add a note before posting it to the local preview.");
      return;
    }
    setPosted({ text: next.text, mentions: next.mentions.map((mention) => ({ ...mention })) });
    setValue({ text: "", mentions: [] });
    setStatus("Proof note added to the local preview; no one was notified.");
  }

  return (
    <Scene title="Edition 18 · proof note" place="Buenos Aires">
      <MentionInput
        ref={mentionControl}
        aria-label="Write a local proof note"
        value={value}
        onValueChange={setValue}
        onSubmit={submit}
        onMentionAdd={(mention) =>
          setStatus(`${mention.kind === "person" ? "Role handle" : "Channel"} added: ${mention.label}.`)
        }
        people={samplePeople}
        channels={sampleChannels}
        submitOnEnter
        placeholder="Use @ or # in a proof note…"
        minRows={printPreviewGeometry.mentionInput.minRows}
        maxRows={printPreviewGeometry.mentionInput.maxRows}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--rams-detail-preview-authoring-actions-gap)" }}>
        <Button size="sm" variant="outline" onClick={() => submit(value)}>
          Post note
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={!posted}
          onClick={(event) => {
            if (event.currentTarget === document.activeElement)
              mentionControl.current?.focus();
            setPosted(null);
            setStatus("Local proof note removed.");
          }}
        >
          Clear note
        </Button>
      </div>
      <p role="status" style={noteStyle}>{status}</p>
      {posted && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--rams-detail-preview-authoring-result-gap)", minWidth: 0, overflowWrap: "anywhere" }}>
          <strong>Local proof note</strong>
          <p style={{ margin: 0 }}>{posted.text}</p>
          <p style={noteStyle}>Mention serialization: {serializeMentions(posted)}</p>
        </div>
      )}
    </Scene>
  );
}

const proofNoteMarkdown = `## Edition 18 · proof notes

Trim to 210 × 297 mm after the second pass.

- Check registration marks
- Confirm paper grain direction`;

export function PrintProofRichTextEditorDemo() {
  const [output, setOutput] = React.useState<RichTextValue | null>(null);
  const [history, setHistory] = React.useState({ canUndo: false, canRedo: false });

  return (
    <Scene title="Edition 18 · working proof notes" place="Rosario">
      <RichTextEditor
        aria-label="Edit the Edition 18 proof notes"
        defaultMarkdown={proofNoteMarkdown}
        placeholder="Write proof notes…"
        blockHint="Type / for a block"
        onValueChange={(_html, details) => setOutput(details)}
        onHistoryChange={setHistory}
      />
      <p role="status" style={noteStyle}>
        {output
          ? `${output.text.length} characters in the current local draft · undo ${history.canUndo ? "available" : "unavailable"} · redo ${history.canRedo ? "available" : "unavailable"}.`
          : "Edit the sample note to report its current text and history state."}
      </p>
      {output && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--rams-detail-preview-authoring-result-gap)" }}>
          <p style={noteStyle}>Current Markdown</p>
          <pre style={{ margin: 0, whiteSpace: "break-spaces", overflowWrap: "anywhere", fontFamily: "var(--type-family-code)", fontSize: "var(--type-code-size, var(--type-caption-size))", lineHeight: "var(--type-code-leading, var(--rams-detail-preview-code-leading-fallback))" }}>
            {output.markdown}
          </pre>
        </div>
      )}
      <p style={noteStyle}>
        Editing is local to this preview; no note is uploaded or saved.
      </p>
    </Scene>
  );
}

const monthlyPrice = 36_000;
const annualPrice = 360_000;
const annualSavings = monthlyPrice * 12 - annualPrice;

export function PrintWorkshopBillingToggleDemo() {
  const [period, setPeriod] = React.useState("annual");
  const annual = period === "annual";
  const price = annual ? annualPrice : monthlyPrice;
  const monthlyEquivalent = annual ? annualPrice / 12 : monthlyPrice;
  const formatARS = (amount: number) => `ARS ${amount.toLocaleString("en-US")}`;

  return (
    <Scene title="Workshop reference plan" place="Córdoba">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", justifyItems: "center", minWidth: 0 }}>
        <BillingToggle
          label="Sample billing period"
          value={period}
          onValueChange={setPeriod}
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "annual", label: "Annual" },
          ]}
        />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--rams-detail-preview-authoring-result-gap)" }}>
        <strong>{formatARS(price)} {annual ? "per year" : "per month"}</strong>
        <p style={noteStyle}>
          {formatARS(monthlyEquivalent)} per month equivalent.
        </p>
        {annual && <p style={noteStyle}>
          Annual savings: {formatARS(annualSavings)} per year ({(annualSavings / (monthlyPrice * 12) * 100).toFixed(1)}%).
        </p>}
        <p style={noteStyle}>Sample figures only; this is not an offer or billing integration.</p>
      </div>
    </Scene>
  );
}

const paperOptions = [
  {
    value: "uncoated-120",
    label: "Uncoated offset",
    description: "Interior pages; low-glare surface for long reading.",
    meta: "120 gsm",
  },
  {
    value: "matte-170",
    label: "Matte coated",
    description: "Cover stock; smooth surface for fine halftone detail.",
    meta: "170 gsm",
  },
  {
    value: "recycled-test",
    label: "Recycled blend test",
    description: "A sample-only stock option.",
    meta: "Trial",
    disabled: true,
    disabledReason: "Not included in this sample edition docket.",
  },
];

export function PrintStockRadioCardsDemo() {
  const [stock, setStock] = React.useState("matte-170");
  const selected = paperOptions.find((option) => option.value === stock)!;

  return (
    <Scene title="Edition 18 · cover stock" place="La Plata">
      <RadioCards
        aria-label="Choose a sample cover stock"
        name="edition18-cover-stock"
        value={stock}
        onValueChange={setStock}
        layout="list"
        required
        options={paperOptions}
      />
      <p role="status" style={noteStyle}>
        Local docket choice: {selected.label}, {selected.meta}. No order is submitted.
      </p>
    </Scene>
  );
}
