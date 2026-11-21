# Responsive hooks

Use CSS for layout whenever it can express the relationship. Use `useMediaQuery(query, serverMatches = false)` when rendering or behavior must change with a native browser media query. It subscribes to changes and removes its exact listener when the query changes or the component unmounts. A browser without matchMedia returns false.

The server snapshot defaults to false to keep initial hydration deterministic. Supply a deliberate serverMatches value when the application has that information; the client then reconciles with the real query. A server fallback is not device detection.

`useCompactSurface()` selects the shared compact presentation for the next open in responsive Breadcrumb, Drawer and Combobox examples. Keep the presentation selected at open time while the surface remains open. The generated `responsive-surface-query.ts` comes from the `responsiveSurfaceQuery` token.

`useIsMobile(serverMatches = false)` uses the generated `mobile-viewport-query.ts` from the `mobileViewportQuery` token. The default matches viewport widths up to and including 767 CSS px. Keep CSS breakpoints and behavior aligned. Verify native zoom and physical devices separately from viewport resizing and root text changes.
