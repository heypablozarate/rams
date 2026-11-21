import { RamsName, RamsText } from "./brand/RamsName";
import { RamsIdentity } from "./brand/RamsIdentity";
import { publicHeaderGeometry } from "./primitives/public-header-geometry";
import { GlassHeaderLayer } from "./variants/materials/public-header/glass-header-layer";
import { componentCatalog } from "./catalog/components";
import { canonicalComponentRoute } from "./catalog/catalog-routes";
import { lazy, startTransition, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { ArrowUpRight, Menu, Moon, Search, Sun } from "lucide-react";
import { DensityControl } from "./baseline/DensityControls";
import { canonicalFoundationRoute, foundationNavigation, foundationPageSection } from "./baseline/foundation-navigation";
const ComponentDocumentation = lazy(() => import("./catalog/ComponentDocumentation"));
const ComponentPreview = lazy(() => import("./catalog/Preview").then(({ ComponentPreview }) => ({ default: ComponentPreview })));
const InstallationGuide = lazy(() => import("./catalog/InstallationGuide"));
const Legal = lazy(() => import("./baseline/Legal").then(({ Legal }) => ({ default: Legal })));
const MotionGuide = lazy(() => import("./baseline/MotionGuide"));
const TypographyGuide = lazy(() => import("./typography/TypographyGuide"));
const BrandGuide = lazy(() => import("./brand/BrandGuide"));
const PublicHeaderReview = lazy(() => import("./variants/demos/public-header"));
const Foundations = lazy(() => import("./baseline/Foundations"));
import { Button } from "./primitives/button";
import { Input } from "./primitives/input";
import { NativeSelect, NativeSelectOption } from "./primitives/native-select";
import * as Sheet from "./primitives/sheet";
import * as Dialog from "./primitives/dialog";
import * as Command from "./primitives/command";

const loadingPreview = <p role="status">Loading preview…</p>;

const readPath = () => {
  const componentRoute = canonicalComponentRoute(location.hash);
  if (componentRoute) {
    history.replaceState(null, "", `#${componentRoute}`);
    return componentRoute.split("?")[0];
  }
  const foundationRoute = canonicalFoundationRoute(location.hash);
  if (foundationRoute) {
    if (location.hash !== `#${foundationRoute}`)
      history.replaceState(null, "", `#${foundationRoute}`);
    return foundationRoute;
  }
  const path = (location.hash.slice(1) || "/").split("?")[0];
  const legacy = path.match(/^\/components\/arc-(.+)$/);
  if (legacy)
    for (const family of componentCatalog) {
      const variant = family.variants.find(
        (variant) => variant.kind === "library" && variant.demoId === legacy[1],
      );
      if (variant) {
        const next = `/components/${family.id}/${variant.id}`;
        history.replaceState(null, "", "#" + next);
        return next;
      }
    }
  return path;
};
const groups = [...new Set(componentCatalog.map((c) => c.group))];
const documentationPages = [
  {href: "/installation", label: "Installation", type: "Get started"},
  ...foundationNavigation.map(({href, label}) => ({href, label, type: "Foundation"})),
  {href: "/legal", label: "Licenses and provenance", type: "Project"},
];
function Nav({ path, close }: { path: string; close: () => void }) {
  return (
    <nav aria-label="Documentation" className="space-y-6 text-sm">
      <DensityControl />
      {[
        {label: "Get started", links: [["/installation", "Installation"], ["/", "Browse components"]]},
        {label: "Foundations", links: foundationNavigation.map(({href, label}) => [href, label])},
      ].map(section => <div className="space-y-1" key={section.label}>
        <p className="px-3 pb-2 font-medium">{section.label}</p>
        {section.links.map(([url, label]) => (
          <a
            key={url}
            href={`#${url}`}
            onClick={close}
            aria-current={path === url ? "page" : undefined}
            className="block rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground aria-[current=page]:bg-accent aria-[current=page]:text-foreground"
          >
            {label}
          </a>
        ))}
      </div>)}
      {groups.map((group) => (
        <div key={group}>
          <p className="px-3 pb-2 font-medium">{group}</p>
          {componentCatalog
            .filter((c) => c.group === group)
            .map((c) => (
              <a
                key={c.id}
                href={`#/components/${c.id}`}
                onClick={close}
                aria-current={
                  path.startsWith(`/components/${c.id}/`) ||
                  path === `/components/${c.id}`
                    ? "page"
                    : undefined
                }
                className="block rounded-md px-3 py-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground aria-[current=page]:bg-accent aria-[current=page]:text-foreground"
              >
                {c.name}
              </a>
            ))}
        </div>
      ))}
      <div className="space-y-1">
        <p className="px-3 pb-2 font-medium">Project</p>
        <a
          href="#/legal"
          onClick={close}
          aria-current={path === "/legal" ? "page" : undefined}
          className="block rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground aria-[current=page]:bg-accent aria-[current=page]:text-foreground"
        >
          Licenses and provenance
        </a>
      </div>
    </nav>
  );
}
export default function App() {
  const [path, setPath] = useState(readPath),
    [search, setSearch] = useState(false),
    [menu, setMenu] = useState(false),
    [filter, setFilter] = useState(""),
    [category, setCategory] = useState(""),
    [fontState, setFontState] = useState("Checking fonts…");
  const { theme, setTheme } = useTheme();
  const [shellScrolled, setShellScrolled] = useState(false);
  const [headerTall, setHeaderTall] = useState(false);
  useEffect(() => { const update = () => setShellScrolled(window.scrollY > publicHeaderGeometry.glassScrollThresholdPx); update(); window.addEventListener("scroll", update, {passive:true}); return () => window.removeEventListener("scroll", update); }, []);
  const main = useRef<HTMLElement>(null);
  const header = useRef<HTMLElement>(null);
  const searchReturn = useRef<HTMLElement | null>(null);
  const menuReturn = useRef<HTMLElement | null>(null);
  const searchPath = useRef("");
  const menuPath = useRef("");
  const restoreOverlayFocus = (event: Event, target: HTMLElement | null, openedAt: string) => {
    event.preventDefault();
    if (location.hash !== openedAt) main.current?.focus({ preventScroll: true });
    else {
      if (target?.isConnected) target.focus({ preventScroll: true });
      if (!target || document.activeElement !== target) main.current?.focus({ preventScroll: true });
    }
  };
  const standalone = path.startsWith("/preview/") || path.startsWith("/embed/");
  useEffect(() => {
    const element = header.current;
    if (!element) {
      document.documentElement.style.removeProperty("--docs-header-height");
      return;
    }
    const measureHeader = () => {
      const height = element.getBoundingClientRect().height;
      const maxStickyFraction = Number(getComputedStyle(element).getPropertyValue("--rams-detail-docs-header-max-sticky-fraction"));
      const tall = height > window.innerHeight * maxStickyFraction;
      setHeaderTall(tall);
      if (tall) document.documentElement.style.removeProperty("--docs-header-height");
      else document.documentElement.style.setProperty("--docs-header-height", `${height}px`);
    };
    const observer = new ResizeObserver(measureHeader);
    observer.observe(element);
    window.addEventListener("resize", measureHeader);
    return () => { observer.disconnect(); window.removeEventListener("resize", measureHeader); };
  }, [standalone]);
  useEffect(() => {
    const h = () => {
      const next = readPath();
      setMenu(false);
      startTransition(() => {
        setPath(next);
        setFilter("");
      });
    };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  useLayoutEffect(() => {
    if (path.startsWith("/embed/")) return;
    window.scrollTo(0, 0);
    // Route focus happens with the committed view, never after a later user
    // interaction. Preserve a child that deliberately focused itself on mount.
    if (document.querySelector('[role="dialog"]')) return;
    if (document.activeElement && document.activeElement !== main.current &&
      main.current?.contains(document.activeElement)) return;
    main.current?.focus({ preventScroll: true });
  }, [path]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearch((v) => {
          if (!v) { searchReturn.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; searchPath.current = location.hash; }
          return !v;
        });
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  useEffect(() => {
    Promise.all([
      document.fonts.load('400 16px "Geist Sans"'),
      document.fonts.load('400 16px "Geist Serif"'),
    ])
      .then((r) =>
        setFontState(
          r.every((a) => a.length)
            ? "Geist Sans + Serif loaded"
            : "Fallback active: Arial/Helvetica and Georgia",
        ),
      )
      .catch(() => setFontState("Fallback active: Arial/Helvetica and Georgia"));
  }, []);
  if (path === "/review/public-header") return <Suspense fallback={<p role="status">Loading header…</p>}><PublicHeaderReview /></Suspense>;
  if (path.startsWith("/embed/")) {
    const demoId = path.slice(7);
    const variant = componentCatalog
      .flatMap((family) => family.variants)
      .find(
        (variant) => variant.demoId === demoId && variant.kind === "baseline",
      );
    return variant ? (
      <Suspense fallback={loadingPreview}>
        <ComponentPreview variant={variant} embedded />
      </Suspense>
    ) : (
      <p>Example not found.</p>
    );
  }
  if (path.startsWith("/preview/")) {
    const variant = componentCatalog
      .flatMap((family) => family.variants)
      .find((variant) => variant.id === path.slice(9));
    return variant ? (
      <Suspense fallback={loadingPreview}>
        <ComponentPreview variant={variant} embedded />
      </Suspense>
    ) : (
      <p>Preview not found.</p>
    );
  }
  const id = path.startsWith("/components/") ? path.split("/")[2] : null;
  const entry = componentCatalog.find((family) => family.id === id);
  const variantId = path.split("/")[3];
  const items = componentCatalog.filter((c) =>
    (!category || c.group === category) &&
    `${c.name} ${c.group} ${c.description}`
      .toLowerCase()
      .includes(filter.toLowerCase()),
  );
  return (
    <div className="docs-page">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
        className="docs-skip-link sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-md focus:bg-background focus:p-3"
      >
        Skip to content
      </a>
      <header
        ref={header}
        className="docs-shell-header rams-public-glass-scope sticky top-0"
        data-tall={headerTall || undefined}
      >
        <GlassHeaderLayer active={shellScrolled || menu} hairline={false} />
        <div className="relative docs-header-row mx-auto flex min-h-16 max-w-screen-2xl items-center gap-3 px-[var(--rams-detail-docs-header-padding-inline)] lg:px-6">
          <a
            href="#/"
            className="docs-brand-link text-lg font-semibold tracking-tight"
          >
            <RamsIdentity />
          </a>
          <div className="docs-header-controls ml-auto flex min-w-0 max-w-full flex-wrap items-center justify-end gap-2">
            <Button
              className="docs-menu-trigger"
              variant="ghost"
              size="icon"
              aria-label="Open navigation"
              onClick={(event) => { menuReturn.current = event.currentTarget; menuPath.current = location.hash; setMenu(true); }}
            >
              <Menu />
            </Button>
            <Button
              variant="outline"
              className="docs-search-button w-60 justify-start"
              aria-label="Search documentation"
              onClick={(event) => { searchReturn.current = event.currentTarget; searchPath.current = location.hash; setSearch(true); }}
            >
              <Search />
              <span className="docs-search-label">
                Search components…
              </span>
              <kbd className="docs-search-label ml-auto text-xs text-muted-foreground">
                ⌘ K
              </kbd>
            </Button>
            <Button
              className="docs-theme-button"
              variant="ghost"
              size="icon"
              aria-label={
                theme === "dark" ? "Use light theme" : "Use dark theme"
              }
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>
            <Button
              className="docs-auto-button"
              variant={theme === "system" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setTheme("system")}
            >
              Auto
            </Button>
          </div>
        </div>
      </header>
      <div className="docs-layout mx-auto grid max-w-screen-2xl">
        <aside className="docs-sidebar overflow-y-auto [border-right-width:var(--rams-detail-primitive-border-width)] p-4">
          <Nav path={path} close={() => setMenu(false)} />
        </aside>
        <main
          id="main"
          ref={main}
          tabIndex={-1}
          className="docs-main min-w-0 p-5 outline-none sm:p-8 lg:px-12 lg:py-10"
        >
          <div className="mx-auto max-w-4xl">
            {/* Keep the committed catalog view visible while a preview module loads. */}
            <Suspense fallback={loadingPreview}>
              {entry ? (
                <ComponentDocumentation
                  key={entry.id}
                  family={entry}
                  variantId={variantId}
                />
              ) : path === "/legal" || path === "/provenance" ? (
                <Legal />
              ) : path === "/motion" ? (
                <Suspense fallback={<p>Loading motion…</p>}><MotionGuide /></Suspense>
              ) : path === "/typography" ? (
                <Suspense fallback={<p role="status">Loading typography…</p>}><TypographyGuide /></Suspense>
              ) : path === "/brand" ? (
                <Suspense fallback={<p role="status">Loading brand guide…</p>}><BrandGuide /></Suspense>
              ) : path.startsWith("/foundations?") ? (
                <Suspense fallback={<p role="status">Loading foundations…</p>}>
                  <Foundations section={foundationPageSection(path)} />
                </Suspense>
              ) : path === "/installation" ? (
                <InstallationGuide />
              ) : (
                <>
                  <h1 className="docs-page-title text-3xl font-semibold tracking-tight">
                    Components
                  </h1>
                  <p className="mt-3 max-w-2xl text-muted-foreground">
                    Explore variants, APIs, and interactive examples.
                  </p>
                  <label
                    htmlFor="filter"
                    className="mt-6 mb-2 block text-sm font-medium"
                  >
                    Filter catalog
                  </label>
                  <Input
                    id="filter"
                    placeholder="Search by name, category, or use…"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="max-w-lg"
                  />
                  <div className="mt-4 max-w-lg">
                    <label htmlFor="catalog-category" className="mb-2 block text-sm font-medium">Category</label>
                    <NativeSelect id="catalog-category" value={category} onChange={event => setCategory(event.target.value)}>
                      <NativeSelectOption value="">All categories</NativeSelectOption>
                      {groups.map(group => <NativeSelectOption key={group} value={group}>{group}</NativeSelectOption>)}
                    </NativeSelect>
                  </div>
                  <p className="my-4 text-xs text-muted-foreground" role="status">
                    {items.length} items
                  </p>
                  <div className="catalog-grid gap-x-8 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((c) => (
                      <a
                        key={c.id}
                        href={`#/components/${c.id}`}
                        className="catalog-link min-w-0 py-6 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h2 className="font-medium">{c.name}</h2>
                          <ArrowUpRight className="size-4 text-muted-foreground" />
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          <RamsText>{c.description}</RamsText>
                        </p>
                        <p className="mt-4 text-xs text-muted-foreground">
                          {c.variants.length > 1 ? `${c.variants.length} variants · ` : ""}
                          {c.group}
                        </p>
                      </a>
                    ))}
                  </div>
                  {!items.length && (
                    <div className="rounded-xl [border-width:var(--rams-detail-primitive-border-width)] p-8">
                      <h2 className="font-medium">No results</h2>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => { setFilter(""); setCategory(""); }}
                      >
                        Clear search
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Suspense>
            <footer className="docs-footer mt-14 flex flex-wrap justify-between gap-3 pt-6 text-xs text-muted-foreground">
              <a href="#/legal" className="docs-underlined-link">
                <RamsName /> · MIT
              </a>
              {fontState.startsWith("Fallback") && (
                <span role="status">{fontState}</span>
              )}
            </footer>
          </div>
        </main>
      </div>
      <Sheet.Sheet open={menu} onOpenChange={setMenu}>
        <Sheet.SheetContent side="left" className="overflow-y-auto" onCloseAutoFocus={(event) => restoreOverlayFocus(event, menuReturn.current, menuPath.current)}>
          <Sheet.SheetHeader>
            <Sheet.SheetTitle>Documentation</Sheet.SheetTitle>
            <Sheet.SheetDescription>
              Components and foundations.
            </Sheet.SheetDescription>
          </Sheet.SheetHeader>
          <div className="p-4">
            <Nav path={path} close={() => setMenu(false)} />
          </div>
        </Sheet.SheetContent>
      </Sheet.Sheet>
      <Dialog.Dialog open={search} onOpenChange={setSearch}>
        <Dialog.DialogContent onCloseAutoFocus={(event) => restoreOverlayFocus(event, searchReturn.current, searchPath.current)}>
          <Dialog.DialogTitle>Search documentation</Dialog.DialogTitle>
          <Dialog.DialogDescription>
            Search by name or function.
          </Dialog.DialogDescription>
          <Command.Command label="Search documentation">
            <Command.CommandInput
              aria-label="Search documentation"
              placeholder="Find a component or documentation page…"
            />
            <Command.CommandList>
              <Command.CommandEmpty>No results.</Command.CommandEmpty>
              <Command.CommandGroup heading="Documentation">
                {documentationPages.map(page => <Command.CommandItem key={page.href} value={`${page.label} ${page.type}`} onSelect={() => { location.hash = page.href; setSearch(false); }}>
                  <span>{page.label}</span><span className="ml-auto text-xs text-muted-foreground">{page.type}</span>
                </Command.CommandItem>)}
              </Command.CommandGroup>
              <Command.CommandGroup heading="Components">
                {componentCatalog.map((c) => (
                  <Command.CommandItem
                    key={c.id}
                    value={`${c.name} ${c.group} ${c.description}`}
                    onSelect={() => {
                      location.hash = `/components/${c.id}`;
                      setSearch(false);
                    }}
                  >
                    {c.name}
                  </Command.CommandItem>
                ))}
              </Command.CommandGroup>
            </Command.CommandList>
          </Command.Command>
        </Dialog.DialogContent>
      </Dialog.Dialog>
    </div>
  );
}
