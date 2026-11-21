"use client";

import { useId, useState, type CSSProperties } from "react";
import { Button } from "@/primitives/button";
import { Input } from "@/primitives/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/primitives/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/variants/vendor/registry/components/dialog/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/variants/vendor/registry/components/drawer/drawer";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/variants/vendor/registry/components/popover/popover";
import { HoverCard } from "@/variants/vendor/registry/components/hover-card/hover-card";
import { Tooltip } from "@/variants/vendor/registry/components/tooltip/tooltip";

const ink = "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))";
const muted = "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))";
const layout: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  minWidth: 0,
  width: "100%",
  gap: "var(--rams-detail-space-4, var(--rams-detail-preview-scene-gap))",
  color: ink,
  fontSize: "var(--type-body-size, var(--rams-detail-native-body-size-fallback))",
  lineHeight: "var(--rams-detail-preview-print-scene-leading)",
  overflowWrap: "anywhere",
};
const note: CSSProperties = {
  margin: 0,
  color: muted,
  fontSize: "var(--type-caption-size, var(--rams-detail-preview-print-scene-caption-size-fallback))",
  lineHeight: "var(--rams-detail-preview-print-scene-leading)",
  overflowWrap: "anywhere",
};
const field: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  minWidth: 0,
  gap: "var(--rams-detail-preview-control-stack-gap)",
};
const overlayPreviewLayout: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  minWidth: 0,
  width: "100%",
  gap: "var(--rams-detail-space-4)",
  color: "var(--foreground, var(--rams-ink, var(--rams-detail-native-content-ink-fallback)))",
  fontSize: "var(--type-body-size)",
  lineHeight: "var(--type-body-leading)",
  overflowWrap: "anywhere",
};
const overlayPreviewNote: CSSProperties = {
  margin: 0,
  color: "var(--muted-foreground, var(--rams-muted, var(--rams-detail-native-muted-ink-fallback)))",
  fontSize: "var(--type-caption-size)",
  lineHeight: "var(--rams-detail-preview-print-scene-leading)",
  overflowWrap: "anywhere",
};
const graphic: CSSProperties = {
  display: "block",
  width: "100%",
  height: "auto",
  maxWidth: "var(--rams-detail-preview-proof-artwork-inline-max)",
  maxHeight: "var(--rams-detail-preview-proof-artwork-block-max)",
  marginInline: "auto",
  objectFit: "contain",
  minWidth: 0,
  color: overlayPreviewLayout.color,
  background: "var(--background, var(--rams-surface, var(--rams-detail-native-surface-fill-fallback)))",
};

export function MotionPrintTitleDialogDemo() {
  const [title, setTitle] = useState("River margin");
  const [draft, setDraft] = useState(title);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const inputId = useId();
  const errorId = useId();
  const changeOpen = (next: boolean) => {
    setDraft(title);
    setError("");
    setOpen(next);
  };
  return (
    <section
      style={layout}
      aria-label="Rosario print title"
      data-overlay-scene="print-title"
    >
      <header>
        <p style={note}>Rosario / edition 08</p>
        <h3
          style={{
            margin: 0,
            fontSize: "var(--type-body-size)",
            fontWeight: "var(--rams-detail-docs-subheading-weight)",
          }}
        >
          {title}
        </h3>
      </header>
      <p style={note}>Relief proof · 140 × 200 mm.</p>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline">
            Edit print title
          </Button>
        </DialogTrigger>
        <DialogContent
          title="Edit print title"
          description="The saved title appears on the proof."
        >
          <form
            noValidate
            style={layout}
            onSubmit={(event) => {
              event.preventDefault();
              const next = draft.trim();
              if (!next) {
                setError("Enter a print title.");
                return;
              }
              setTitle(next);
              setDraft(next);
              setError("");
              setOpen(false);
            }}
          >
            <label htmlFor={inputId} style={field}>
              Print title
              <Input
                id={inputId}
                value={draft}
                maxLength={48}
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setError("");
                }}
              />
            </label>
            {error && (
              <p
                id={errorId}
                role="alert"
                style={{
                  ...note,
                  color: "var(--rams-detail-danger)",
                }}
              >
                {error}
              </p>
            )}
            <div style={field}>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save title</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

const stocks = [
  { value: "smooth", name: "Smooth", gsm: 120, finish: "Calendered" },
  { value: "cotton", name: "Cotton", gsm: 160, finish: "Soft, uncoated" },
  { value: "rag", name: "Rag", gsm: 220, finish: "Textured" },
];

export function MotionProofStockDrawerDemo() {
  const [value, setValue] = useState("cotton");
  const stock = stocks.find((item) => item.value === value)!;
  const selectId = useId();
  return (
    <section
      style={layout}
      aria-label="Córdoba proof paper"
      data-overlay-scene="proof-stock"
    >
      <header>
        <p style={note}>Córdoba / tile study</p>
        <strong>Paper for the proof</strong>
      </header>
      <dl style={{ ...layout, margin: 0, gap: "var(--rams-detail-preview-related-copy-gap)" }}>
        <div>
          <dt style={note}>Stock</dt>
          <dd style={{ margin: 0 }}>{stock.name}</dd>
        </div>
        <div>
          <dt style={note}>Weight</dt>
          <dd style={{ margin: 0 }}>{stock.gsm} gsm</dd>
        </div>
        <div>
          <dt style={note}>Finish</dt>
          <dd style={{ margin: 0 }}>{stock.finish}</dd>
        </div>
      </dl>
      <Drawer>
        <DrawerTrigger asChild>
          <Button type="button" variant="outline">
            Choose paper
          </Button>
        </DrawerTrigger>
        <DrawerContent
          title="Choose paper"
          description="Selections update the proof immediately."
          side="right"
        >
          <div style={layout}>
            <label htmlFor={selectId}>Paper stock</label>
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger
                id={selectId}
                style={{ width: "100%", minWidth: 0 }}
              >
                <SelectValue>{stock.name}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {stocks.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.name} · {item.gsm} gsm
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p style={note}>
              {stock.gsm} gsm · {stock.finish}.
            </p>
            <DrawerClose asChild>
              <Button type="button" variant="outline">
                Done
              </Button>
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </section>
  );
}

export function MotionInkPassPopoverDemo() {
  const [value, setValue] = useState("1");
  const passes = Number(value);
  const selectId = useId();
  return (
    <section
      style={overlayPreviewLayout}
      aria-label="Mendoza ink proof"
      data-overlay-scene="ink-passes"
    >
      <header>
        <p style={overlayPreviewNote}>Mendoza / separation study</p>
        <strong>One plate, two layers</strong>
      </header>
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" style={{ justifySelf: "start" }}>
            Ink passes
          </Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Ink pass settings">
          <div style={overlayPreviewLayout}>
            <label htmlFor={selectId}>Passes</label>
            <Select value={value} onValueChange={setValue}>
              <SelectTrigger
                id={selectId}
                style={{ width: "100%", minWidth: 0 }}
              >
                <SelectValue>{value}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
              </SelectContent>
            </Select>
            <p style={overlayPreviewNote}>One pass per separation layer.</p>
            <PopoverClose asChild>
              <Button type="button" variant="outline">
                Done
              </Button>
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
      <svg
        role="img"
        aria-label={`Mendoza proof with ${passes} ink ${passes === 1 ? "pass" : "passes"}.`}
        viewBox="0 0 280 180"
        style={graphic}
      >
        <rect
          x="18"
          y="18"
          width="244"
          height="144"
          fill="none"
          stroke="currentColor"
        />
        <g data-ink-pass="1" fill="none" stroke="currentColor">
          <path d="M42 139Q83 37 145 94T238 54" strokeWidth="var(--rams-detail-preview-ink-pass-route-stroke)" />
          <path d="M42 151Q83 49 145 106T238 66" />
        </g>
        {passes === 2 && (
          <g data-ink-pass="2" fill="currentColor" opacity="var(--rams-detail-preview-ink-pass-overprint-opacity)">
            <circle cx="101" cy="78" r="33" />
            <path d="M158 49h54v92h-54z" />
          </g>
        )}
      </svg>
      <output style={overlayPreviewNote}>
        60 sheets × {passes} {passes === 1 ? "pass" : "passes"} = {60 * passes}{" "}
        impressions.
      </output>

    </section>
  );
}

const plate = {
  reference: "LP-07",
  title: "Brick arch",
  process: "Drypoint",
  matrix: "Copper plate",
  paper: "Rag, 180 gsm",
  trim: "105 × 148 mm",
};

export function MotionPlateSpecsHoverCardDemo() {
  return (
    <section
      style={overlayPreviewLayout}
      aria-label="La Plata plate reference"
      data-overlay-scene="plate-specs"
    >
      <header>
        <p style={overlayPreviewNote}>La Plata / plate notes</p>
        <strong>{plate.title}</strong>
      </header>
      <HoverCard
        content={
          <div style={overlayPreviewLayout}>
            <strong>
              {plate.reference} · {plate.title}
            </strong>
            <dl style={{ ...overlayPreviewLayout, margin: 0, gap: "var(--rams-detail-preview-related-copy-gap)" }}>
              <div>
                <dt style={overlayPreviewNote}>Process</dt>
                <dd style={{ margin: 0 }}>{plate.process}</dd>
              </div>
              <div>
                <dt style={overlayPreviewNote}>Matrix</dt>
                <dd style={{ margin: 0 }}>{plate.matrix}</dd>
              </div>
              <div>
                <dt style={overlayPreviewNote}>Paper</dt>
                <dd style={{ margin: 0 }}>{plate.paper}</dd>
              </div>
              <div>
                <dt style={overlayPreviewNote}>Trim</dt>
                <dd style={{ margin: 0 }}>{plate.trim}</dd>
              </div>
            </dl>
          </div>
        }
      >
        <Button type="button" variant="outline">
          Plate {plate.reference}
        </Button>
      </HoverCard>
      <p style={overlayPreviewNote}>
        Hover or focus the plate reference for its specifications.
      </p>
    </section>
  );
}

export function MotionCropGuideTooltipDemo() {
  const [marks, setMarks] = useState(false);
  return (
    <section
      style={overlayPreviewLayout}
      aria-label="Tucumán crop proof"
      data-overlay-scene="crop-guides"
    >
      <header>
        <p style={overlayPreviewNote}>Tucumán / trim study</p>
        <strong>Keep the cut visible</strong>
      </header>
      <Tooltip content="Cut guides.">
        <Button
          type="button"
          variant="outline"
          style={{ justifySelf: "start" }}
          aria-pressed={marks}
          onClick={() => setMarks((current) => !current)}
        >
          Crop marks
        </Button>
      </Tooltip>
      <svg
        role="img"
        aria-label={`140 by 200 millimetre proof, crop marks ${marks ? "on" : "off"}.`}
        viewBox="0 0 180 240"
        style={graphic}
      >
        <rect
          x="20"
          y="20"
          width="140"
          height="200"
          fill="none"
          stroke="currentColor"
          strokeWidth="var(--rams-detail-preview-crop-guide-grid-stroke)"
        />
        <path
          d="M34 186Q61 56 104 133T146 73"
          fill="none"
          stroke="currentColor"
          strokeWidth="var(--rams-detail-preview-crop-guide-outline-stroke)"
        />
        <path
          d="M34 201Q61 71 104 148T146 88"
          fill="none"
          stroke="currentColor"
          strokeWidth="var(--rams-detail-preview-crop-guide-register-stroke)"
        />
        {marks && (
          <g data-crop-marks="true" fill="none" stroke="currentColor">
            <path d="M6 20h10M20 6v10" />
            <path d="M164 20h10M160 6v10" />
            <path d="M6 220h10M20 224v10" />
            <path d="M164 220h10M160 224v10" />
          </g>
        )}
      </svg>

      <output style={overlayPreviewNote}>
        Crop marks {marks ? "on" : "off"} · 140 × 200 mm trim.
      </output>
    </section>
  );
}
