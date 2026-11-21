import { RamsText } from "../brand/RamsName";
import { Fragment, lazy, startTransition, Suspense, useEffect, useState, type MouseEvent } from "react";
import type { ComponentFamily, ComponentVariant } from "./components";
import { ComponentPreview, componentSources, exampleSources } from "./Preview";
import { portableSource } from "./portable-source";
import { PreviewScope } from "./PreviewScope";
const VariantDocumentation = lazy(() => import("./VariantDocumentation"));
import { Button } from "../primitives/button";
import {
  NativeSelect,
  NativeSelectOption,
} from "../primitives/native-select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../primitives/tabs";

// Catalog vocabulary only: meaningful discretionary breaks before the emergency
// overflow wrap. Generated spans preserve the canonical accessible/copied name.
const titleBreaks: Record<string, string> = {
  Accordion: "Ac-cor-dion", Announcement: "An-nounce-ment", Breadcrumb: "Bread-crumb",
  Changelog: "Change-log", Checklist: "Check-list", Collapsible: "Col-laps-ible",
  Comparison: "Com-par-i-son", Countdown: "Count-down", Expandable: "Ex-pand-able",
  Expanding: "Ex-pand-ing", Histogram: "His-to-gram", Navigation: "Nav-i-ga-tion",
  Newsletter: "News-letter", Notification: "No-ti-fi-ca-tion", Onboarding: "On-board-ing",
  Pagination: "Pag-i-na-tion", Reactions: "Re-ac-tions", Reorderable: "Re-order-able",
  Resizable: "Re-siz-able", Ridgeline: "Ridge-line", Segmented: "Seg-ment-ed",
  Separator: "Sep-a-ra-tor", Signature: "Sig-na-ture", Sparkline: "Spark-line",
  Streamgraph: "Stream-graph",
};
function ComponentTitleText({ value }: { value: string }) {
  return value.split(/(\s+)/).map((word, index) => titleBreaks[word]
    ? <span key={index}>{titleBreaks[word].split("-").map((part, at) => <Fragment key={at}>{at > 0 && <span className="docs-discretionary-break" aria-hidden="true" />}{part}</Fragment>)}</span>
    : word);
}

// Preserve native fragment destinations inside previews hosted by this hash router.
// Portable components and ordinary links retain their own href behavior.
function followPreviewFragment(event: MouseEvent<HTMLDivElement>) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !location.hash.startsWith("#/")) return;
  const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
  const fragment = anchor?.getAttribute("href");
  if (!anchor || anchor.hasAttribute("download") || anchor.target || !fragment || fragment.startsWith("#/")) return;
  let destination: HTMLElement | null;
  try { destination = document.getElementById(decodeURIComponent(fragment.slice(1))); }
  catch { return; }
  if (!destination || !event.currentTarget.contains(destination)) return;
  event.preventDefault();
  if (!destination.hasAttribute("tabindex")) destination.tabIndex = -1;
  destination.scrollIntoView({ block: "start" });
  destination.focus({ preventScroll: true });
}

function codePath(path: string) {
  return path.replace("src/", "../");
}
function readTab() {
  const value = new URLSearchParams(location.hash.split("?")[1] || "").get(
    "tab",
  );
  return value === "documentation" || value === "code" ? value : "preview";
}
function CodePanel({ variant }: { variant: ComponentVariant }) {
  const files = variant.codeFiles;
  const [file, setFile] = useState(files[0]);
  const [text, setText] = useState("Loading code…");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  useEffect(() => {
    setFile(files[0]);
    setCopied(false);
    setCopyError(false);
  }, [variant.id]);
  useEffect(() => {
    if (!copied && !copyError) return;
    const timer = window.setTimeout(() => {
      setCopied(false);
      setCopyError(false);
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [copied, copyError]);
  useEffect(() => {
    let live = true;
    setText("Loading code…");
    const load =
      componentSources[codePath(file)] || exampleSources[codePath(file)];
    if (load)
      load()
        .then((value) => {
          if (live) setText(portableSource(value));
        })
        .catch(() => {
          if (live) setText("Could not load the file.");
        });
    else setText("File unavailable.");
    return () => {
      live = false;
    };
  }, [file]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1">
          <label
            htmlFor="component-code-file"
            className="mb-2 block text-sm font-medium"
          >
            File
          </label>
          <NativeSelect
            id="component-code-file"
            value={file}
            onChange={(event) => {
              setFile(event.target.value);
              setCopied(false);
              setCopyError(false);
            }}
          >
            {files.map((path) => (
              <NativeSelectOption value={path} key={path}>
                {path.split("/").slice(-2).join("/")}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <Button
          variant="outline"
          disabled={
            !text ||
            /^(Loading code|Could not load|File unavailable)/.test(
              text,
            )
          }
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              setCopyError(false);
            } catch {
              setCopied(false);
              setCopyError(true);
            }
          }}
        >
          {copied ? "Copied" : "Copy code"}
        </Button>
      </div>
      <pre
        className="component-code"
        tabIndex={0}
        role="region"
        aria-label="Variant code"
      >
        <code>{text}</code>
      </pre>
      <span className="sr-only" role="status">
        {copied
          ? "Code copied"
          : copyError
            ? "Could not copy. Select the code to copy it."
            : ""}
      </span>
    </div>
  );
}
export default function ComponentDocumentation({
  family,
  variantId,
}: {
  family: ComponentFamily;
  variantId?: string;
}) {
  useEffect(() => {
    if (family.id === "item" && variantId === "baseline-item-size") {
      location.replace(location.href.replace("/baseline-item-size", "/baseline-item-demo"));
    }
  }, [family.id, variantId]);
  const selected =
    family.variants.find((variant) => variant.id === variantId) ||
    family.variants[0];
  const [tab, setTab] = useState(readTab);
  const [reset, setReset] = useState(0);
  useEffect(() => {
    const onHash = () => startTransition(() => setTab(readTab()));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const changeTab = (value: string) => {
    startTransition(() => setTab(value));
    const [path, query = ""] = location.hash.split("?");
    const params = new URLSearchParams(query);
    if (value === "preview") params.delete("tab");
    else params.set("tab", value);
    history.replaceState(null, "", `${path}${params.size ? "?" + params : ""}`);
  };
  const isBlock = family.group === "Blocks";
  const hasVariants = family.variants.length > 1;
  // Sidebar has one visual layout. Its retained deep links select code recipes,
  // not fictitious visual variants of that same layout.
  const isSidebarRecipe = family.id === "sidebar";
  const previewVariant = isSidebarRecipe ? family.variants[0] : selected;
  return (
    <article data-component-family={family.id}>
      <h1 className="docs-page-title component-title text-3xl font-semibold tracking-tight">
        <ComponentTitleText value={family.name} />
      </h1>
      <p className="component-description mt-3 max-w-2xl text-muted-foreground">
        <RamsText>{family.description}</RamsText>
      </p>
      {hasVariants && (
        <div className="component-variant-field my-6">
          <label
            htmlFor="component-variant"
            className="mb-2 block text-sm font-medium"
          >
            {isSidebarRecipe ? "Integration recipe" : "Variant"}
          </label>
          <NativeSelect
            id="component-variant"
            value={selected.id}
            onChange={(event) => {
              const nextTab = isSidebarRecipe && tab === "preview" ? "documentation" : tab;
              location.hash = `/components/${family.id}/${event.target.value}${nextTab === "preview" ? "" : "?tab=" + nextTab}`;
            }}
            className="max-w-md"
          >
            {family.variants.map((variant) => (
              <NativeSelectOption key={variant.id} value={variant.id}>
                {variant.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {isSidebarRecipe && <p className="mt-2 text-sm text-muted-foreground">One shared navigation preview. The two integration recipes differ in who owns expanded state; compare them in Documentation or Code.</p>}
        </div>
      )}
      <div className={hasVariants ? undefined : "mt-6"}>
        <Tabs value={tab} onValueChange={changeTab}>
          <div className="component-tabs">
            <TabsList aria-label="Component view">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>
            {tab === "preview" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setReset((value) => value + 1)}
              >
                Reset
              </Button>
            )}
          </div>
          <TabsContent value="preview">
            {(selected.requiresFrame || family.id === "page-header" || family.id === "site-header") && <p className="mb-3 text-sm"><a className="docs-underlined-link" href={`#/preview/${selected.id}`} target="_blank" rel="noreferrer">Open standalone preview <span className="sr-only">in a new tab</span></a></p>}
            <div
              className={`component-preview-stage ${isBlock ? "component-preview-block" : ""}`}
              data-selected-variant={selected.id}
              onClick={followPreviewFragment}
            >
              <ComponentPreview
                key={`${previewVariant.id}:${reset}`}
                variant={previewVariant}
              />
            </div>
            <PreviewScope variant={selected} familyDescription={family.description} />
          </TabsContent>
          <TabsContent value="documentation">
            <Suspense fallback={<p role="status">Loading documentation…</p>}>
              <VariantDocumentation
                key={selected.id}
                variant={selected}
                hasVariants={hasVariants}
                familyDescription={family.description}
              />
            </Suspense>
          </TabsContent>
          <TabsContent value="code">
            <CodePanel key={selected.id} variant={selected} />
          </TabsContent>
        </Tabs>
      </div>
    </article>
  );
}
