# Shared application rules

Use the installed semantic styles and the selected component's real exports. Keep application data,
service boundaries and callback ownership explicit. A preview's local model is not authentication,
storage, delivery or a backend service.

## Typography and space

Import `styles.css` once. Geist Sans supplies UI/body with real upright and italic weights 100–900.
The supplied Geist Serif file is Regular 400; use `rams-editorial-title` for an intentional editorial
display role. Do not synthesize weights or assume metric equivalence with other fonts.
Fluid role sizes preserve browser text preferences. Let labels wrap and controls grow; do not shrink
text to force a single line. Check narrow layouts and text at 200% separately from browser zoom.
Use the installed roles for color, type, spacing, size, radius, borders, shadows, layers, opacity and motion.
Compose the shared field, menu and dialog parts so their alignment and state rules travel together.
Keep layout relationships and sample data in the composition. Author shared visual values at the token source.

## Actions and behavior

Each active view has at most one primary action and may have none. Count its header/content/sticky
actions together; an inert background does not share the active dialog's scope.
Primary actions use neutral `--rams-primary` and `--rams-on-primary` colors with a bold label.
If you customize the primary fill, review `--rams-primary-hover`, `--rams-primary-pressed`, text and focus contrast together.
Buttons perform actions; links navigate. Explicitly use `type="submit"` for form submission.
Preserve controlled state, refs, keyboard behavior, validation associations and visible focus.
Check return of focus when dismissing overlays or removing the focused element.

## Color and motion

The default installed foundation is neutral. Import `palette.css` after `styles.css` to opt into
Brand Accent `#ED4107`, exposed as `--rams-brand-accent` in OKLCH, and the related chart tones.
Text selection and selected controls retain their neutral role pairs in both themes. Use semantic status colors
according to what the outcome means in the application.
Use labels/values/strokes as well as color to distinguish data. Check contrast in both themes,
including translucent selection and hover states; a color token is not a contrast certification.

Preserve reduced-motion behavior and meaningful state updates. One animation owner should control
a size transition; interruption must not commit stale state or cause transient label wrapping.
Read the selected guide for component-specific motion and lifecycle requirements.

## Validation before delivery

Build/typecheck the actual application. Use keyboard and pointer where relevant; inspect default,
changed, invalid, disabled, pending and recovery states that the selected contract promises.
Check narrow/wide layouts, long labels, browser text preferences and reduced motion. State coverage
and limits explicitly. Static source checks and screenshots alone do not prove every interaction.
