"use client";

import { useId, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Button } from "@/primitives/button";
import { printPreviewGeometry } from "@/variants/print-preview-geometry";
import { FileUpload } from "@/variants/vendor/registry/components/file-upload/file-upload";
import type { FileUploadItem } from "@/variants/vendor/registry/components/file-upload/file-upload";

const sceneStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  width: "100%",
  maxWidth: "var(--rams-detail-preview-print-surface-measure)",
  gap: "var(--rams-detail-space-4, var(--rams-detail-preview-scene-gap))",
  marginInline: "auto",
  color: "var(--rams-detail-foreground, currentColor)",
  fontSize: "var(--rams-detail-text-base, var(--rams-detail-native-body-size-fallback))",
  lineHeight: "var(--rams-detail-preview-print-scene-leading)",
};

const noteStyle: CSSProperties = {
  margin: 0,
  color: "var(--rams-detail-text-secondary, currentColor)",
  fontSize: "var(--rams-detail-text-sm, var(--rams-detail-preview-print-scene-caption-size-fallback))",
};

const cardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: "var(--rams-detail-space-3, calc(var(--rams-detail-preview-space-step-fallback) * 3))",
  minWidth: 0,
};

export function PrintProofFileUploadDemo() {
  const titleId = useId();
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const sequence = useRef(0);

  function addSample(kind: "plate" | "checklist") {
    const number = ++sequence.current;
    const { ink, frameStrokeWidth, markStrokeWidth } = printPreviewGeometry.folioPlateExport;
    const file = kind === "plate"
      ? new File([
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160"><title>Folio 21 cover rule plate</title><rect x="16" y="16" width="208" height="128" fill="none" stroke="${ink}" stroke-width="${frameStrokeWidth}"/><path d="M32 120V40h40l48 56 48-56h40v80h-40V76l-48 52-48-52v44z" fill="none" stroke="${ink}" stroke-width="${markStrokeWidth}"/></svg>`,
      ], `folio-21-cover-plate-${number}.svg`, { type: "image/svg+xml" })
      : new File([
        "Folio 21 · Buenos Aires\nTrim review checklist\n\n□ Confirm page order\n□ Compare trim marks\n□ Check cover plate registration\n",
      ], `folio-21-trim-check-${number}.txt`, { type: "text/plain" });

    setFiles(current => [...current, { id: `folio-21-${number}`, file }]);
  }

  return (
    <section style={sceneStyle} aria-labelledby={titleId}>
      <header>
        <p style={{ ...noteStyle, marginBottom: "var(--rams-detail-preview-kicker-gap)" }}>Folio 21 · Buenos Aires print room</p>
        <h2 id={titleId} style={{ margin: 0, fontSize: "var(--type-title-size)", fontWeight: "var(--type-title-weight)", lineHeight: "var(--type-title-leading)", letterSpacing: "var(--type-title-tracking)", overflowWrap: "anywhere" }}>
          Collect proof files for a local review
        </h2>
      </header>

      <div style={cardStyle}>
        <FileUpload
          accept=".svg,.txt"
          label="Choose proof files"
          description="Select or drop an SVG plate or text checklist. Files stay in this preview."
          multiple
          maxSize={32 * 1024}
          value={files}
          onValueChange={setFiles}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--rams-detail-space-2, calc(var(--rams-detail-preview-space-step-fallback) * 2))" }}>
          <Button type="button" variant="secondary" onClick={() => addSample("plate")}>Create plate SVG</Button>
          <Button type="button" variant="secondary" onClick={() => addSample("checklist")}>Create trim checklist</Button>
          <Button type="button" variant="outline" onClick={() => setFiles([])}>Clear selection</Button>
        </div>
        <p role="status" aria-live="polite" style={noteStyle}>
          {files.length === 0 ? "No files selected." : `${files.length} ${files.length === 1 ? "file" : "files"} selected in this preview.`}
        </p>
      </div>

      <p style={noteStyle}>SVG and plain-text files up to 32 KB are accepted. This scene selects and removes local files only; it does not send or save them.</p>
    </section>
  );
}
