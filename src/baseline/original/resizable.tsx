"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { printPreviewGeometry } from "../../variants/print-preview-geometry";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../primitives/resizable";

const nativePanels = printPreviewGeometry.nativePanels;
const proofSize = `${nativePanels.proofPercent}%` as const;
const remainingSize = `${100 - nativePanels.proofPercent}%` as const;
const stockSize = `${nativePanels.stockPercent}%` as const;
const captionSize = `${100 - nativePanels.stockPercent}%` as const;
const minSize = `${nativePanels.minPercent}%` as const;

const shellStyle = {
  width: "100%",
  maxWidth: "var(--rams-detail-preview-native-resizable-measure)",
  display: "grid",
  position: "relative" as const,
  gap: "calc(var(--spacing, var(--rams-detail-native-spacing-fallback)) * 3)",
};

const groupStyle = {
  width: "100%",
  height: "var(--rams-detail-preview-native-resizable-height)",
  maxHeight: "var(--rams-detail-preview-native-resizable-max-height)",
  minHeight: "var(--rams-detail-preview-native-resizable-min-height)",
  border: "var(--rams-detail-primitive-border-width) solid var(--border, var(--rams-border))",
  borderRadius: "var(--radius-panel)",
};

// The composition stacks the panes below its available-width threshold.
// The probe resolves that threshold in the host’s CSS and follows root changes.
function useWorkspaceLayout() {
  const ref = useRef<HTMLElement>(null);
  const [stacked, setStacked] = useState(false);
  useLayoutEffect(() => {
    const host = ref.current;
    if (!host) return;
    const view = host.ownerDocument.defaultView;
    if (!view) return;
    const enclosure = host.ownerDocument.createElement("span");
    enclosure.setAttribute("aria-hidden", "true");
    enclosure.inert = true;
    Object.assign(enclosure.style, { position: "absolute", inset: "0", blockSize: "0", overflow: "hidden", pointerEvents: "none", visibility: "hidden" });
    const probe = host.ownerDocument.createElement("span");
    Object.assign(probe.style, { display: "block", inlineSize: "var(--rams-detail-preview-native-resizable-stack-threshold)", blockSize: "0" });
    enclosure.append(probe);
    host.append(enclosure);
    const read = () => setStacked(host.clientWidth < probe.getBoundingClientRect().width);
    read();
    const observer = typeof view.ResizeObserver === "function" ? new view.ResizeObserver(read) : undefined;
    observer?.observe(host);
    observer?.observe(probe);
    if (!observer) view.addEventListener("resize", read);
    return () => { observer?.disconnect(); if (!observer) view.removeEventListener("resize", read); enclosure.remove(); };
  }, []);
  return { ref, stacked, style: stacked ? { ...groupStyle, height: "var(--rams-detail-preview-native-resizable-stacked-height)", maxHeight: "none" } : groupStyle };
}

export function ResizableDemo() {
  const id = useId();
  const layout = useWorkspaceLayout();

  return (
    <section ref={layout.ref} style={shellStyle} aria-label="Print workspace panels">
      <h3>Proof and stock workspace</h3>
      <ResizablePanelGroup
        orientation={layout.stacked ? "vertical" : "horizontal"}
        style={layout.style}
        aria-label="Proof and stock workspace panels"
      >
        <ResizablePanel defaultSize={proofSize} minSize={minSize}>
          <article
            aria-label="Color proof"
            style={{
              height: "100%",
              minHeight: 0,
              overflowY: "auto",
              paddingBlock: "calc(var(--spacing, var(--rams-detail-native-spacing-fallback)) * 4)",
              paddingInline: "min(calc(var(--spacing, var(--rams-detail-native-spacing-fallback)) * 4), var(--rams-detail-preview-native-resizable-pane-inline-cap))",
              overflowWrap: "normal",
            }}
          >
            <h4>Color proof · Set 04</h4>
            <p>Ink coverage: 68%</p>
            <p>Registration is aligned across the four print marks.</p>
          </article>
        </ResizablePanel>
        <ResizableHandle
          id={`${id}-proof-stock`}
          aria-label="Resize proof and stock panels"
        />
        <ResizablePanel defaultSize={remainingSize} minSize={minSize}>
          <ResizablePanelGroup
            orientation="vertical"
            style={{ height: "100%", minHeight: 0 }}
            aria-label="Stock and caption panels"
          >
            <ResizablePanel defaultSize={stockSize} minSize={minSize}>
              <article
                aria-label="Paper stock"
                style={{
                  height: "100%",
                  minHeight: 0,
                  overflowY: "auto",
                  paddingBlock: "calc(var(--spacing, var(--rams-detail-native-spacing-fallback)) * 4)",
                  paddingInline: "min(calc(var(--spacing, var(--rams-detail-native-spacing-fallback)) * 4), var(--rams-detail-preview-native-resizable-pane-inline-cap))",
                  overflowWrap: "normal",
                }}
              >
                <h4>Paper stock</h4>
                <p>Uncoated cotton · 240 gsm</p>
                <p>Sheet: 320 × 420 mm</p>
              </article>
            </ResizablePanel>
            <ResizableHandle
              id={`${id}-stock-caption`}
              aria-label="Resize stock and caption panels"
            />
            <ResizablePanel defaultSize={captionSize} minSize={minSize}>
              <article
                aria-label="Edition caption"
                style={{
                  height: "100%",
                  minHeight: 0,
                  overflowY: "auto",
                  paddingBlock: "calc(var(--spacing, var(--rams-detail-native-spacing-fallback)) * 4)",
                  paddingInline: "min(calc(var(--spacing, var(--rams-detail-native-spacing-fallback)) * 4), var(--rams-detail-preview-native-resizable-pane-inline-cap))",
                  overflowWrap: "normal",
                }}
              >
                <h4>Delta / 08</h4>
                <p>Rosario · Cotton stock</p>
                <p>Six numbered sheets in this edition.</p>
              </article>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </section>
  );
}

export function ResizableWithHandle() {
  const id = useId();
  const layout = useWorkspaceLayout();

  return (
    <section
      ref={layout.ref}
      style={shellStyle}
      aria-label="Print workspace with resize handles"
    >
      <h3>Proof and stock workspace</h3>
      <ResizablePanelGroup
        orientation={layout.stacked ? "vertical" : "horizontal"}
        style={layout.style}
        aria-label="Proof and stock workspace panels with visible handles"
      >
        <ResizablePanel defaultSize={proofSize} minSize={minSize}>
          <article
            aria-label="Color proof"
            style={{
              height: "100%",
              minHeight: 0,
              overflowY: "auto",
              paddingBlock: "calc(var(--spacing, var(--rams-detail-native-spacing-fallback)) * 4)",
              paddingInline: "min(calc(var(--spacing, var(--rams-detail-native-spacing-fallback)) * 4), var(--rams-detail-preview-native-resizable-pane-inline-cap))",
              overflowWrap: "normal",
            }}
          >
            <h4>Color proof · Set 04</h4>
            <p>Ink coverage: 68%</p>
            <p>Registration is aligned across the four print marks.</p>
          </article>
        </ResizablePanel>
        <ResizableHandle
          id={`${id}-proof-stock`}
          aria-label="Resize proof and stock panels"
          withHandle
        />
        <ResizablePanel defaultSize={remainingSize} minSize={minSize}>
          <ResizablePanelGroup
            orientation="vertical"
            style={{ height: "100%", minHeight: 0 }}
            aria-label="Stock and caption panels"
          >
            <ResizablePanel defaultSize={stockSize} minSize={minSize}>
              <article
                aria-label="Paper stock"
                style={{
                  height: "100%",
                  minHeight: 0,
                  overflowY: "auto",
                  paddingBlock: "calc(var(--spacing, var(--rams-detail-native-spacing-fallback)) * 4)",
                  paddingInline: "min(calc(var(--spacing, var(--rams-detail-native-spacing-fallback)) * 4), var(--rams-detail-preview-native-resizable-pane-inline-cap))",
                  overflowWrap: "normal",
                }}
              >
                <h4>Paper stock</h4>
                <p>Uncoated cotton · 240 gsm</p>
                <p>Sheet: 320 × 420 mm</p>
              </article>
            </ResizablePanel>
            <ResizableHandle
              id={`${id}-stock-caption`}
              aria-label="Resize stock and caption panels"
              withHandle
            />
            <ResizablePanel defaultSize={captionSize} minSize={minSize}>
              <article
                aria-label="Edition caption"
                style={{
                  height: "100%",
                  minHeight: 0,
                  overflowY: "auto",
                  paddingBlock: "calc(var(--spacing, var(--rams-detail-native-spacing-fallback)) * 4)",
                  paddingInline: "min(calc(var(--spacing, var(--rams-detail-native-spacing-fallback)) * 4), var(--rams-detail-preview-native-resizable-pane-inline-cap))",
                  overflowWrap: "normal",
                }}
              >
                <h4>Delta / 08</h4>
                <p>Rosario · Cotton stock</p>
                <p>Six numbered sheets in this edition.</p>
              </article>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </section>
  );
}

export function ResizableVertical() {
  const id = useId();

  return (
    <section style={shellStyle} aria-label="Vertically divided print workspace">
      <h3>Vertical proof review</h3>
      <ResizablePanelGroup
        orientation="vertical"
        style={groupStyle}
        aria-label="Vertical proof review panels"
      >
        <ResizablePanel defaultSize={proofSize} minSize={minSize}>
          <article
            aria-label="Proof notes"
            style={{
              height: "100%",
              minHeight: 0,
              overflowY: "auto",
              paddingBlock: "calc(var(--spacing, var(--rams-detail-native-spacing-fallback)) * 4)",
              paddingInline: "min(calc(var(--spacing, var(--rams-detail-native-spacing-fallback)) * 4), var(--rams-detail-preview-native-resizable-pane-inline-cap))",
              overflowWrap: "normal",
            }}
          >
            <h4>Proof notes · Delta / 08</h4>
            <p>Check the fine-line registration before the next pull.</p>
          </article>
        </ResizablePanel>
        <ResizableHandle
          id={`${id}-proof-notes-stock-record`}
          aria-label="Resize proof notes and stock record panels"
        />
        <ResizablePanel defaultSize={remainingSize} minSize={minSize}>
          <article
            aria-label="Stock record"
            style={{
              height: "100%",
              minHeight: 0,
              overflowY: "auto",
              paddingBlock: "calc(var(--spacing, var(--rams-detail-native-spacing-fallback)) * 4)",
              paddingInline: "min(calc(var(--spacing, var(--rams-detail-native-spacing-fallback)) * 4), var(--rams-detail-preview-native-resizable-pane-inline-cap))",
              overflowWrap: "normal",
            }}
          >
            <h4>Stock record</h4>
            <p>Uncoated cotton · 240 gsm</p>
            <p>Six numbered sheets · Rosario</p>
          </article>
        </ResizablePanel>
      </ResizablePanelGroup>
    </section>
  );
}
