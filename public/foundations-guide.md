# Customize RAMS foundations

Names express function: Brand Color, Primary, Accent Color, Background, Foreground, Card, Popover, and more. The assigned color can change across themes or brands without renaming the role. Sharing a value does not make two roles the same decision.

## Editable source and contract

- `tokens.json`: the only editable authority for color values, `typography` roles, density scales, and versioned `shapeCustomization`.
- `foundationOverrides.light/dark`: the entry point for customizing the application’s color roles by theme.
- `colorPrimitives`: reusable values. Roles can use `{colorPrimitives.ruta}` references or an `oklch()` literal. The parser accepts finite decimal L/C/H values, optional percentage L, and decimal or percentage alpha; it does not accept percentage C/H, angle units, `calc()`, or a full CSS parser.
- `src/baseline/foundation-roles.ts`: names, purpose, and pairings; it contains no colors.
- `/design-system.json`: generated contract for people and agents, with IDs, purpose, pairings, values for both themes, declared references, effective paths, and edit paths. It uses the custom `rams-foundations` format, `schemaVersion: 1`; it is neither a DTCG file nor an MCP server.

Do not edit `public/tokens.json`, `public/design-system.json`, or the CSS assets in a production build. Precedence is base theme → supporting graphics → brand → foundationOverrides.

## Example: change Background without changing Card

Add this to the existing `foundationOverrides` object in `tokens.json`:

```json rams-foundation-overrides
{
  "light": {
    "background": "oklch(0.98 0 0)",
    "foreground": "oklch(0.145 0 0)"
  },
  "dark": {
    "background": "oklch(0.16 0 0)",
    "foreground": "oklch(0.985 0 0)"
  }
}
```

These values illustrate the mechanism; they do not replace visual validation. Card and Popover retain their own roles. Use `var(--background)` to share a decision explicitly; a missing or cyclic reference stops generation. Do not edit the global white primitive when you only want to change the page.

Primary actions pair black with white text in light theme and white with black text in dark theme. Their labels use the primary action weight. Action Button uses the subtle sunset hover treatment. Links and text on tinted surfaces use the appropriate foreground role.

To change Primary, edit `foundationOverrides.light.primary`, `primary-foreground`, and their dark-theme equivalents. Review links and hover states as well as button text. To change Accent, edit `accent` and `accent-foreground`; Accent highlights controls and is not the exact brand color.

The `background`/`foreground`, `card`/`card-foreground`, and `popover`/`popover-foreground` pairs describe distinct surfaces. Adjust text together with its surface, and also review combinations that use transparency. Do not swap roles just because their values match.

## Action hierarchy

Each screen or active view allows at most one primary button; it may have none. Count the full composition—header, content, footer, and sticky actions—not each card. The active modal may have its own primary button when the background is inert; non-modal panels count as part of the background view. Also review responsive copies visible at the same time. Explicitly scoped catalog demonstrations may represent independent views; this exception does not apply to product cards.

Other buttons use secondary treatments. Primary remains a color role: changing its value does not decide how many actions receive emphasis. A DOM count only identifies candidates; it does not replace reviewing the visual hierarchy in real states. See the [action guide](/action-hierarchy-guide.md), whose editable source is `docs/ACTION-HIERARCHY.md`; `npm run registry` generates that guide and the `compositionRules.primaryAction` field in `/components.json`.

## Exact brand color and derivatives

Brand Color is `#ED4107` in both themes and resolves to `oklch(0.6262015868 0.2154394063 35.26648322 / 1)`. Edit `colorPrimitives.brand.light.accent` to update the shared value. `brandCustomization.palette.{light|dark}.brandAccent` resolves to that value and generates `--rams-brand-accent`. The installed package includes the same role in its optional palette.

Primary, Focus Ring, text selection and control selection each have their own roles. Use `selection` and `selection-foreground` as a pair for selected text. The preset uses neutral colors for text selection and selected controls. Tonal chart defaults derive from Brand Color.

## Other foundations: current scope

- Fluid typography: `tokens.json/typography.fluid.scales`, between 20rem and 80rem viewport width. Rem limits respect the root size; interpolation combines rem and vw. Spacing and geometry remain in `density.scales`. Reserve fixed sizes for documented optical or geometric cases.
- Initial density: Default. Changing only `density.default` does not update the preference reader or its migration; that change also requires updating `src/baseline/density.ts` and verifying persistence.
- Font families: Geist Sans for interface text and Geist Serif Regular for editorial content. The three embedded fonts and their OFL notice are in `public/rams-source/fonts/`.
- Shape: version 1 of `tokens.json/shapeCustomization` is the only source for the ten shared roles. Control/panel/surface use 18/26/34 px at the 16 px reference root; Select panel/item 20/14 px, menu-item 20 px, and tab-item 15 px derive from their containers and insets. All three densities and both themes share the same shape; `rem` values respect the browser’s actual root size. See the [shape guide](/shape-guide.md), identical to `docs/SHAPE.md`.
- Shape consumption: `npm run tokens` generates `src/baseline/shape.css` (utilities and slot adapters) and `shape-tokens.ts`; `useShapeRadius` in `src/variants/use-radius.ts` resolves those same CSS variables for Motion. Do not edit alternate inline radii or implementations to change a shared role. Preserve circles, pills, joined/directional corners, and decorative geometry.
- Layout and motion timings are separate decisions; there is no universal configurator for both. Adjust each behavior in its component rather than turning it into a global scale.

## Workflow for people and agents

1. Read `AGENTS.md`, `DESIGN.md`, and the generated manifest. Inspect local changes before editing.
2. Choose a role by purpose, not its current color. Check `editPath`, `sourcePath`, shared references, and `pairWith`.
3. Edit only the necessary source. Do not rename existing IDs to change values. Adding or removing an ID changes the contract and requires consumer migration.
4. Run `npm run foundations:check` and `npm run build`. These validate roles, references, pairings, values, and generation; they do not certify accessibility. For shape, also run `npm run tokens`, the contracts, and `tests/browser/shape.spec.ts`; review Select, menus, Tabs, portals, Motion, and a text root size other than 16 px.
5. Verify both themes, all three densities, reflow, fonts, focus, hover, selection, and affected components. Measure contrast on real surfaces, accounting for alpha and opacity. Check every combination used by the application after customization.
6. Run the contracts and review the differences. Identity, brand, and scale expectations must match the chosen values. Inspect each difference before updating an expectation; do not regenerate expectations without review.
7. Update the guides for affected roles and communicate contract changes to their consumers.

Components consume semantic roles through CSS/Tailwind. Do not propagate new hex values, shade names, or one-off values into components.

## Component details

Variants share RAMS roles through `tokens.json/componentExtensions.base`. Additional details—states, elevation, gradients, module colors, and motion—use explicit primitives in the `--rams-detail-` namespace. `componentPrimitives` lets you change them without editing vendor CSS; `componentDetailSources` records their uses. See `/component-integration.md`. Do not import an alternative global palette or choose variants for the user.

## Shape contract for agents

The `shape` field in `/design-system.json` contains `schemaVersion: 1`, `sourceFile`, `editPath`, `densityIndependent`, `insets`, ten `roles`, `adapters`, and constraints. Each role includes a functional description, CSS variable, editable path, effective path, declared value, CSS expression, and resolution at a 16 px root. This is a generated view of `tokens.json/shapeCustomization`, not a second source or a claim of DTCG conformance. The validator rejects unknown versions/roles, missing references, cycles, invalid lengths, and inverted hierarchies. Inner radii derive from shared insets; do not duplicate values in components. The shape guide details formulas, limits, and visual validation.

## Typography contract for agents

`tokens.json/typography.roles` assigns size, line height, and family to control, body, caption, title, heading, display, and code. Sizes reference `density.scales`: in Default, control is 16 px, body 18 px, and caption 14 px, at a 16 px reference root. Geist Sans is the interface family; Geist Serif Regular is reserved for explicit editorial content. A fork can replace the families with its own licensed fonts.

The `typography` field in `/design-system.json` exposes editable paths, `--type-…-size` variables, family, line height, fluid ranges for all three densities, and optical adjustments by role. Changing a role updates its consumers without modifying pinned components. Do not replace this layer with local sizes. Mobile text fields use at least 1rem to avoid automatic zoom while editing; the root follows the browser preference. Titles, featured figures, and helper text retain their hierarchy, so not all text should be the same size.

[Licenses](/#/legal)
