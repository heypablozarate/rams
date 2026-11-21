# Sidebars

SidebarProvider shares desktop open state and a separate mobile-open state. Compose Sidebar alongside SidebarInset; put SidebarTrigger in the visible content so navigation remains reachable when collapsed. Give Sidebar a useful accessible label. Selection and page content belong to the application; keep their state outside the responsive surface.

Choose `variant="sidebar"` for an edge divider, `floating` for an inset bordered surface, or `inset` to give the adjacent content a distinct surface. These treatments share controls and type. `side="left"` or `right` chooses the desktop edge and mobile Sheet edge. `collapsible="offcanvas"` removes the closed navigation from interaction; `icon` retains named icon actions; `none` keeps navigation in flow at every width. A fixed navigation needs enough space beside its content.

At viewport widths up to and including 767 CSS px by default, collapsible navigation uses RAMS Sheet with a labelled title, close control, focus containment and return to SidebarTrigger. The `mobileViewportQuery` token owns that threshold. Desktop collapse makes offcanvas content inert and returns focus when it would become hidden. Keep the icon and text name in icon menu buttons and use a tooltip for the collapsed hint. MenuButton consumes RAMS Button and supports active state, size, outline treatment and asChild links. Nested items, counts and auxiliary actions remain separate parts.

Provider accepts defaultOpen or controlled open/onOpenChange; useSidebar exposes those states, setters, isMobile and toggleSidebar. Ctrl/Cmd+B toggles navigation outside editable fields. Changing desktop state writes sidebar_state with a seven-day lifetime; the host can read that value to supply defaultOpen on a later visit. The provider does not infer a stored initial state.

Set --sidebar-width and --sidebar-width-icon on Provider style to customize widths; mobile portals receive those same width variables. The host owns any layout height and scrolling outside the navigation. Content scrolls independently between Header and Footer. Keep auxiliary actions named, provide meaningful link destinations, and use showOnHover only for an action also revealed by keyboard focus. Skeleton widths are deterministic for server rendering.

[Edition Archive](../examples/edition-archive.tsx) shares collection selection across desktop and mobile, filters actual print titles, and preserves the filter while navigation collapses or the viewport changes.
