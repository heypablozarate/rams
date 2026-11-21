/** Canonical RAMS imports for complete, copyable source; original files remain intact. */
export function portableSource(source: string): string {
  return source
    .replaceAll("@/registry/new-york-v4", "@/registry/rams-v2")
    .replaceAll('"next/link"', '"@/hosting/link"')
    .replaceAll("'next/link'", "'@/hosting/link'")
    .replaceAll('"next/image"', '"@/hosting/image"')
    .replaceAll("'next/image'", "'@/hosting/image'");
}
