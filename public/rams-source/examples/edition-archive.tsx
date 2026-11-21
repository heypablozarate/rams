"use client";
import { useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "../components/sidebar";
import { Input } from "../components/input";
import { Label } from "../components/label";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "../components/item";
const collections = [
  {
    name: "Trama",
    note: "Two-colour studies on uncoated stock.",
    prints: [
      {
        name: "Courtyard / 12",
        detail: "Screenprint · 42 × 60 cm · 60 copies",
      },
      {
        name: "River grid / 14",
        detail: "Letterpress · 24 × 32 cm · 80 copies",
      },
    ],
  },
  {
    name: "Barranca",
    note: "Folded sheets and small-format editions.",
    prints: [
      { name: "Long fold / 03", detail: "Risograph · 14 × 21 cm · 120 copies" },
    ],
  },
  {
    name: "Pasaje",
    note: "Geometric posters from the Rosario print room.",
    prints: [
      {
        name: "Window rhythm / 08",
        detail: "Screenprint · 50 × 70 cm · 40 copies",
      },
      {
        name: "Corner light / 09",
        detail: "Letterpress · 30 × 40 cm · 50 copies",
      },
    ],
  },
];
function CollectionGlyph({ index }: { index: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      {index === 0 ? (
        <>
          <path
            d="M4 4h16v16H4zM4 12h16M12 4v16"
            stroke="currentColor"
            strokeWidth="var(--rams-detail-example-archive-collection-glyph-stroke)"
          />
        </>
      ) : index === 1 ? (
        <path
          d="m4 8 8-4 8 4v12H4zM4 8h16"
          stroke="currentColor"
          strokeWidth="var(--rams-detail-example-archive-collection-glyph-stroke)"
        />
      ) : (
        <>
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="2"
            stroke="currentColor"
            strokeWidth="var(--rams-detail-example-archive-collection-glyph-stroke)"
          />
          <path d="M9 4v16m6-16v16" stroke="currentColor" strokeWidth="var(--rams-detail-example-archive-collection-glyph-stroke)" />
        </>
      )}
    </svg>
  );
}
function ArchiveLayout() {
  const [selected, setSelected] = useState(0),
    [query, setQuery] = useState(""),
    state = useSidebar(),
    collection = collections[selected],
    visible = collection.prints.filter((print) =>
      print.name.toLowerCase().includes(query.trim().toLowerCase()),
    );
  return (
    <>
      <Sidebar
        variant="floating"
        collapsible="icon"
        aria-label="Print collections"
      >
        <SidebarHeader>
          {(state.open || state.isMobile) && <strong>Print archive</strong>}
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Collections</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {collections.map((item, index) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      isActive={selected === index}
                      tooltip={item.name}
                      onClick={() => {
                        setSelected(index);
                        setQuery("");
                        if (state.isMobile) state.setOpenMobile(false);
                      }}
                    >
                      <CollectionGlyph index={index} />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>{item.prints.length}</SidebarMenuBadge>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        {(state.open || state.isMobile) && (
          <SidebarFooter>
            <small>Rosario print room</small>
          </SidebarFooter>
        )}
      </Sidebar>
      <SidebarInset
        style={{ padding: "var(--rams-detail-example-page-inset)", overflowWrap: "anywhere" }}
      >
        <header style={{ display: "flex", alignItems: "center", gap: "var(--rams-detail-preview-scene-gap)" }}>
          <SidebarTrigger />
          <span>Edition archive</span>
        </header>
        <section
          aria-labelledby="collection-heading"
          style={{ maxWidth: "var(--rams-detail-example-page-measure-single)", marginTop: "var(--rams-detail-example-section-gap-wide)" }}
        >
          <p>Collection / {String(selected + 1).padStart(2, "0")}</p>
          <h1 id="collection-heading" className="rams-editorial-title">
            {collection.name}
          </h1>
          <p>{collection.note}</p>
          <Label htmlFor="archive-filter">Find a print</Label>
          <Input
            id="archive-filter"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{ marginBlock: "var(--rams-detail-preview-element-gap) var(--rams-detail-example-section-gap)" }}
          />
          {visible.length ? (
            <div>
              {visible.map((print) => (
                <Item key={print.name}>
                  <ItemContent>
                    <ItemTitle>{print.name}</ItemTitle>
                    <ItemDescription>{print.detail}</ItemDescription>
                  </ItemContent>
                </Item>
              ))}
            </div>
          ) : (
            <p role="status">No print matches this title.</p>
          )}
        </section>
      </SidebarInset>
    </>
  );
}
export function EditionArchive() {
  return (
    <SidebarProvider>
      <ArchiveLayout />
    </SidebarProvider>
  );
}
