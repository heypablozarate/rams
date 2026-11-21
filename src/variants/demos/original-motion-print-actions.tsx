import { motionTokens } from "@/variants/vendor/lib/motion-tokens";
"use client";

import * as React from "react";
import { useState } from "react";
import { Check, Eye, FileText } from "lucide-react";
import { Button } from "@/primitives/button";
import { printPreviewGeometry } from "@/variants/print-preview-geometry";
import { HoldToConfirm } from "@/variants/vendor/registry/components/hold-to-confirm/hold-to-confirm";
import { ConfirmMorph } from "@/variants/vendor/registry/components/confirm-morph/confirm-morph";
import { ShortcutRecorder } from "@/variants/vendor/registry/components/shortcut-recorder/shortcut-recorder";
import { ExpandingSearch, type ExpandingSearchItem } from "@/variants/vendor/registry/components/expanding-search/expanding-search";
import { FileDropzone } from "@/variants/vendor/registry/components/file-dropzone/file-dropzone";
import { Reactions, type Reaction, type ReactionOption } from "@/variants/vendor/registry/components/reactions/reactions";

const sceneStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  width: "100%",
  maxWidth: "var(--rams-detail-preview-print-scene-measure)",
  minWidth: 0,
  gap: "var(--rams-detail-space-4, calc(var(--rams-detail-preview-space-step-fallback) * 4))",
  marginInline: "auto",
  color: "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))",
  fontSize: "var(--type-body-size, var(--rams-detail-native-body-size-fallback))",
  lineHeight: "var(--type-body-leading, var(--rams-detail-native-body-leading-fallback))",
};

const noteStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))",
  fontSize: "var(--type-caption-size, var(--rams-detail-preview-print-scene-caption-size-fallback))",
  lineHeight: "var(--type-caption-leading)",
};

function Scene({ title, place, children }: { title: string; place: string; children: React.ReactNode }) {
  return (
    <section style={sceneStyle} aria-label={`${place}: ${title}`}>
      <header>
        <p style={{ ...noteStyle, marginBottom: "var(--rams-detail-preview-kicker-gap)" }}>{place} · print room</p>
        <h2 style={{ margin: 0, fontSize: "var(--type-title-size, var(--rams-detail-preview-print-scene-title-size-fallback))", fontWeight: "var(--type-title-weight)", lineHeight: "var(--type-title-leading)", letterSpacing: "var(--type-title-tracking)", overflowWrap: "anywhere" }}>{title}</h2>
      </header>
      {children}
    </section>
  );
}

const actionSceneStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  inlineSize: "100%",
  maxInlineSize: "var(--rams-detail-preview-print-scene-measure)",
  minInlineSize: 0,
  gap: "var(--rams-detail-space-4)",
  marginInline: "auto",
  color: "var(--rams-detail-foreground)",
  fontSize: "var(--type-body-size)",
  lineHeight: "var(--type-body-leading)",
};

const actionNoteStyle: React.CSSProperties = {
  margin: 0,
  color: "var(--rams-detail-text-muted)",
  fontSize: "var(--type-caption-size)",
  lineHeight: "var(--type-caption-leading)",
};

function ActionScene({ title, place, children }: { title: string; place: string; children: React.ReactNode }) {
  return (
    <section style={actionSceneStyle} aria-label={`${place}: ${title}`}>
      <header>
        <p style={{ ...actionNoteStyle, marginBlockEnd: "var(--rams-detail-preview-kicker-gap)" }}>{place} · print room</p>
        <h2 style={{ margin: 0, fontSize: "var(--type-title-size)", fontWeight: "var(--type-title-weight)", lineHeight: "var(--type-title-leading)", letterSpacing: "var(--type-title-tracking)", overflowWrap: "anywhere" }}>{title}</h2>
      </header>
      {children}
    </section>
  );
}

export function PrintProofHoldConfirmationDemo() {
  const [approved, setApproved] = useState(false);
  return (
    <Scene title="Mark the sample proof" place="Córdoba">
      <p style={{ ...noteStyle, display: "grid" }} aria-live="polite">
        <span style={{ gridArea: "1 / 1", visibility: approved ? "hidden" : "visible" }} aria-hidden={approved || undefined}>Local sample state: proof not yet marked.</span>
        <span style={{ gridArea: "1 / 1", visibility: approved ? "visible" : "hidden" }} aria-hidden={!approved || undefined}>Local sample state: proof marked approved.</span>
      </p>
      <HoldToConfirm
        label="Hold to mark sample proof approved"
        confirmedLabel="Sample proof marked"
        duration={motionTokens.keyframes.holdToConfirmPresentation.proofHoldMs}
        tone="neutral"
        icon={<Check />}
        confirmed={approved}
        onConfirm={() => setApproved(true)}
      />
      <Button type="button" variant="secondary" disabled={!approved} onClick={event => {
        if (document.activeElement === event.currentTarget)
          event.currentTarget.closest("section")?.querySelector<HTMLButtonElement>("button[data-state]")?.focus({ preventScroll: true });
        setApproved(false);
      }}>Reset sample state</Button>
      <p style={noteStyle}>The 900 ms hold changes only this local example state; it does not approve a production proof.</p>
    </Scene>
  );
}

const proofNote = "Vermilion registration mark sits 0.2 mm right of the sample guide.";

export function PrintProofNoteConfirmMorphDemo() {
  const [notes, setNotes] = useState<string[]>([proofNote]);
  return (
    <ActionScene title="Remove a proof note" place="Mendoza">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--rams-detail-space-2)" }}>
        <strong style={{ overflowWrap: "anywhere" }}>Sample proof note</strong>
        {notes.length ? <p style={{ ...actionNoteStyle, color: "inherit" }}>{notes[0]}</p> : <p style={actionNoteStyle}>No proof note is currently in the local list.</p>}
      </div>
      <ConfirmMorph
        label="Remove sample note"
        prompt={<>Remove “{proofNote}” from the local sample?</>}
        confirmLabel="Remove note"
        cancelLabel="Keep note"
        doneLabel="Sample note removed"
        undoLabel="Restore note"
        tone="neutral"
        confirmMode="press"
        confirmTimeout={0}
        resultTimeout={0}
        onConfirm={() => setNotes([])}
        onUndo={() => setNotes([proofNote])}
      />
      <p style={actionNoteStyle}>Confirm removes the one sample note; Undo restores that same text. No production record is changed.</p>
    </ActionScene>
  );
}

export function PrintNoteShortcutRecorderDemo() {
  const [shortcut, setShortcut] = useState<string | null>(null);
  return (
    <ActionScene title="Record a note-review chord" place="Rosario">
      <ShortcutRecorder
        label="Note-review shortcut"
        value={shortcut}
        onValueChange={(next) => setShortcut(next)}
        resetValue={null}
        platform="other"
        placeholder="Record a chord"
        description="This chord is stored in this example only; it does not bind an operating-system shortcut or trigger an action."
      />
      <p style={actionNoteStyle} aria-live="polite">Recorded chord: {shortcut ?? "none"}.</p>
    </ActionScene>
  );
}

const printManifest: ExpandingSearchItem[] = [
  { id: "edition-08-colophon", title: "Edition 08 colophon", group: "Booklet pages", meta: "Page 16 · colophon", keywords: ["credits", "edition", "page"] },
  { id: "black-plate-notes", title: "Black plate notes", group: "Press notes", meta: "Separation · black", keywords: ["ink", "plate", "separation"] },
  { id: "proof-08-b", title: "Proof sheet 08-B", group: "Proof sheets", meta: "Second proof · 2 plates", keywords: ["proof", "sheet", "vermilion"] },
  { id: "cover-trim-guide", title: "Cover trim guide", group: "Production sheets", meta: "Cover stock · trim marks", keywords: ["cut", "crop", "stock"] },
];

export function PrintManifestExpandingSearchDemo() {
  const [selected, setSelected] = useState<ExpandingSearchItem | null>(null);
  return (
    <ActionScene title="Search the sample print manifest" place="La Plata">
      <ExpandingSearch
        label="Search print manifest"
        items={printManifest}
        suggestions={printManifest.slice(0, printPreviewGeometry.manifestSearch.suggestedRecords)}
        suggestionsLabel="Sample manifest entries"
        placeholder="Search pages, plates, or proofs"
        emptyHint="Try a page, plate, or proof-sheet term."
        onSelect={setSelected}
        expandedWidth={printPreviewGeometry.expandingSearch.expandedWidth}
        anchor="start"
      />
      <p style={actionNoteStyle} aria-live="polite">Selected entry: {selected ? `${selected.title} · ${selected.meta ?? ""}` : "none"}.</p>
      <p style={actionNoteStyle}>Search filters this four-entry local manifest; selecting a result shows its title and does not navigate elsewhere.</p>
    </ActionScene>
  );
}

export function PrintProofFileDropzoneDemo() {
  const [files, setFiles] = useState<File[]>([]);
  const names = files.map((file) => file.name);
  return (
    <ActionScene title="Select sample proof artwork" place="Buenos Aires">
      <FileDropzone
        label="Add proof artwork"
        description="Choose or drop SVG and PNG files from this device."
        accept="image/svg+xml,image/png"
        multiple
        maxFiles={2}
        maxSize={64 * 1024}
        listPlacement="below"
        note="SVG or PNG · up to 2 files · 64 KB maximum per file"
        onFilesChange={setFiles}
      />
      <p style={actionNoteStyle} aria-live="polite">{files.length} of 2 files selected{names.length ? `: ${names.join(", ")}` : "."}</p>
      <p style={actionNoteStyle}>This example only selects and lists files in the browser; it has no upload handler or remote destination.</p>
    </ActionScene>
  );
}

const reactionOptions: ReactionOption[] = [
  { id: "registration", label: "Registration clear", icon: Check },
  { id: "proof-readable", label: "Proof readable", icon: Eye },
  { id: "fold-ready", label: "Fold sequence ready", icon: FileText },
];
const initialReactions: Reaction[] = [
  { id: "registration", count: 3, reacted: false },
  { id: "proof-readable", count: 2, reacted: false },
  { id: "fold-ready", count: 1, reacted: false },
];

export function PrintProofReactionsDemo() {
  const [value, setValue] = useState<Reaction[]>(initialReactions);
  return (
    <ActionScene title="Sample proof acknowledgments" place="Salta">
      <Reactions
        label="Sample proof acknowledgments"
        options={reactionOptions}
        value={value}
        onValueChange={setValue}
      />
      <p style={actionNoteStyle}>The counts are fictional sample tallies, not reactions from people or a shared service.</p>
      <Button type="button" variant="secondary" disabled={JSON.stringify(value) === JSON.stringify(initialReactions)} onClick={event => {
        if (document.activeElement === event.currentTarget)
          event.currentTarget.closest("section")?.querySelector<HTMLButtonElement>('[role="group"][aria-label="Sample proof acknowledgments"] button:not(:disabled):not([inert])')?.focus({ preventScroll: true });
        setValue(initialReactions.map((reaction) => ({ ...reaction })));
      }}>Reset counts</Button>
    </ActionScene>
  );
}
