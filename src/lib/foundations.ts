import { buildShapeManifest } from "./shape.ts";
import { buildTypographyManifest } from "./typography.ts";
import { resolveTokens } from "./token-resolver.ts";
import { groupColorRoles } from "./color-groups.ts";
import { foundationRoles } from "../baseline/foundation-roles.ts";

export type ThemeMode = "light" | "dark";
type Colors = Record<string, string>;
type FoundationTokens = {
  themes: Record<ThemeMode, Colors>;
  brandCustomization: {
    palette: Record<ThemeMode, Colors>;
    overrides: Record<ThemeMode, Colors>;
  };
  supportingCustomization: { overrides: Record<ThemeMode, Colors> };
  foundationOverrides?: Partial<Record<ThemeMode, Colors>>;
  componentExtensions?: Record<string, unknown>;
  shapeCustomization?: unknown;
  typography?: unknown;
  density?: { scales: Record<string, Record<string, string>> };
};

/** All consumers share the same precedence; public semantic identifiers remain stable. */
export function effectiveColors(
  tokens: FoundationTokens,
  mode: ThemeMode,
): Colors {
  const colors = {
    ...tokens.themes[mode],
    ...tokens.supportingCustomization.overrides[mode],
    ...tokens.brandCustomization.overrides[mode],
    ...tokens.foundationOverrides?.[mode],
  };
  delete colors.radius;
  return colors;
}

/** Fail before generation on unknown roles, missing pairs, invalid values or broken CSS aliases. */
export function validateFoundations(
  source: FoundationTokens & { colorPrimitives?: Record<string, unknown> },
) {
  const tokens = resolveTokens(source);
  buildShapeManifest(tokens.shapeCustomization);
  buildTypographyManifest(tokens.typography, tokens.density?.scales);
  const ids = new Set<string>(foundationRoles.map((role) => role.id));
  if (ids.size !== foundationRoles.length)
    throw new Error("Duplicate foundation role");
  for (const role of foundationRoles) {
    if (!role.name.trim() || !role.description.trim())
      throw new Error(`Missing foundation documentation: ${role.id}`);
    if (
      role.pairWith &&
      foundationRoles.find((pair) => pair.id === role.pairWith)?.pairWith !==
        role.id
    )
      throw new Error(`Invalid foundation pair: ${role.id}`);
  }
  for (const mode of Object.keys(tokens.foundationOverrides || {})) {
    if (mode !== "light" && mode !== "dark")
      throw new Error(`Unknown foundation theme: ${mode}`);
  }
  for (const mode of ["light", "dark"] as const) {
    for (const id of Object.keys(tokens.foundationOverrides?.[mode] || {})) {
      if (id === "brand" || !ids.has(id))
        throw new Error(`Unknown foundation override: ${mode}.${id}`);
    }
    const colors = effectiveColors(tokens, mode);
    if (
      Object.keys(colors).length !== ids.size - 1 ||
      Object.keys(colors).some((id) => !ids.has(id))
    )
      throw new Error(`Foundation role coverage differs: ${mode}`);
    for (const [id, value] of Object.entries(colors)) {
      if (
        typeof value !== "string" ||
        !/^(oklch\([^;{}]+\)|var\(--[a-z0-9-]+\))$/.test(value)
      )
        throw new Error(`Invalid foundation color: ${mode}.${id}`);
    }
    const groups = [
      ...groupColorRoles(colors),
      ...groupColorRoles({
        brand: tokens.brandCustomization.palette[mode].brandAccent,
      }),
    ];
    for (const group of groups) {
      const [lightness, chroma, _hue, alpha] = group.key.split("|").map(Number);
      if (
        lightness < 0 ||
        lightness > 1 ||
        chroma < 0 ||
        alpha < 0 ||
        alpha > 1
      )
        throw new Error(
          `Out-of-range foundation color: ${mode}.${group.roles[0]}`,
        );
    }
  }
  return tokens;
}

function atPath(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => {
    if (!value || typeof value !== "object" || !Object.hasOwn(value, key))
      throw new Error(`Unknown foundation source: ${path}`);
    return (value as Record<string, unknown>)[key];
  }, source);
}

/** A generated discovery contract for people and agents; not a DTCG interchange document. */
export function buildFoundationManifest(
  source: FoundationTokens & { colorPrimitives?: Record<string, unknown> },
) {
  const tokens = validateFoundations(source);
  return {
    schemaVersion: 1,
    format: "rams-foundations",
    sourceFile: "tokens.json",
    customizationGuide: "/foundations-guide.md",
    precedence: [
      "themes",
      "supportingCustomization.overrides",
      "brandCustomization.overrides",
      "foundationOverrides",
    ],
    roles: foundationRoles.map((role) => ({
      ...role,
      type: "color",
      cssVariable: role.id === "brand" ? "--rams-brand-accent" : `--${role.id}`,
      themes: Object.fromEntries(
        (["light", "dark"] as const).map((mode) => {
          const colors = effectiveColors(tokens, mode);
          const resolvedByRole = new Map(
            groupColorRoles(colors).flatMap((group) =>
              group.roles.map((id) => [id, group.value] as const),
            ),
          );
          const layer = [
            "foundationOverrides",
            "brandCustomization.overrides",
            "supportingCustomization.overrides",
            "themes",
          ].find((layer) => {
            const section = layer
              .split(".")
              .reduce<unknown>(
                (value, key) =>
                  value && typeof value === "object"
                    ? (value as Record<string, unknown>)[key]
                    : undefined,
                source,
              );
            return (
              section &&
              typeof section === "object" &&
              Object.hasOwn(section, mode) &&
              Object.hasOwn((section as Record<string, object>)[mode], role.id)
            );
          });
          const sourcePath =
            role.id === "brand"
              ? `brandCustomization.palette.${mode}.brandAccent`
              : `${layer}.${mode}.${role.id}`;
          const authoredValue = atPath(source, sourcePath) as string;
          const reference =
            /^\{(colorPrimitives\.[A-Za-z0-9_.-]+)\}$/.exec(
              authoredValue,
            )?.[1] || null;
          return [
            mode,
            {
              sourcePath,
              editPath:
                role.id === "brand"
                  ? reference || sourcePath
                  : `foundationOverrides.${mode}.${role.id}`,
              reference,
              authoredValue,
              value:
                role.id === "brand"
                  ? tokens.brandCustomization.palette[mode].brandAccent
                  : colors[role.id],
              resolvedValue:
                role.id === "brand"
                  ? tokens.brandCustomization.palette[mode].brandAccent
                  : resolvedByRole.get(role.id),
            },
          ];
        }),
      ),
    })),
    foundations: {
      colors: {
        editPath: "foundationOverrides",
        description:
          "Semantic color roles for each theme; customize them through this layer.",
      },
      typographyAndSpacing: {
        editPath: "density.scales",
        description:
          "Spacing and geometry scales by density. Configure fluid typography in typography.fluid.scales. Preserve the browser root size.",
      },
      typographyRoles: {
        editPath: "typography.roles",
        description:
          "Shared roles for reading text, controls, helper text, titles, and code. Fluid sizes resolve by density and width, with limits in rem.",
      },
      defaultDensity: {
        editPath: "density.default",
        description:
          "Initial scale; allowed IDs are compact/default/wide. The preference reader must follow changes to the initial value.",
      },
      fontFamilies: {
        files: ["src/fonts.css", "public/rams-source/fonts/OFL.txt"],
        description:
          "The viewer uses the bundled Geist families under the SIL Open Font License.",
      },
      radius: {
        editPath: "shapeCustomization",
        guide: "/shape-guide.md",
        description:
          "Shape roles shared across components, variants, and documentation.",
      },
      layoutAndMotion: {
        motionEditPath: "componentExtensions.details.motionTS",
        motionFiles: [
          "src/variants/motion-tokens.ts",
          "src/variants/foundations.css",
        ],
        description:
          "Motion shares durations, curves, and springs. Verify each composition’s layout and transitions per component.",
      },
    },
    motion: { schema: "rams-motion", schemaVersion: 1, sourcePath: "componentExtensions.details.motionTS", contract: "/motion.json", guide: "/motion-guide.md", page: "/#/motion", css: "src/baseline/motion.css", runtime: "src/variants/motion-policy.ts" },
    shape: buildShapeManifest(tokens.shapeCustomization),
    typography: buildTypographyManifest(
      tokens.typography,
      tokens.density?.scales,
    ),
    extensions: tokens.componentExtensions
      ? {
          components: {
            sourcePath: "componentExtensions",
            namespace: "--rams-detail-",
            guide: "/component-integration.md",
            description: "Shared RAMS roles and additional component details.",
          },
        }
      : {},
    constraints: [
      "Brand Color, Primary, Accent, and Selection are independent roles, even when they share primitives.",
      "Brand derivatives are explicit decisions; changing Brand Color does not recalculate them.",
      "After customization, verify color pairs, hover, focus, both themes, and real components.",
      "The preset’s contrast results are not inherited automatically when its foundations change.",
    ],
  };
}
