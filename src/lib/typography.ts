// Version-one authoring documents predating explicit breakpoints used these values.
const legacyInputBreakpointRem = 48;
const legacyOpticalBreakpointRem = 64;

export const typographyRoleDescriptions = {
  control: "Input text, menu options, and table labels. Actions share this size with the Action style.",
  body: "Paragraphs and reading content in an interface.",
  caption: "Help text, metadata, notes, and data labels.",
  title: "Card and content region titles.",
  heading: "Primary headings.",
  display: "Featured figures or headlines.",
  code: "Code and monospace content.",
} as const;
export type TypographyRole = keyof typeof typographyRoleDescriptions;
type Family = "interface" | "editorial" | "code";
export type TypographyConfig = {
  version: number;
  families: Record<Family, string>;
  roles: Record<
    TypographyRole,
    {
      size: string;
      lineHeight: number;
      family: Family;
      fixedReason?: string;
      weight?: number;
      tracking?: { small: number; large: number };
    }
  >;
  mobileInputMinimum: string;
  mobileInputBreakpointRem?: number;
  opticalBreakpointRem?: number;
  styles?: {
    action: { weight: number; primaryWeight?: number; lineHeight: number; tracking: number };
  };
  numerals?: { dataFamily: Family; variant: "normal" | "lining-nums tabular-nums" };
  fluid?: {
    viewport: { minRem: number; maxRem: number };
    scales: Record<string, Record<string, { minRem: number; maxRem: number }>>;
  };
};

const scaleKeys = [
  "text-xs",
  "text-sm",
  "text-base",
  "text-lg",
  "text-xl",
  "text-2xl",
  "text-3xl",
  "text-4xl",
  "text-5xl",
];
const number = (n: number) => String(Number(n.toFixed(7)));
export function fluidTypeSize(
  min: number,
  max: number,
  viewport: { minRem: number; maxRem: number },
) {
  const slope = (max - min) / (viewport.maxRem - viewport.minRem);
  return `clamp(${number(min)}rem, calc(${number(min - slope * viewport.minRem)}rem + ${number(slope * 100)}vw), ${number(max)}rem)`;
}

export function buildTypographyManifest(
  input?: unknown,
  scales: Record<string, Record<string, string>> = {},
) {
  if (input === undefined) return null;
  const config = input as TypographyConfig;
  if (!config || config.version !== 1 || !config.roles || !config.families)
    throw new Error("Invalid typography contract");
  const ids = Object.keys(typographyRoleDescriptions) as TypographyRole[];
  const families = ["interface", "editorial", "code"] as const;
  if (config.styles && (!Number.isFinite(config.styles.action?.weight) || config.styles.action.weight < 300 || config.styles.action.weight > 800 || !Number.isFinite(config.styles.action.lineHeight) || config.styles.action.lineHeight < 1 || config.styles.action.lineHeight > 2 || !Number.isFinite(config.styles.action.tracking) || Math.abs(config.styles.action.tracking) > .06))
    throw new Error("Invalid typography action style");
  if (config.styles?.action.primaryWeight !== undefined && (!Number.isFinite(config.styles.action.primaryWeight) || config.styles.action.primaryWeight < 300 || config.styles.action.primaryWeight > 800))
    throw new Error("Invalid typography primary action weight");
  if (config.numerals && (!families.includes(config.numerals.dataFamily) || !["normal", "lining-nums tabular-nums"].includes(config.numerals.variant)))
    throw new Error("Invalid typography numeral style");
  if (
    Object.keys(config.roles).length !== ids.length ||
    Object.keys(config.roles).some((id) => !ids.includes(id as TypographyRole))
  )
    throw new Error("Unknown or missing typography role");
  for (const id of families)
    if (!/^var\(--font-(sans|serif|mono)\)$/.test(config.families[id]))
      throw new Error(`Invalid typography family: ${id}`);
  if (
    !/^(?:\d+(?:\.\d+)?|\.\d+)rem$/.test(config.mobileInputMinimum) ||
    parseFloat(config.mobileInputMinimum) < 1
  )
    throw new Error("Mobile text entry minimum must be at least 1rem");
  const inputBreakpoint = config.mobileInputBreakpointRem ?? legacyInputBreakpointRem;
  if (!Number.isFinite(inputBreakpoint) || inputBreakpoint <= 0)
    throw new Error("Invalid mobile typography breakpoint");
  if (config.fluid) {
    const { viewport, scales: fluidScales } = config.fluid;
    if (
      !viewport ||
      !Number.isFinite(viewport.minRem) ||
      !Number.isFinite(viewport.maxRem) ||
      viewport.minRem <= 0 ||
      viewport.maxRem <= viewport.minRem
    )
      throw new Error("Invalid typography fluid viewport");
    for (const mode of ["compact", "default", "wide"])
      for (const key of scaleKeys) {
        const range = fluidScales?.[mode]?.[key];
        if (
          !range ||
          !Number.isFinite(range.minRem) ||
          !Number.isFinite(range.maxRem) ||
          range.minRem <= 0 ||
          range.maxRem <= range.minRem
        )
          throw new Error(`Invalid typography fluid range: ${mode}.${key}`);
      }
  }
  if (
    config.opticalBreakpointRem !== undefined &&
    (!Number.isFinite(config.opticalBreakpointRem) ||
      config.opticalBreakpointRem <= 0)
  )
    throw new Error("Invalid typography optical breakpoint");
  const roles = ids.map((id) => {
    const role = config.roles[id];
    const reference =
      /^var\(--(text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl))\)$/.exec(role.size);
    if (
      (!reference && !/^(?:\d+(?:\.\d+)?|\.\d+)rem$/.test(role.size)) ||
      (!reference && parseFloat(role.size) <= 0) ||
      !Number.isFinite(role.lineHeight) ||
      role.lineHeight < 1 ||
      role.lineHeight > 2.5 ||
      !families.includes(role.family)
    )
      throw new Error(`Invalid typography role: ${id}`);
    if (config.fluid && !reference && !role.fixedReason?.trim())
      throw new Error(`Fixed typography role requires a reason: ${id}`);
    if (
      role.weight !== undefined &&
      (!Number.isFinite(role.weight) || role.weight < 300 || role.weight > 800)
    )
      throw new Error(`Invalid typography weight: ${id}`);
    if (
      role.tracking &&
      (!Number.isFinite(role.tracking.small) ||
        !Number.isFinite(role.tracking.large) ||
        role.tracking.small > 0 ||
        role.tracking.large > 0 ||
        role.tracking.small < -0.06 ||
        role.tracking.large < -0.06)
    )
      throw new Error(`Invalid typography tracking: ${id}`);
    const densityRanges =
      reference && config.fluid
        ? Object.fromEntries(
            Object.entries(config.fluid.scales).map(([mode, scale]) => [
              mode,
              scale[reference[1]],
            ]),
          )
        : undefined;
    return {
      id,
      description: typographyRoleDescriptions[id],
      cssVariable: `--type-${id}-size`,
      ...role,
      editPath: `typography.roles.${id}`,
      densityRanges,
      densitySizes: Object.fromEntries(
        Object.entries(config.fluid?.scales ?? scales).map(([mode]) => {
          const range = densityRanges?.[mode];
          const size =
            range && config.fluid
              ? fluidTypeSize(range.minRem, range.maxRem, config.fluid.viewport)
              : reference
                ? scales[mode]?.[reference[1]]
                : role.size;
          if (!size) throw new Error(`Missing typography size: ${mode}.${id}`);
          return [mode, size];
        }),
      ),
    };
  });
  return {
    schemaVersion: 1,
    source: "tokens.json",
    editPath: "typography",
    roles,
    styles: config.styles,
    numerals: config.numerals,
    fluid: config.fluid,
    opticalBreakpointRem: config.opticalBreakpointRem,
    families: config.families,
    input: {
      cssVariable: "--type-input-size",
      role: "control",
      mobileMinimum: config.mobileInputMinimum,
      breakpoint: `${inputBreakpoint}rem`,
    },
  };
}

export function typographyCSS(config: TypographyConfig) {
  const manifest = buildTypographyManifest(config)!;
  const values = [
    ...Object.entries(config.families).map(
      ([id, value]) => `  --type-family-${id}: ${value};`,
    ),
    ...manifest.roles.flatMap(
      ({ id, size, lineHeight, family, weight, tracking }) => [
        `  --type-${id}-size: ${size};`,
        `  --type-${id}-leading: ${lineHeight};`,
        `  --type-${id}-family: var(--type-family-${family});`,
        `  --type-${id}-weight: ${weight ?? 400};`,
        `  --type-${id}-tracking: ${tracking?.small ?? 0}em;`,
      ],
    ),
    "  --type-input-size: var(--type-control-size);",
    `  --type-action-family: var(--type-family-interface);`,
    `  --type-action-size: var(--type-control-size);`,
    `  --type-action-weight: ${config.styles?.action.weight ?? 500};`,
    `  --type-primary-action-weight: ${config.styles?.action.primaryWeight ?? config.styles?.action.weight ?? 500};`,
    `  --type-action-leading: ${config.styles?.action.lineHeight ?? 1.4};`,
    `  --type-action-tracking: ${config.styles?.action.tracking ?? 0}em;`,
    `  --type-data-family: var(--type-family-${config.numerals?.dataFamily ?? "interface"});`,
    `  --type-data-variant: ${config.numerals?.variant ?? "normal"};`,
  ];
  const slots = (names: string[]) =>
    `:where(${names.map((name) => `[data-slot="${name}"]`).join(", ")})`;
  const controls = [
    "button",
    "input-otp-slot",
    "accordion-trigger",
    "label",
    "field-label",
    "toggle",
    "tabs-trigger",
    "select-trigger",
    "select-item",
    "table-cell",
    "table-head",
    "command-item",
    "navigation-menu-trigger",
    "navigation-menu-link",
    "menubar-trigger",
    ...["dropdown-menu", "context-menu", "menubar"].flatMap((name) =>
      ["item", "checkbox-item", "radio-item", "sub-trigger"].map(
        (part) => `${name}-${part}`,
      ),
    ),
  ];
  const inputs = [
    "input",
    "input-group-control",
    "textarea",
    "native-select",
    "command-input",
  ];
  const fluidCSS = config.fluid
    ? Object.entries(config.fluid.scales)
        .map(([mode, scale]) => {
          const selector =
            mode === "default"
              ? ":root:not([data-density]), :root[data-density=default], :root[data-density=comfortable]"
              : `:root[data-density=${mode}]`;
          return `${selector} {\n${Object.entries(scale)
            .map(
              ([key, range]) =>
                `  --${key}: ${fluidTypeSize(range.minRem, range.maxRem, config.fluid!.viewport)};`,
            )
            .join("\n")}\n}\n`;
        })
        .join("")
    : "";
  const opticalCSS = `@media (min-width:${config.opticalBreakpointRem ?? legacyOpticalBreakpointRem}rem) { :root { ${manifest.roles
    .filter((r) => r.tracking)
    .map((r) => `--type-${r.id}-tracking:${r.tracking!.large}em;`)
    .join(" ")} } }\n`;
  return (
    fluidCSS +
    `/* Generated semantic typography. Fluid ranges own sizes; density selects a range; roles own usage. */\n:root {\n${values.join("\n")}\n}\n` +
    opticalCSS +
    `body { font-size:var(--type-body-size); font-family:var(--type-body-family); line-height:var(--type-body-leading); }\n` +
    `.rams-interface-italic, [data-rams-font="interface"] :is(em,i):not(code *,pre *) { font-family:var(--type-family-interface); font-style:var(--type-interface-italic-style,italic); font-variation-settings:var(--type-interface-italic-settings,normal); font-synthesis:none; }\n` +
    `${slots(controls)} { font-size:var(--type-control-size); font-family:var(--type-control-family); }\n` +
    `${slots(inputs)} { font-size:var(--type-input-size); font-family:var(--type-control-family); line-height:var(--type-control-leading); }\n` +
    `${slots(["card-title", "alert-title", "dialog-title", "sheet-title", "drawer-title", "alert-dialog-title"])} { font-size:var(--type-title-size); font-family:var(--type-title-family); line-height:var(--type-title-leading); font-weight:var(--type-title-weight); letter-spacing:var(--type-title-tracking); }\n` +
    `${slots(["card-description", "dialog-description", "sheet-description", "drawer-description", "alert-dialog-description", "alert-description"])} { font-size:var(--type-body-size); line-height:var(--type-body-leading); }\n` +
    `:where([data-slot="accordion-content"] > div) { font-size:var(--type-body-size); line-height:var(--type-body-leading); }\n` +
    `:where([data-slot="checkbox"] ~ div > p) { font-size:var(--type-caption-size); line-height:var(--type-caption-leading); }\n` +
    `${slots(["field-description", "field-error", "tooltip-content", "table-caption"])} { font-size:var(--type-caption-size); line-height:var(--type-caption-leading); }\n` +
    `${slots(["dropdown-menu-content", "context-menu-content", "menubar-content", "select-content", "popover-content"])} { max-width:calc(100vw - var(--rams-detail-overlay-viewport-gutter, var(--rams-detail-space-6))); }\n` +
    `@media (width < ${manifest.input.breakpoint}) { :root { --type-input-size:max(${config.mobileInputMinimum}, var(--type-control-size)); } }\n`
  );
}
