# Whole-page theme changes

`motion-theme-switch` requests a light/dark change through `onThemeChange(next, variant, trigger)`. It does not own the page theme or persistence. All four styles have the same binary function and button; only the whole-page reveal differs: `reveal` grows from the button, `eclipse` starts beyond the left edge, `split` opens at the center, and `rise` moves upward.

Import `styles.css` once and `components/theme-transition.css` once. Pass the requested theme, variant, actual trigger and your host setter to `transitionTheme` from `components/theme-transition`. Its installed helper uses native View Transitions and the shared motion tokens. Reduced motion, missing View Transition support or unavailable pseudo-element animation falls back to the actual theme update; it does not create a decorative substitute. Superseded transitions may not commit an older requested theme.

The copyable proof examples consume `useTheme` from next-themes 0.4.6. Wrap them in one `ThemeProvider` with `attribute="class"` at the application root. Another host may instead supply a controlled theme and setter directly; no provider is built into ThemeSwitch. Preserve trigger focus and theme state when composing it. Changing viewing mode does not change the proof content or signify a print-color approval.
