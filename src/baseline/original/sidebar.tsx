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
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "../../primitives/sidebar";
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
} from "../../primitives/item";
const collections = [
  {
    title: "Folds",
    note: "Small editions from the Rosario print room.",
    editions: [
      { title: "Long fold / 03", detail: "Letterpress · 24 sheets" },
      { title: "Patio / 07", detail: "Screenprint · 40 sheets" },
    ],
  },
  {
    title: "Grids",
    note: "Studies in repeated modules.",
    editions: [{ title: "River grid / 14", detail: "Two inks · 60 sheets" }],
  },
  {
    title: "Impressions",
    note: "Paper and relief studies.",
    editions: [
      { title: "Barranca / 09", detail: "Cotton stock · 30 sheets" },
      { title: "Trama / 16", detail: "Linen stock · 48 sheets" },
    ],
  },
];
function CollectionMark({ index }: { index: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path
        d={
          index === 0
            ? "M4 4h8v16H4zm8 0 8 4v12l-8-4"
            : index === 1
              ? "M4 4h16v16H4zm0 8h16M12 4v16"
              : "M4 18 18 4M7 20 20 7M4 11 11 4"
        }
        stroke="currentColor"
        strokeWidth="var(--rams-detail-preview-navigation-glyph-stroke)"
      />
    </svg>
  );
}
function ArchiveLayout() {
  const [index, setIndex] = useState(0),
    state = useSidebar(),
    collection = collections[index];
  return (
    <>
      <Sidebar aria-label="Print collections" collapsible="offcanvas">
        <SidebarHeader>
          <strong>Print collections</strong>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Edition archive</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {collections.map((row, n) => (
                  <SidebarMenuItem key={row.title}>
                    <SidebarMenuButton
                      isActive={n === index}
                      aria-current={n === index ? "page" : undefined}
                      onClick={() => {
                        setIndex(n);
                        if (state.isMobile) state.setOpenMobile(false);
                      }}
                    >
                      <CollectionMark index={n} />
                      <span>{row.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--rams-detail-space-4)",
            padding: "var(--rams-detail-space-4)",
          }}
        >
          <SidebarTrigger aria-label="Toggle print collections" />
          <span>Edition archive</span>
        </header>
        <section
          aria-label="Selected collection"
          style={{
            padding: "var(--rams-detail-space-4)",
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr)",
            gap: "var(--rams-detail-space-4)",
          }}
        >
          <h2>{collection.title}</h2>
          <p>{collection.note}</p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {collection.editions.map((edition) => (
              <li key={edition.title}>
                <Item>
                  <ItemContent>
                    <ItemTitle asChild>
                      <h3>{edition.title}</h3>
                    </ItemTitle>
                    <ItemDescription>{edition.detail}</ItemDescription>
                  </ItemContent>
                </Item>
              </li>
            ))}
          </ul>
        </section>
      </SidebarInset>
    </>
  );
}
export function SidebarDemo() {
  return (
    <SidebarProvider style={{ minBlockSize: "var(--rams-detail-sidebar-demo-min-block-size)" }}>
      <ArchiveLayout />
    </SidebarProvider>
  );
}
export function SidebarControlled() {
  const [open, setOpen] = useState(true);
  return (
    <SidebarProvider
      open={open}
      onOpenChange={setOpen}
      style={{ minBlockSize: "var(--rams-detail-sidebar-demo-min-block-size)" }}
    >
      <ArchiveLayout />
    </SidebarProvider>
  );
}
