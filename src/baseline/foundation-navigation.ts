/** The documentation menu and legacy URLs share the same section destinations. */
export const foundationNavigation = [
  { id: "color", label: "Color", href: "/foundations?section=color" },
  { id: "typography", label: "Typography", href: "/typography" },
  { id: "spacing", label: "Spacing and sizing", href: "/foundations?section=spacing" },
  { id: "layout", label: "Grid and responsive layout", href: "/foundations?section=layout" },
  { id: "shape", label: "Shape and radii", href: "/foundations?section=shape" },
  { id: "elevation", label: "Elevation", href: "/foundations?section=elevation" },
  { id: "motion", label: "Motion", href: "/motion" },
  { id: "accessibility", label: "Accessibility integration checks", href: "/foundations?section=accessibility" },
  { id: "brand", label: "Brand", href: "/brand" },
] as const;

export type FoundationPageSection = Exclude<
  (typeof foundationNavigation)[number]["id"],
  "typography" | "motion" | "brand"
>;

/** Preserve old entry points while avoiding a second Typography or Motion page. */
export function canonicalFoundationRoute(hash: string): string | null {
  const [path, query = ""] = hash.replace(/^#/, "").split("?");
  if (path === "/validation") return "/foundations?section=accessibility";
  if (path !== "/foundations") return null;
  const id = new URLSearchParams(query).get("section") || "color";
  return (foundationNavigation.find((section) => section.id === id) || foundationNavigation[0]).href;
}

export function foundationPageSection(path: string): FoundationPageSection {
  const item = foundationNavigation.find((section) => section.href === path);
  return item && item.id !== "typography" && item.id !== "motion" && item.id !== "brand"
    ? item.id
    : "color";
}
