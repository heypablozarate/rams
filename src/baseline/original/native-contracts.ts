import summaries from "./native-summaries.json" with { type: "json" };
import map from "./native-preview-map.json" with { type: "json" };
import type { PreviewContract } from "../../catalog/preview-contracts";
const limits: Record<string, string[]> = {
  "radio-group": ["This changes a local paper diagram; it does not generate a production dieline or print order."],
  chart: [
    "Ninety dated print records span September 1–November 29, 2026. Windows show the latest 7, 30 or 90 records; cumulative totals retain the full production history.",
  ],
  sidebar: [
    "Both previews use the same three collections. Desktop expansion is provider-managed or controlled by its consumer; mobile expansion is independent.",
  ],
  drawer: [
    "Run sizes range from 24 to 120 in steps of 12; six historical runs are static context. Packing references use two uppercase letters and two digits separated by a hyphen; instructions have at least six characters.",
  ],
  sonner: [
    "Tray changes and reference recovery are local. The type check waits for actual document font readiness; messages are scoped and stay until closed.",
  ],
  resizable: [
    "The group owns dimensions and the library owns sizing. Nested horizontal/vertical layouts retain the same panel content with or without visible grips.",
  ],
  carousel: [
    "Five local illustrations are reused across orientations and sizing. Partial-slide visibility depends on available width; only the API variant displays the actual snap count.",
  ],
  slider: [
    "Ink coverage runs from 0 to 100 percent in steps of 1; value changes are local.",
  ],
  "input-otp": [
    "Six characters fill one real input. Only the pattern variant restricts ASCII letters and digits; the examples do not verify identity or submit to a service.",
  ],
  calendar: [
    "Dates are local calendar days. The workshop year selector spans 2025–2028; milestone dates belong to the November 2026 print schedule.",
  ],
  "button-group": [
    "Group controls own their action models. Sheet counters range from 1 to 24; horizontal strips scroll locally when full controls do not fit.",
  ],
  breadcrumb: [
    "The model owns four archive levels. The responsive chooser keeps its presentation until it closes; navigation and dismissal have different focus destinations.",
  ],
  pagination: [
    "Sixteen records are split into eight pages. The visible numbered window follows the current page, with ellipses for omitted pages.",
  ],
  empty: [
    "Edition names have 1–60 characters; bulk import accepts commas or line breaks and removes exact duplicate names. The search matches titles and cities without case sensitivity.",
  ],
  item: [
    "The shortlist action changes its owning model; the linked item uses the real author portfolio without nesting controls.",
  ],
  avatar: [
    "The image and fallback identify an edition mark; the malformed local image deliberately exercises fallback without a remote request.",
  ],
  "scroll-area": [
    "The root owns its viewport and bars. Vertical content has 50 records; the horizontal gallery uses 7 owned illustrations and no remote photos.",
  ],
  field: [
    "The form owns draft and saved values; Field supplies grouping and layout. Responsive orientation follows the available FieldGroup width.",
  ],
  "input-group": [
    "The example owns derived results; the grouped control retains native editing and separate addon focus.",
  ],
  form: [
    "React Hook Form owns validation and first-invalid focus. Each successful submit captures current values; reset clears that saved record and restores explicit defaults.",
  ],
  select: [
    "Values remain in the owning control; groups and scroll affordances do not change the single-selection model.",
  ],
  "dropdown-menu": [
    "The edition action changes actual revision data; marks and press-pass variants own their individual settings.",
  ],
  "context-menu": [
    "The model owns impression count and mounting state; opening the menu alone changes neither.",
  ],
  menubar: ["The adjacent menus operate on the same current sheet record."],
  "navigation-menu": [
    "Links point to the approved real portfolio, Lab and reading resources; the demo does not reproduce those sites.",
  ],
  command: [
    "Inline and dialog forms use the same real edition records; filed records cannot be chosen.",
  ],
  combobox: [
    "The basic example uses Base UI; responsive and label-action examples compose the own Command, popup, drawer and menu.",
  ],

  dialog: [
    "Review state belongs to the example; the brief variant adds an explicit footer dismissal.",
  ],
  "alert-dialog": [
    "Starting a new trial clears its ink placements and advances its actual revision.",
  ],
  sheet: [
    "Draft text survives closing because the owning component keeps its state; the four-direction variant is a separate read-only brief.",
  ],
  popover: [
    "The settings change the displayed print marks; dismissing does not reset those settings.",
  ],
  "hover-card": [
    "The anchor has a real portfolio destination; the card supplies supplementary author details.",
  ],
  tooltip: [
    "The hint explains a real local shortlist action and is supplementary to the button label.",
  ],

  checkbox: [
    "The parent mixed state is derived from child selections; disabled remains selected.",
  ],
  switch: [
    "The preference applies immediately to the colophon; there is no persistence service.",
  ],
  toggle: [
    "Pressed state changes the actual title style; disabled controls cannot change it.",
  ],
  "toggle-group": [
    "Multiple treatments combine. The single alignment example intentionally retains one choice.",
  ],
  accordion: [
    "This specimen uses single, collapsible selection; the primitive also supports multiple sections.",
  ],
  collapsible: [
    "One trigger owns one region; it does not add an accordion navigation model.",
  ],
  tabs: [
    "The owning component preserves both drafts while panels are inactive; saves are local.",
  ],

  button: ['Set type="button" for a form action that must not submit.'],
  input: ["Name the field and associate any help or error with its id."],
  textarea: [
    "Auto-sizing depends on browser support; vertical resizing remains available.",
  ],
  label: ["The control owns its disabled state."],
  separator: ["The horizontal boundary exposes separator semantics through decorative={false}; vertical metadata dividers remain decorative and need available container height."],
  badge: ["Color is accompanied by a readable state or category label."],
  card: [
    "CardTitle is a div; compose a heading when document structure requires one.",
  ],
  alert: ["A direct SVG child reserves the icon column."],
  skeleton: [
    "The placeholders are static; their geometry reserves the future content area.",
  ],
  spinner: ["Reduced motion stops rotation while retaining the loading name."],
  kbd: [
    "Keycaps describe native keys or an implemented shortcut; they do not bind listeners.",
  ],
  "aspect-ratio": ["The containing element sets the frame width."],
  table: [
    "The table supplies semantics and local scrolling; the data-table composition owns filtering, sorting and selection.",
  ],
  progress: [
    "Values are clamped to the finite positive max; null is indeterminate.",
  ],
  "native-select": [
    "Native option and optgroup behavior comes from the browser.",
  ],
};
// These differences belong to the actual demo, not every specimen in its family.
const specificLimits: Record<string, string[]> = {
  "item-demo": ["The shortlist state is local; the linked item opens the real portfolio."],
  "item-variant": ["These static specimens compare surfaces; their rows and labels are not interactive."],
  "form-rhf-demo": [
    "Validation focuses the first invalid field. Submit captures current values; Reset clears the saved record and restores defaults."
  ],
  "form-rhf-select": [
    "Validation focuses the invalid Select trigger. Submit captures the current selection; Reset clears it and the saved record."
  ],
  "form-rhf-checkbox": [
    "At least one release check is required. Invalid submit focuses the first check; Reset clears the values and saved record."
  ],
  "calendar-demo": [
    "Dates are local calendar days; the month/year selector spans 2025–2028."
  ],
  "date-picker-demo": [
    "Dates are local calendar days; selecting a day closes this popover."
  ],
  "date-picker-with-range": [
    "Dates are local calendar days; choose a start and end across the two visible months."
  ],
  "date-picker-with-presets": [
    "Preset milestones select November 2026 dates; a custom day clears a nonmatching preset. Dates are local calendar days."
  ],
  "drawer-demo": [
    "Run size accepts 24–120 in steps of 12. Keep commits the draft; Cancel discards it."
  ],
  "drawer-dialog": [
    "Packing references use two uppercase letters, a hyphen and two digits. Instructions require at least six trimmed characters."
  ],
  "scroll-area-demo": [
    "The root owns the viewport and scrollbar. The list contains 50 records and scrolls vertically."
  ],
  "scroll-area-horizontal-demo": [
    "The root owns the viewport and scrollbar. Seven local illustrations form a horizontal gallery."
  ],
  "chart-bar-interactive": [
    "Windows show the latest 7, 30 or 90 dated records."
  ],
  "chart-area-interactive": [
    "The window shows recent dated records, but cumulative values retain the full production history."
  ],
  "chart-line-interactive": [
    "Windows show the latest 7, 30 or 90 dated records."
  ]
};

const checks: Record<string, string[]> = {
  "radio-group": ["Use labels, Arrow keys and Space; verify native input checked state and focus, including a short press.", "Home and End move focus without changing selection; Space selects the focused option.", "Verify uncontrolled and controlled form reset, native required validation and external form association in the clean consumer."],
  chart: [
    "Change both edition formats and all windows; compare totals and keyboard tooltip values with actual first/last table records, resize, and switch reduced motion while active.",
  ],
  sidebar: [
    "Open, navigate and close on mobile; test desktop expansion, shortcut, both ownership modes and focus after collapse.",
  ],
  drawer: [
    "Reach both run-size bounds, keep and cancel; validate and recover the packing form, dismiss and resize while open.",
  ],
  sonner: [
    "Archive/restore/undo and verify the actual tray; inspect each feedback type, recover the reference and verify current-font readiness.",
  ],
  resizable: [
    "Move each named separator with keyboard and pointer; verify its actual values, panel dimensions and preserved content.",
  ],
  carousel: [
    "Reach both ends by controls and keyboard, exercise the vertical axis, resize and verify native API position/count.",
  ],
  slider: [
    "Use arrows and Home/End; verify the actual output and 0–100 bounds.",
  ],
  "input-otp": [
    "Enter and edit six characters using the real input; verify controlled clear and alphanumeric rejection where configured.",
  ],
  calendar: [
    "Change month/year and select dates with the keyboard; verify current dates, preset synchronization and focus after closing the picker.",
  ],
  "button-group": [
    "Activate the real actions and undo or restore; inspect declared sizes/orientation, counter boundaries, focus and both local scroll extremes.",
  ],
  breadcrumb: [
    "Choose ancestors, dismiss without changing location and reopen; verify actual hierarchy, aria-current and appropriate focus. Resize only after identifying the open presentation.",
  ],
  pagination: [
    "Reach both boundaries, select nearby pages, inspect actual records and aria-current, and verify usable reflow and focus.",
  ],
  empty: [
    "Create/import invalid and duplicate names, preserve the draft between modes, remove the final record and recover from no-results search.",
  ],
  item: [
    "Run the actual shortlist action, check the real linked href and compare matching content across all three surfaces.",
  ],
  avatar: [
    "Verify successful local image decode, fallback, accessible names, rounded shape and overlapping group.",
  ],
  "scroll-area": [
    "Focus the viewport and reach both ends with real keyboard/scroll interaction; inspect initial and final labels, clipping and horizontal page bounds.",
  ],
  field: [
    "Edit and save the actual values, verify label/help association and reset focus; inspect both responsive layouts.",
  ],
  "input-group": [
    "Check the actual filtered records, count/unit calculation and latest-query result; addons retain expected focus and valid error associations.",
  ],
  form: [
    "Submit invalid values, inspect associated help/errors and first-invalid focus; correct, submit and reset the real model.",
  ],
  select: [
    "Open, type ahead, choose options, verify group labels and reach both list extremes with the keyboard.",
  ],
  "dropdown-menu": [
    "Run the actual action/export; check mark toggles and exclusive press-pass values, plus Escape and trigger focus.",
  ],
  "context-menu": [
    "Open the proof context menu, change count and mounting, and dismiss without changing data.",
  ],
  menubar: [
    "Move between menus with keyboard; create a revision, change fold guidance and choose paper through the submenu.",
  ],
  "navigation-menu": [
    "Open each group by keyboard and pointer; inspect content bounds and real href destinations.",
  ],
  command: [
    "Filter, clear no results, skip the filed option and choose a record by keyboard; close/reopen the dialog and verify focus.",
  ],
  combobox: [
    "Filter/select/clear stock; choose an edition in popup and drawer, resize while open, and assign/remove a real label with correct focus return.",
  ],

  dialog: [
    "Review and save; check disabled action until alignment is checked, close with Escape and both dismissal controls, then verify trigger focus.",
  ],
  "alert-dialog": [
    "Cancel and verify unchanged placements; confirm and verify empty sheet/new trial; reopen and check safe focus.",
  ],
  sheet: [
    "Verify frame initial focus, edit/close/reopen/submit the real draft; choose and open all four directions, including keyboard dismissal.",
  ],
  popover: [
    "Open with keyboard, toggle each mark, close with Escape and verify retained settings and trigger focus.",
  ],
  "hover-card": [
    "Reveal on hover and focus; verify the card and actual portfolio href without navigating externally.",
  ],
  tooltip: [
    "Reveal on hover/focus, activate the action, check the actual shortlist and dismiss the hint with Escape.",
  ],

  checkbox: [
    "Toggle individual sheets and the parent; verify checked, mixed and unchecked states and label activation.",
  ],
  switch: [
    "Activate with Space and the visible label; verify the colophon appears and disappears.",
  ],
  toggle: [
    "Toggle with keyboard and verify both aria-pressed and actual italic styling; disabled remains unchanged.",
  ],
  "toggle-group": [
    "Combine treatments, choose each alignment and use arrow navigation; disabled choices remain unchanged.",
  ],
  accordion: [
    "Open, switch and close sections; navigate headings with arrow keys and Home/End.",
  ],
  collapsible: [
    "Open and close repeatedly with Enter/Space; check aria-expanded, content visibility and retained focus.",
  ],
  tabs: [
    "Navigate tabs by keyboard, change both fields, switch back and save; verify retained drafts, real saved values and native required validation.",
  ],

  button: [
    "Use Enter or Space to keep and remove the terrace study. Verify the shortlist status and retained focus.",
  ],
  input: [
    "Edit the field; for the file variant choose artwork and check its filename. Disabled fields remain unchanged.",
  ],
  textarea: [
    "Enter several lines, resize vertically and check the associated label. Disabled fields remain unchanged.",
  ],
  label: ["Activate the label and verify that its field receives focus."],
  separator: [
    "Check the horizontal boundary and the vertical metadata dividers after reflow.",
  ],
  badge: ["Check complete labels and distinct treatments at narrow widths."],
  card: [
    "Keep and remove an edition; submit an edited title and note in the form variant.",
  ],
  alert: ["Check role, icon and complete message text in both themes."],
  skeleton: [
    "Check reserved geometry and one accessible loading status per group.",
  ],
  spinner: [
    "Check accessible names and reduced motion; the busy button remains disabled.",
  ],
  kbd: [
    "Check that each key remains legible and groups retain their modifier order.",
  ],
  "aspect-ratio": [
    "Resize the frame and verify its 16:9 dimensions and artwork text alternative.",
  ],
  table: [
    "Check headers and local scrolling; filter, sort, select rows, toggle the state column and reach both data pages.",
  ],
  progress: [
    "Toggle the proof checks and verify the matching bar value and count.",
  ],
  "native-select": [
    "Choose options and groups; resolve the invalid selection and verify that its linked error clears.",
  ],
};
const specificChecks: Record<string, string[]> = {
  "drawer-demo": [
    "Set the run size to 24 and 120 sheets with the step controls. Keep a value, reopen the drawer, then change and cancel it. Check that the reserved count keeps the saved value and that focus returns to Set run size.",
  ],
  "drawer-dialog": [
    "Open the packing slip in the compact drawer and the wide dialog. Enter an invalid edition reference or packing instruction, correct it and keep the slip. Check the saved reference and instruction, and that focus returns to Edit packing slip.",
    "Resize while the form is open. Check that the current surface and draft persist. Cancel an edit and verify the saved slip stays the same.",
  ],
  "sheet-demo": [
    "Open the bindery note, edit the instructions and dismiss the sheet with Escape. Reopen it, verify that the draft is still present, then keep the note and check the saved text and returned focus.",
  ],
  "calendar-demo": [
    "Choose a month and year within 2025–2028 with the calendar dropdowns. Focus a day and press Enter to check the selected date and workshop status.",
  ],
  "date-picker-demo": [
    "Open the bindery calendar with the keyboard and select a day. Verify that the popover closes, the trigger shows the chosen date, and focus returns to it.",
  ],
  "date-picker-with-range": [
    "Choose a start and an end in different months. Check the prompt after the first choice and the completed range in the trigger and status after the second. Press Escape and verify that focus returns to the trigger.",
  ],
  "date-picker-with-presets": [
    "Choose a workshop milestone and check the selected calendar day and date text. Choose a day outside the presets and check that the preset clears. Press Escape and verify that focus returns to the trigger.",
  ],
  "item-demo": ["Add and remove the shortlist entry, then check the portfolio link destination."],
  "item-variant": ["Compare the same record across the default, outlined and muted surfaces."],
  "field-demo": [
    "Submit an ordinary and a blank-only title, check the actual saved slip and help association; restore the draft without losing Reset focus.",
  ],
  "field-checkbox": [
    "Toggle both details independently and verify the actual final sheet and linked help.",
  ],
  "field-responsive": [
    "Change room and note, keep both values, resize across the FieldGroup breakpoint and inspect label/control alignment without losing the draft.",
  ],
  "input-group-demo": [
    "Filter, clear a no-results query and verify the result count; clicking a noninteractive addon focuses the input.",
  ],
  "input-group-dropdown": [
    "Switch between sheets and four-sheet sections and verify total; test empty/zero/fractional values, associated error and menu focus return.",
  ],
  "input-group-spinner": [
    "Change queries while pending, clear and unmount; only the latest query may replace results, and reduced motion preserves the loading name.",
  ],
  "dropdown-menu-demo": [
    "Duplicate, export the actual JSON and reset; check the starting-edition disabled reset.",
  ],
  "dropdown-menu-checkboxes": [
    "Toggle both mark settings and verify their actual SVG paths.",
  ],
  "dropdown-menu-radio-group": [
    "Choose each press pass and verify one checked item and its record value.",
  ],
  "command-dialog": [
    "Open with the real trigger, filter and select, then verify the chosen record and restored focus.",
  ],
  "combobox-demo": [
    "Search, choose, clear and recover from no matching stocks.",
  ],
  "combobox-responsive": [
    "Open desktop popup and mobile drawer, select, resize while open and check focus return.",
  ],
  "combobox-dropdown-menu": [
    "Open label assignment from the menu, search/select/cancel, remove the actual label and verify focus.",
  ],
  "dialog-close-button": [
    "Open the brief, close with its footer and shared top close button, then check trigger focus.",
  ],
  "sheet-side": [
    "Choose each direction, open the named brief, inspect viewport boundaries, and close with Escape.",
  ],
  "checkbox-disabled": ["Verify the filed sheet stays checked and disabled."],
  "checkbox-with-text": [
    "Toggle the option via its label; verify the help text is associated by id.",
  ],
  "toggle-disabled": [
    "Verify the disabled control cannot change the title styling.",
  ],
  "toggle-group-disabled": [
    "Verify every control is disabled and Uppercase remains selected.",
  ],
  "button-demo": ["Keep and remove the terrace study with the keyboard. Check the shortlist status and the icon link’s accessible name and destination."],
  "button-destructive": ["Discard and restore the proof with the keyboard. Verify the status after each action and check that focus stays on the button."],
  "button-size": ["Switch the style and compare the four hit sizes and their complete labels."],
  "button-loading": [
    "Verify the disabled/busy state, full label and reduced-motion spinner.",
  ],
  "button-link": [
    "Check the real portfolio href and keyboard focus without replacing link semantics.",
  ],
  "button-icon": [
    "Check the real portfolio href and accessible name on the icon-only link.",
  ],
  "input-demo": [
    "Edit the named print title and check native selection and focus.",
  ],
  "input-with-label": [
    "Activate Edition title, edit the value and check focus.",
  ],
  "input-disabled": [
    "Try to edit the archived title and verify that Tab skips the disabled field.",
  ],
  "input-file": ["Choose artwork and verify the selected filename."],
  "textarea-disabled": [
    "Verify that the archived note remains complete and cannot be edited.",
  ],
  "card-demo": [
    "Keep and remove the edition; verify the actual shortlist record.",
  ],
  "card-with-form": [
    "Submit an edited title and paper note, then check their saved values; required fields use native validation.",
  ],
  "table-demo": [
    "Check native headers, the caption and local horizontal scrolling at narrow widths.",
  ],
  "data-table-demo": [
    "Filter, sort, select prints, toggle Review state and reach both pages; clear a no-results filter.",
  ],
  "native-select-demo": [
    "Choose a paper finish with the keyboard and check the retained value.",
  ],
  "native-select-groups": ["Choose destinations in both named groups."],
  "native-select-invalid": [
    "Choose a region and verify that aria-invalid and its linked error clear together.",
  ],
  "native-select-disabled": [
    "Verify that the archived finish remains named and disabled.",
  ],
};
export function getOriginalNativeContract(
  demoId: string,
): PreviewContract | undefined {
  const entry = (map as Record<string, { file: string }>)[demoId],
    summary = (summaries as Record<string, string>)[demoId];
  if (!entry || !summary) return;
  const family = entry.file.split("/").at(-1)!.replace(".tsx", "");
  return {
    demonstrates: [summary],
    limits: demoId === "empty-input-group" ? ["Search matches the five stored edition titles and cities without case sensitivity; clearing the query restores the records."] : [...(specificLimits[demoId] ?? limits[family])],
    checks: demoId === "empty-input-group" ? ["Search for an absent title, verify the no-results message, and clear the query to restore the same editions."] : [...(specificChecks[demoId] ?? checks[family])],
  };
}
