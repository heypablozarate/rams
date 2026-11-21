import aliases from "./catalog-aliases.json" with { type: "json" };

export type CatalogFamilyAlias = {
  canonicalId: string;
  defaultVariantId: string;
  variantIds: string[];
};

/** Catalog navigation aliases never rename component exports or installer items. */
export const catalogFamilyAliases = aliases as Record<string, CatalogFamilyAlias>;

/** Preserve a legacy root's specimen, explicit variant, and complete query string. */
export function canonicalComponentRoute(hash: string): string | null {
  const path = hash.startsWith("#") ? hash.slice(1) : hash;
  const match = path.match(/^\/components\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?\/?(\?.*)?$/);
  if (!match || !Object.hasOwn(catalogFamilyAliases, match[1])) return null;
  const alias = catalogFamilyAliases[match[1]];
  return `/components/${alias.canonicalId}/${match[2] || alias.defaultVariantId}${match[3] || ""}`;
}
