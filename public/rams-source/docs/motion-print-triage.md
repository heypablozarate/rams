# Print-room interactions

Use `motion-otp-input` for a controlled code split into slots. The worksheet example compares six digits locally; delivery and authentication require the consuming application. `onValueChange` reports a compact string.

`motion-swipe-actions` reveals row actions and provides the same choices in a keyboard menu. Use `keepRow` for reversible marking; remove the corresponding item in the action callback when archiving it. Focus follows the actual removed row. Supply a readable empty state.

`motion-card-stack` reviews items one by one with buttons, stage arrow keys or dragging. Provide stable keys, short labels and meaningful decision results. Undo and reset callbacks let the consuming application reverse its local results. Use a table when users need side-by-side comparison.

`motion-expandable-card` reveals details beneath a useful summary and fits its width caps within the available container. Keep nested actions distinct from disclosure.

`motion-bottom-sheet` uses viewport fractions as detents. The grabber offers keyboard expansion/collapse; content remains scrollable at the current height. Preserve its title, description, close control and focus return.

`motion-user-menu` reports status and appearance choices; the consuming application applies them. The print-room example applies appearance to a contained paper specimen, and opens actual local worksheet panels. No account service is included.

Import the shared styles and component source listed in `rams.json`. Preserve ARC attribution and the dependencies declared for each recipe. Verify keyboard, focus, narrow layouts, text enlargement and reduced motion in the final composition; native zoom and physical gestures need their own checks.
