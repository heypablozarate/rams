import { createHash } from "node:crypto";
import { catalogFamilyAliases } from "../src/catalog/catalog-routes.ts";
import {
  constants,
  closeSync,
  existsSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join, posix, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { getUsageGuide } from "../src/catalog/usage-guides.ts";
import { getVariantApi } from "../src/catalog/variant-api.ts";
import { portableSource } from "../src/catalog/portable-source.ts";
import { getPreviewContract } from "../src/catalog/preview-contracts.ts";
import { getSourceInstallItem } from "../src/catalog/installation.ts";
import { buildFoundationManifest } from "../src/lib/foundations.ts";
import { resolveTokens } from "../src/lib/token-resolver.ts";
import motionGuidelines from "../src/baseline/motion-guidelines.json" with { type: "json" };
const motionObligations = {
  contract: "/motion.json",
  guide: "/motion-guide.md",
  policyPath: "guidelines",
  appliesTo: motionGuidelines.scope,
  requiredRuleIds: motionGuidelines.rules.filter(rule=>rule.level==="MUST").map(rule=>rule.id),
  specificationFields: motionGuidelines.specification.requiredFields.map(field=>field.name),
  verification: "Required checks are instructions; no runtime pass is implied by this catalog.",
};
/** RAMS composition policy for discovery consumers; not a DOM/visual validator. */
const primaryActionRule = Object.freeze({
  id: "one-primary-per-active-view",
  schemaVersion: 1,
  maxPrimaryButtons: 1,
  allowsZero: true,
  scope: "active-view",
  perCard: false,
  classification: Object.freeze({
    basis: "visual-primary-action-treatment",
    includeLinksStyledAsButtons: true,
    colorTokenAloneIsNotClassification: true,
    selectedControlsAreNotAutomaticallyPrimaryActions: true,
  }),
  includes: Object.freeze([
    "header",
    "content",
    "footer",
    "sticky-actions",
    "non-modal-overlays",
    "scrollable-content",
  ]),
  responsive: Object.freeze({
    countSimultaneouslyVisibleCopies: true,
    excludeHiddenBreakpointCopies: true,
    sameActionCopiesShareAllowance: false,
  }),
  modal: Object.freeze({
    scope: "topmost-active-modal",
    excludeBackgroundOnlyWhenInert: true,
    recheckBackgroundOnClose: true,
  }),
  states: Object.freeze({
    countDisabledPrimaryAppearance: true,
    countLoadingPrimaryAppearance: true,
    excludeHiddenOrUnmountedPanels: true,
  }),
  catalog: Object.freeze({
    independentScopes: "explicitly-delimited-demonstrations",
    productCardsAreIndependentScopes: false,
    catalogChromeHasOwnScope: true,
  }),
  validation: Object.freeze({
    domCountIsCandidateCheckOnly: true,
    visualHierarchyReviewRequired: true,
    ariaHiddenAloneExcludesVisualCandidate: false,
    outsideViewportByScrollExcludesCandidate: false,
    propNamesAreImplementationSpecific: true,
  }),
  sourceFile: "public/action-hierarchy-guide.md",
  guideUrl: "/action-hierarchy-guide.md",
});

const primaryActionSummary =
  "Each screen or active view allows at most one primary button; it may have none. Count the header, content, and sticky actions together, not by card. The active modal has its own scope when the background is inert; explicitly scoped demonstrations are independent views. Counting DOM candidates does not replace a review of the visual hierarchy.";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const codeExtension = /\.(?:ts|tsx|css)$/;
const identifier = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const originCopy =
  /\b(?:shadcn(?:\/ui)?|upstream|oficial(?:es)?)\b|\bcommits?\s+(?:[a-f0-9]{7,40}|anterior|fijado|original)\b|integración autorizada|sin reinterpretación|escala anterior/i;
const originBrand = /\bARC\b/;
const placeholder =
  /lorem ipsum|(?<![\p{L}\p{N}_])(?:TODO|TBD)(?![\p{L}\p{N}_])/u;
const sha256 = (text) => createHash("sha256").update(text).digest("hex");
const sourceUrl = (file) => "/code/" + file + ".txt";

function prose(text, label) {
  if (typeof text !== "string" || !text.trim())
    throw new Error(`${label}: empty usage text`);
  if (originCopy.test(text) || originBrand.test(text) || placeholder.test(text))
    throw new Error(
      `${label}: history, origin branding or placeholder copy does not belong in usage prose`,
    );
  return text;
}

function validateSourcePath(file) {
  if (
    typeof file !== "string" ||
    !/^src\/[a-zA-Z0-9_./-]+$/.test(file) ||
    posix.normalize(file) !== file ||
    !codeExtension.test(file)
  )
    throw new Error(`Unsupported code source path: ${file}`);
  const segments = file.split("/");
  if (
    segments.some(
      (segment) =>
        !segment ||
        segment.startsWith(".") ||
        /^(?:node_modules|private|secrets?|credentials)(?:\.|$)/i.test(segment),
    ) ||
    file === "src/fonts.css"
  )
    throw new Error(`Private or unsafe code source path: ${file}`);
  return file;
}

function rejectSymlinks(root, relativePath) {
  let current = root;
  const segments = relativePath.split("/");
  for (const [index, segment] of segments.entries()) {
    current = resolve(current, segment);
    let entry;
    try {
      entry = lstatSync(current);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (entry?.isSymbolicLink())
      throw new Error(
        `Symlinks are not allowed in consumption paths: ${relativePath}`,
      );
    if (entry && index < segments.length - 1 && !entry.isDirectory())
      throw new Error(
        `Consumption path parent is not a directory: ${relativePath}`,
      );
  }
}

function readSource(root, file) {
  validateSourcePath(file);
  rejectSymlinks(root, file);
  const location = resolve(root, file);
  const sourceRoot = resolve(root, "src") + sep;
  if (
    !location.startsWith(sourceRoot) ||
    !realpathSync(location).startsWith(sourceRoot) ||
    !lstatSync(location).isFile()
  )
    throw new Error(`Code source escapes src or is not a file: ${file}`);
  const bytes = readFileSync(location);
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error(`Binary or private material in code source: ${file}`);
  }
  const content = bytes.toString("utf8");
  if (
    content.includes("\0") ||
    /-----BEGIN (?:[A-Z ]* )?PRIVATE KEY-----/.test(content)
  )
    throw new Error(`Binary or private material in code source: ${file}`);
  return portableSource(content);
}

function localImports(source, file) {
  if (extname(file) === ".css")
    return [...source.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']/g)].map(
      (match) => match[1],
    );
  const imports = ts.preProcessFile(source, true, true).importedFiles.map(entry => entry.fileName);
  // LibraryProvider documents this optional image adapter in its public usage example.
  if (file === "src/variants/vendor/lib/library-provider.tsx" && source.includes('import Image from "@/variants/image";'))
    imports.push("@/variants/image");
  return imports;
}

function resolveCodeImport(root, from, specifier) {
  const clean = specifier.split(/[?#]/)[0];
  let file;
  if (clean.startsWith("@/")) file = "src/" + clean.slice(2);
  else if (clean.startsWith("."))
    file = posix.normalize(posix.join(posix.dirname(from), clean));
  else return undefined;
  // Images, JSON and installed packages remain outside the source-text export.
  if (extname(file) && !codeExtension.test(file)) return undefined;
  if (!file.startsWith("src/"))
    throw new Error(`Local code import escapes src: ${from} → ${specifier}`);
  const candidates = extname(file)
    ? [file]
    : [
        file + ".ts",
        file + ".tsx",
        file + ".css",
        file + "/index.ts",
        file + "/index.tsx",
      ];
  const found = candidates.find((candidate) =>
    existsSync(resolve(root, candidate)),
  );
  if (!found)
    throw new Error(`Unresolved local code import: ${from} → ${specifier}`);
  return validateSourcePath(found);
}

function fence(code, language = "") {
  const longest = Math.max(
    0,
    ...[...code.matchAll(/`+/g)].map((match) => match[0].length),
  );
  const marker = "`".repeat(Math.max(3, longest + 1));
  return `${marker}${language}\n${code.replace(/\n$/, "")}\n${marker}`;
}

const cell = (value) =>
  String(value ?? "")
    .replaceAll("|", "\\|")
    .replace(/\r?\n/g, "<br>");
const inline = (value) => "`" + cell(value).replaceAll("`", "&#96;") + "`";

function familyMarkdown(family) {
  const sections = [
    `# ${family.name}`,
    family.description,
    "[Foundations](/design-system.json) · [Customization](/foundations-guide.md) · [Motion](/motion-guide.md) · [Motion contract](/motion.json)",
    `[Action hierarchy](${primaryActionRule.guideUrl}): at most one primary button per active view; zero is allowed. The limit does not reset for each card.`,
    "Motion: all variants and their compositions must follow the MUST requirements in [motion.json → guidelines](/motion.json). Before changing an interaction, complete its specification for trigger, states, object, properties, role, geometry, sequence, interruption, reduced motion, focus, repetition, and evidence. Pending checks do not constitute approval.",
  ];
  for (const variant of family.variants) {
    sections.push(
      `<a id="${variant.id}"></a>\n\n## ${variant.label}`,
      "### What the preview demonstrates\n\n" + variant.preview.demonstrates.map(line => "- " + line).join("\n"),
      "### Scope and limits\n\n" + variant.preview.limits.map(line => "- " + line).join("\n"),
      "### How to test it\n\n" + variant.preview.checks.map(line => "- " + line).join("\n"),
      `### Usage\n\n${variant.preview.demonstrates.includes(variant.usage.summary) ? "" : variant.usage.summary + "\n\n"}${fence(variant.usage.example, "tsx")}`,
      "### Guidelines\n\n" +
        variant.usage.guidelines.map((line) => "- " + line).join("\n"),
    );
    if (variant.api.properties.length) {
      const hasDefaults = variant.api.properties.some(
        ([name]) => variant.api.defaults[name.replace(/\?$/, "")] !== undefined,
      );
      const hasDescriptions = variant.api.properties.some((property) =>
        property[2]?.trim(),
      );
      const headers = [
        "Prop",
        "Type",
        ...(hasDefaults ? ["Default"] : []),
        ...(hasDescriptions ? ["Usage"] : []),
      ];
      const rows = variant.api.properties.map(([name, type, description]) => [
        inline(name),
        inline(type),
        ...(hasDefaults
          ? [inline(variant.api.defaults[name.replace(/\?$/, "")] ?? "—")]
          : []),
        ...(hasDescriptions ? [cell(description || "—")] : []),
      ]);
      sections.push(
        "### API\n\nDocumented props; see the code for inherited props.\n\n" +
          [headers, headers.map(() => "---"), ...rows]
            .map((row) => "| " + row.join(" | ") + " |")
            .join("\n"),
      );
    } else
      sections.push(
        "### API\n\nThis composition has no documented props of its own. See the code for its exports and dependencies.",
      );
    sections.push(
      `[Preview](${variant.links.preview}) · [Viewer documentation](${variant.links.documentationView}) · [Full source](${variant.links.code})`,
    );
    if (variant.installation)
      sections.push(`[Installation item](${variant.installation.url})`);
    sections.push(
      "### Files\n\n" +
        variant.sources
          .map((source) => `- [${source.path}](${source.url})`)
          .join("\n"),
    );
  }
  sections.push("[Licenses and attribution](/legal/index.json)");
  return sections.join("\n\n") + "\n";
}

/** Build all artifacts before writing. No filesystem mutation or example execution. */
function buildConsumption(
  componentCatalog,
  version,
  sourceManifest,
) {
  const root = realpathSync(projectRoot);
  if (
    !Array.isArray(componentCatalog) ||
    !componentCatalog.length ||
    typeof version !== "string" ||
    !version.trim()
  )
    throw new Error("A nonempty component catalog and version are required");
  if (!sourceManifest || (sourceManifest.format !== "rams-source-manifest" || sourceManifest.schemaVersion !== 1 || !sourceManifest.items))
    throw new Error("Unsupported RAMS source manifest");
  const sourceTexts = new Map(),
    dependencies = new Map();
  const collect = (file) => {
    validateSourcePath(file);
    if (sourceTexts.has(file)) return;
    const content = readSource(root, file);
    sourceTexts.set(file, content);
    const imports = [
      ...new Set(
        localImports(content, file)
          .map((specifier) => resolveCodeImport(root, file, specifier))
          .filter(Boolean),
      ),
    ].sort();
    dependencies.set(file, imports);
    for (const dependency of imports) collect(dependency);
  };
  const sourceInfo = (file) => ({
    path: file,
    url: sourceUrl(file),
    language:
      extname(file) === ".css"
        ? "css"
        : extname(file) === ".tsx"
          ? "tsx"
          : "ts",
    sha256: sha256(sourceTexts.get(file)),
  });
  const closure = (roots) => {
    const result = new Set();
    const visit = (file) => {
      if (result.has(file)) return;
      result.add(file);
      for (const dependency of dependencies.get(file) || []) visit(dependency);
    };
    for (const file of roots) visit(file);
    return [...result];
  };
  const familyIds = new Set(),
    variantIds = new Set();
  const entries = componentCatalog.map((family) => {
    if (
      !identifier.test(family.id) ||
      familyIds.has(family.id) ||
      !family.variants?.length
    )
      throw new Error(
        `Invalid, duplicate or empty component family: ${family.id}`,
      );
    familyIds.add(family.id);
    return {
      id: family.id,
      name: prose(family.name, family.id + " name"),
      group: prose(family.group, family.id + " group"),
      description: prose(family.description, family.id + " description"),
      variants: family.variants.map((variant) => {
        if (!identifier.test(variant.id) || variantIds.has(variant.id))
          throw new Error(
            `Invalid or duplicate component variant: ${variant.id}`,
          );
        variantIds.add(variant.id);
        const usage = getUsageGuide(variant);
        const preview = getPreviewContract(variant);
        for (const field of ["demonstrates", "limits", "checks"]) {
          if (!Array.isArray(preview[field]) || !preview[field].length)
            throw new Error(`Missing preview ${field}: ${variant.id}`);
          preview[field].forEach(line => prose(line, variant.id + " preview " + field));
        }
        if (
          !usage ||
          !usage.example?.trim() ||
          !Array.isArray(usage.guidelines) ||
          !usage.guidelines.length
        )
          throw new Error(`Missing complete usage guide: ${variant.id}`);
        prose(usage.summary, variant.id + " summary");
        usage.guidelines.forEach((line) =>
          prose(line, variant.id + " guideline"),
        );
        const api = getVariantApi(variant);
        for (const property of api.properties)
          if (property[2]) prose(property[2], variant.id + " API description");
        if (!Array.isArray(variant.codeFiles) || !variant.codeFiles.length)
          throw new Error(`Missing code files: ${variant.id}`);
        for (const file of variant.codeFiles) collect(file);
        const primary = getSourceInstallItem(variant);
        const ids = new Set([primary]);
        if (!sourceManifest.items[primary]) throw new Error(`Missing source installation item: ${variant.id} → ${primary}`);
        for (const match of usage.example.matchAll(/["']\.\/rams\/components\/([a-z0-9-]+)["']/g))
          if (sourceManifest.items[match[1]]) ids.add(match[1]);
        const installation = { format: "rams-source-installation", items: [...ids], manifestUrl: "/rams-source/rams.json", url: "/rams-source/rams.json", repositoryUrl: "https://github.com/heypablozarate/rams", command: "node public/rams-source/tools/install.mjs --target <APP_PATH> --items " + [...ids].join(",") };
        const sources = closure(variant.codeFiles).map(sourceInfo);
        const view = "/#/components/" + family.id + "/" + variant.id;
        return {
          id: variant.id,
          label: prose(variant.label, variant.id + " label"),
          usage,
          preview,
          api: { scope: "documented", ...api },
          links: {
            preview: view,
            documentation: "/components/" + family.id + ".md#" + variant.id,
            documentationView: view + "?tab=documentation",
            code: sourceUrl(variant.codeFiles[0]),
          },
          sources,
          installation,
        };
      }),
    };
  });
  if ([...sourceTexts.keys()].some(file => /^src\/registry\/rams-(?:v2|extensions)\//.test(file))) throw new Error("Archived source entered active delivery");
  // Alias records are navigation/discovery compatibility, never installation aliases.
  // Subset catalogs used by consumers expose only aliases they can resolve fully.
  const familyAliases = Object.fromEntries(Object.entries(catalogFamilyAliases).filter(
    ([, alias]) => entries.some((family) => family.id === alias.canonicalId &&
      alias.variantIds.every((id) => family.variants.some((variant) => variant.id === id))),
  ).map(([id, alias]) => [id, { ...alias,
    documentation: `/components/${id}.md`,
    canonicalDocumentation: `/components/${alias.canonicalId}.md`,
  }]));
  const catalog = {
    format: "rams-components",
    schemaVersion: 2,
    version,
    foundationsUrl: "/design-system.json",
    customizationGuide: "/foundations-guide.md",
    sourceManifestUrl: "/rams-source/rams.json",
    installationGuide: "/#/installation",
    legalUrl: "/legal/index.json",
    compositionRules: { primaryAction: primaryActionRule, motion: motionObligations },
    familyAliases,
    familyCount: entries.length,
    variantCount: variantIds.size,
    entries,
  };
  const files = new Map();
  files.set("components.json", JSON.stringify(catalog, null, 2) + "\n");
  const documents = entries.map((family) => {
    const text = familyMarkdown(family);
    files.set("components/" + family.id + ".md", text);
    return text;
  });
  for (const [legacyId, alias] of Object.entries(familyAliases)) {
    const canonical = entries.find((family) => family.id === alias.canonicalId);
    // Retain full anchored guides at old static URLs, not a client-only redirect.
    files.set(`components/${legacyId}.md`,
      `<!-- Catalog alias: ${legacyId} → ${alias.canonicalId}. Installer item IDs are unchanged. -->\n\n` + familyMarkdown(canonical));
  }
  files.set(
    "llms.txt",
    [
      "# RAMS",
      `React 19 source components. ${entries.length} families and ${variantIds.size} variants.`,
      "## Discover",
      "- [Source-package agent entry](/rams-source/llms.txt): progressive discovery, exact item IDs, guides and explicit project profiles. Start here when installing the forkable Geist package; the site's personal Brand examples are separate.",
      "- [JSON catalog](/components.json): families, variants, usage, guidelines, documented APIs, and links to source and previews.",
      "- [Full documentation](/llms-full.txt): guides for all variants.",
      Object.keys(familyAliases).length ? "- Legacy family names resolve through components.json → familyAliases; installer item IDs remain independent and unchanged." : "",
      "- [Foundations](/design-system.json): roles, pairings, values, and customization paths.",
      "- [Customize foundations](/foundations-guide.md) and [shape](/shape-guide.md).",
      "- [Motion](/motion-guide.md), [contract](/motion.json), and [exceptions](/motion-exceptions.json).",
      `- [Action hierarchy](${primaryActionRule.guideUrl}): at most one primary per active view, not per card.`,
      "- [Installation](/#/installation), [source manifest](/rams-source/rams.json), and [installation prompt](/rams-source/docs/install-prompt.md).",
      "- [Licenses and attribution](/legal/index.json).",
      "## Agent usage",
      "Choose a family and variant. Read its guide and API; do not assume alternatives share props. Source links provide complete files with portable imports.",
      "For source installation, read the package AGENTS.md, rams.json and attached guides. The viewer foundations describe the catalog; the source package starts neutral and exposes semantic CSS variables for application customization.",
      primaryActionSummary,
      "Motion is required in every consumer: read motion.json → guidelines, complete specification.requiredFields, and verify every applicable MUST rule. Do not choose isolated timings or infer visual approval from static contracts.",
      "The neutral source package includes verified Geist fonts and their OFL. Preserve all notices; example-local actions do not provide external services or certify comprehensive accessibility conformance.",
    ].join("\n\n") + "\n",
  );
  files.set(
    "llms-full.txt",
    [
      "# RAMS · Full documentation",
      "[JSON catalog](/components.json) · [Foundations](/design-system.json) · [Licenses](/legal/index.json)",
      "Each variant documents its own API. Look up foundation values in the linked contract.",
      primaryActionSummary,
      `[Full composition rule](${primaryActionRule.guideUrl})`,
      ...documents,
    ].join("\n\n") + "\n",
  );
  for (const file of [...sourceTexts.keys()].sort())
    files.set("code/" + file + ".txt", sourceTexts.get(file));
  return { catalog, files, sourceCount: sourceTexts.size };
}

function writeAssets(files) {
  const publicRoot = resolve(projectRoot, "public");
  // Preflight every destination before the first write; never follow output links.
  for (const file of files.keys()) {
    if (
      posix.normalize(file) !== file ||
      resolve(publicRoot, file).startsWith(publicRoot + sep) === false
    )
      throw new Error(`Unsafe consumption output: ${file}`);
    rejectSymlinks(projectRoot, "public/" + file);
    const destination = resolve(publicRoot, file);
    if (existsSync(destination) && !lstatSync(destination).isFile())
      throw new Error(`Consumption output is not a regular file: ${file}`);
  }
  for (const [file, text] of files) {
    const destination = resolve(publicRoot, file);
    mkdirSync(dirname(destination), { recursive: true });
    const descriptor = openSync(
      destination,
      constants.O_WRONLY |
        constants.O_CREAT |
        constants.O_TRUNC |
        constants.O_NOFOLLOW,
      0o644,
    );
    try {
      writeFileSync(descriptor, text, "utf8");
    } finally {
      closeSync(descriptor);
    }
  }
}

function renderViewerCatalog(catalog, structured, version) {
  const guides = new Map(structured.entries.flatMap(family => family.variants.map(variant => [variant.id, variant])));
  return JSON.stringify({
    version,
    format: "rams-viewer-catalog",
    schemaVersion: 1,
    familyAliases: structured.familyAliases,
    consumptionUrl: "/components.json",
    sourceManifestUrl: "/rams-source/rams.json",
    foundationsUrl: "/design-system.json",
    entries: catalog.map(family => ({
      ...family,
      variants: family.variants.map(variant => {
        const guide = guides.get(variant.id);
        if (!guide) throw Error(`Missing guide ${variant.id}`);
        return { ...variant, props: guide.api.properties, usage: guide.usage, api: guide.api, links: guide.links };
      }),
    })),
    pending: [],
    variantCount: structured.variantCount,
  }, null, 2) + "\n";
}

const json = (file) => JSON.parse(readFileSync(join(projectRoot, file), "utf8"));
const sourceManifest = json("public/rams-source/rams.json");
const variants = json("src/catalog/catalog-data.json");
const { version } = json("package.json");
const authoredTokens = json("tokens.json");
const result = buildConsumption(variants, version, sourceManifest);
result.files.set("catalog.json", renderViewerCatalog(variants, result.catalog, version));
result.files.set("tokens.json", JSON.stringify(resolveTokens(authoredTokens), null, 2) + "\n");
result.files.set("design-system.json", JSON.stringify(buildFoundationManifest(authoredTokens), null, 2) + "\n");
writeAssets(result.files);
console.log(`Prepared ${result.catalog.familyCount} families, ${result.catalog.variantCount} variants, ${result.sourceCount} source listings.`);
