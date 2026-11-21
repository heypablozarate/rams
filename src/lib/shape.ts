/** Shape is independent of theme/density. CSS and Motion consume this same contract. */
export const shapeRoleDescriptions = {
  control: "Buttons, fields, selectors, and tooltips.",
  panel: "Cards and contextual panels.",
  surface: "Dialogs and expanded surfaces.",
  "select-panel": "Selector option list; contains its options.",
  "select-item": "Option within the selector list.",
  "menu-item": "Inner row and highlight in a menu.",
  "tab-item": "Inner tab, concentric with its container.",
  indicator: "Small indicators, such as a checkbox mark.",
  inset: "Small details and inset surfaces.",
  pill: "Pills; circular shapes retain their own geometry.",
} as const;
export type ShapeRole = keyof typeof shapeRoleDescriptions;
export type ShapeConfig = {
  version: number;
  utilities: Record<string, { role: ShapeRole; offset?: string }>;
  primitives: Record<string, string>;
  insets: Record<string, string>;
  roles: Record<
    ShapeRole,
    string | { from: ShapeRole; offset?: string; inset?: string[] }
  >;
};
const ids = Object.keys(shapeRoleDescriptions) as ShapeRole[];
const length = /^(-?(?:\d+(?:\.\d+)?|\.\d+))(rem|px)$/;

export const shapeAdapters: { slots: string[]; role: ShapeRole }[] = [
  { slots: ["dialog-content", "alert-dialog-content"], role: "surface" },
  {
    slots: [
      "popover-content",
      "hover-card-content",
      "dropdown-menu-content",
      "dropdown-menu-sub-content",
      "context-menu-content",
      "context-menu-sub-content",
      "menubar-content",
      "menubar-sub-content",
      "combobox-content",
      "calendar",
    ],
    role: "panel",
  },
  { slots: ["select-content"], role: "select-panel" },
  { slots: ["select-item"], role: "select-item" },
  {
    slots: [
      "dropdown-menu-item",
      "dropdown-menu-sub-trigger",
      "dropdown-menu-checkbox-item",
      "dropdown-menu-radio-item",
      "context-menu-item",
      "context-menu-sub-trigger",
      "context-menu-checkbox-item",
      "context-menu-radio-item",
      "menubar-item",
      "menubar-sub-trigger",
      "menubar-checkbox-item",
      "menubar-radio-item",
    ],
    role: "menu-item",
  },
  {
    slots: [
      "command-item",
      "combobox-item",
      "navigation-menu-trigger",
      "navigation-menu-link",
    ],
    role: "control",
  },
  { slots: ["checkbox"], role: "indicator" },
];

export function buildShapeManifest(input?: unknown) {
  if (input === undefined) return null;
  if (!input || typeof input !== "object")
    throw new Error("Invalid shape contract");
  const config = input as ShapeConfig;
  if (
    !config.primitives ||
    !config.roles ||
    !config.insets ||
    typeof config.primitives !== "object" ||
    typeof config.roles !== "object" ||
    typeof config.insets !== "object" ||
    Array.isArray(config.primitives) ||
    Array.isArray(config.roles) ||
    Array.isArray(config.insets)
  )
    throw new Error("Missing shape primitives, insets or roles");
  if (config.version !== 1) throw new Error("Unknown shape contract version");
  for (const [id, value] of Object.entries(config.primitives)) {
    if (
      !/^[a-z][a-z0-9-]*$/.test(id) ||
      typeof value !== "string" ||
      !length.test(value) ||
      !Number.isFinite(parseFloat(value)) ||
      parseFloat(value) < 0
    )
      throw new Error(`Invalid shape primitive: ${id}`);
  }
  if (
    Object.keys(config.roles).length !== ids.length ||
    Object.keys(config.roles).some((id) => !ids.includes(id as ShapeRole))
  )
    throw new Error("Unknown or missing shape role");
  for (const [id, value] of Object.entries(config.insets || {})) {
    if (
      !/^[a-z][a-z0-9-]*$/.test(id) ||
      typeof value !== "string" ||
      !length.test(value) ||
      !Number.isFinite(parseFloat(value)) ||
      parseFloat(value) < 0
    )
      throw new Error(`Invalid shape inset: ${id}`);
  }
  const utilityNames = ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl"];
  if (
    !config.utilities ||
    typeof config.utilities !== "object" ||
    Array.isArray(config.utilities) ||
    Object.keys(config.utilities).length !== utilityNames.length ||
    utilityNames.some((name) => !Object.hasOwn(config.utilities, name))
  )
    throw new Error("Invalid shape utilities");
  for (const [name, utility] of Object.entries(config.utilities)) {
    if (
      !utility ||
      typeof utility !== "object" ||
      Array.isArray(utility) ||
      Object.keys(utility).some((key) => key !== "role" && key !== "offset") ||
      !ids.includes(utility.role) ||
      (utility.offset !== undefined &&
        (typeof utility.offset !== "string" ||
          !length.test(utility.offset) ||
          !Number.isFinite(parseFloat(utility.offset) * 16) ||
          parseFloat(utility.offset) < 0))
    )
      throw new Error(`Invalid shape utility: ${name}`);
  }
  const term = (value: string) => {
    const match = length.exec(value);
    if (!match) throw new Error(`Invalid shape length: ${value}`);
    return {
      rem: match[2] === "rem" ? Number(match[1]) : 0,
      px: match[2] === "px" ? Number(match[1]) : 0,
    };
  };
  const serialize = ({ rem, px }: { rem: number; px: number }) => {
    if (!rem) return `${Math.max(0, px)}px`;
    if (!px) return `${Math.max(0, Number(rem.toFixed(6)))}rem`;
    return `max(0px, calc(${Number(rem.toFixed(6))}rem ${px < 0 ? "-" : "+"} ${Math.abs(px)}px))`;
  };
  type Resolved = {
    rem: number;
    px: number;
    linear: boolean;
    value: string;
    at16: number;
  };
  const resolve = (id: ShapeRole, trail: ShapeRole[] = []): Resolved => {
    if (trail.includes(id))
      throw new Error(`Cyclic shape role: ${[...trail, id].join(" -> ")}`);
    const authored = config.roles[id];
    if (typeof authored === "string") {
      if (!(authored in config.primitives))
        throw new Error(`Unknown shape primitive: ${id}.${authored}`);
      const amount = term(config.primitives[authored]);
      return {
        ...amount,
        linear: true,
        value: serialize(amount),
        at16: amount.rem * 16 + amount.px,
      };
    }
    if (!authored || !ids.includes(authored.from))
      throw new Error(`Unknown shape reference: ${id}`);
    const base = resolve(authored.from, [...trail, id]);
    if (authored.inset && authored.offset)
      throw new Error(`Ambiguous shape inset: ${id}`);
    let delta = { rem: 0, px: 0 };
    if (authored.inset) {
      if (!Array.isArray(authored.inset) || !authored.inset.length)
        throw new Error(`Invalid shape inset: ${id}`);
      for (const key of authored.inset) {
        if (!(key in config.insets))
          throw new Error(`Unknown shape inset: ${id}.${key}`);
        const amount = term(config.insets[key]);
        delta.rem -= amount.rem;
        delta.px -= amount.px;
      }
    } else delta = term(authored.offset || "0px");
    const rem = base.rem + delta.rem,
      px = base.px + delta.px;
    // Flatten only when the parent's max() is redundant for every positive root.
    // Otherwise preserve its clamp before applying this role's own offset/inset.
    const value = base.linear
      ? serialize({ rem, px })
      : `max(0px, calc(${base.value}${delta.rem ? ` ${delta.rem < 0 ? "-" : "+"} ${Math.abs(delta.rem)}rem` : ""}${delta.px ? ` ${delta.px < 0 ? "-" : "+"} ${Math.abs(delta.px)}px` : ""}))`;
    return {
      rem,
      px,
      linear: base.linear && rem >= 0 && px >= 0,
      value,
      at16: Math.max(0, base.at16 + delta.rem * 16 + delta.px),
    };
  };
  const roles = ids.map((id) => {
    const authored = config.roles[id],
      resolved = resolve(id);
    if (![resolved.rem, resolved.px, resolved.at16].every(Number.isFinite))
      throw new Error(`Non-finite shape role: ${id}`);
    const expression =
      typeof authored === "string"
        ? `var(--radius-value-${authored})`
        : authored.inset
          ? `max(0px, calc(var(--radius-${authored.from})${authored.inset.map((key) => ` - var(--shape-inset-${key})`).join("")}))`
          : `max(0px, calc(var(--radius-${authored.from}) + ${authored.offset || "0px"}))`;
    return {
      id,
      description: shapeRoleDescriptions[id],
      cssVariable: `--radius-${id}`,
      editPath: `shapeCustomization.roles.${id}`,
      sourcePath:
        typeof authored === "string"
          ? `shapeCustomization.primitives.${authored}`
          : `shapeCustomization.roles.${id}`,
      authoredValue: authored,
      value: resolved.value,
      resolvedValueAt16: `${resolved.at16}px`,
      cssValue: expression,
    };
  });
  const byId = Object.fromEntries(roles.map((role) => [role.id, role]));
  const px = (id: ShapeRole) => parseFloat(byId[id].resolvedValueAt16);
  if (
    px("surface") < px("panel") ||
    px("panel") < px("control") ||
    px("select-panel") < px("select-item") ||
    px("panel") < px("menu-item")
  )
    throw new Error("Shape hierarchy is inverted");
  return {
    schemaVersion: 1,
    sourceFile: "tokens.json",
    editPath: "shapeCustomization",
    densityIndependent: true,
    insets: config.insets,
    utilities: config.utilities,
    roles,
    adapters: shapeAdapters,
    constraints: [
      "Role-based shapes are shared across implementations and the viewer.",
      "Inner radii derive from the container; do not duplicate values.",
      "Circles, pills, open group corners, and decorative geometry retain their function.",
      "Motion resolves the same CSS variables to pixels before interpolating.",
    ],
  };
}
