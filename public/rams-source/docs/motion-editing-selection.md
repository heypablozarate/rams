# Motion editing and selection

These independent recipes retain the ARC notice and use the owned RAMS inputs and buttons. Import the shared public styles once.

- `motion-morph-select` grows one trigger surface into a grouped listbox. Use optional search for longer lists, metadata for stock details, and `onValueChange(value, option)` for the downstream calculation. The controlled paper example calculates kilograms for 100 A3 sheets; it does not query stock availability. Labels wrap at the available text size while the measured surface grows.
- `motion-combobox` filters named options as you type and commits one value. Keep unavailable choices disabled and provide a clear accessible label.
- `motion-multi-select` includes several options in one value array. The compact trigger summarizes selected labels; the listbox keeps every option available.
- `motion-tag-input` commits a draft with Enter, comma or blur. Case-insensitive duplicates are rejected; existing tags can be removed through the keyboard or their named action.
- `motion-search-field` is a controlled search input with a clear action. Keep results tied to its current value and return focus to the field when clearing.
- `motion-inline-edit` edits the existing value in place, with save, cancel and a validation callback. The caller applies the accepted value; do not use animation completion to commit data.
- `motion-chip-group` shows a pressed state for each selected option. Declare whether the consumer matches any or every selected value; keep the empty selection meaningful.

The original examples calculate their displayed records and totals from the same accepted state as the controls. Fixed compact glyph geometry is separate from responsive text. Use the public theme roles for foreground, surface and focus rather than embedding a private brand palette.

Inline Edit titles use the fluid XL text scale. At a 16px root, Compact uses 20–22px, Default 22–24px and Wide 24–26px. The scale follows the browser text setting. Title and body line heights round to even and whole pixels respectively to align the display with the editor.
