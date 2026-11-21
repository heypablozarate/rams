import originalIntegrations from "../baseline/integration-meta.json" with {type:"json"};
import{getOriginalLibraryContract}from"../variants/demos/original-contracts.ts";
import {getOriginalNativeContract} from "../baseline/original/native-contracts.ts";
import type { ComponentVariant } from "./types";

/** Describes the preview boundary. Checks are suggested manual steps, never test results. */
export type PreviewContract = {
  demonstrates: string[];
  limits: string[];
  checks: string[];
};

// Explicit inventory: adding a catalog variant requires reviewing its preview contract.
const contracts: Record<string, PreviewContract> = {
  "motion-public-header": { demonstrates: ["Theme-aware glass on scroll, desktop navigation, and a mobile menu in an isolated viewport."], limits: ["Links resolve locally in the preview."], checks: ["Scroll past 8 px and switch themes with the glass active.", "Open the mobile menu, check legibility, and close it with Escape to return focus to its toggle.", "Switch from mobile to desktop with the menu open and check scrolling and reduced motion."] },
  "baseline-button-demo": {
    "demonstrates": [
      "Two outlined buttons: one with text and one with an accessible label and icon."
    ],
    "limits": [
      "Visual sample with native press behavior; it is not tied to a business operation and does not save, submit, or delete anything."
    ],
    "checks": [
      "Tab through both buttons and check focus, appearance, and press behavior with Enter or Space."
    ]
  },
  "baseline-button-outline": {
    "demonstrates": [
      "Outlined appearance."
    ],
    "limits": [
      "Visual sample with native press behavior; it is not tied to a business operation and does not save, submit, or delete anything."
    ],
    "checks": [
      "Tab through the button and check focus, appearance, and press behavior with Enter or Space."
    ]
  },
  "baseline-button-secondary": {
    "demonstrates": [
      "Secondary visual emphasis."
    ],
    "limits": [
      "Visual sample with native press behavior; it is not tied to a business operation and does not save, submit, or delete anything."
    ],
    "checks": [
      "Tab through the button and check focus, appearance, and press behavior with Enter or Space."
    ]
  },
  "baseline-button-ghost": {
    "demonstrates": [
      "Low-emphasis appearance."
    ],
    "limits": [
      "Visual sample with native press behavior; it is not tied to a business operation and does not save, submit, or delete anything."
    ],
    "checks": [
      "Tab through the button and check focus, appearance, and press behavior with Enter or Space."
    ]
  },
  "baseline-button-link": {
    "demonstrates": [
      "Action styled as a link; the style alone does not define a destination."
    ],
    "limits": [
      "Visual sample with native press behavior; it is not tied to a business operation and does not save, submit, or delete anything."
    ],
    "checks": [
      "Tab through the button and check focus, appearance, and press behavior with Enter or Space."
    ]
  },
  "baseline-button-destructive": {
    "demonstrates": [
      "Visual tone for a destructive action or state."
    ],
    "limits": [
      "Visual sample with native press behavior; it is not tied to a business operation and does not save, submit, or delete anything."
    ],
    "checks": [
      "Tab through the button and check focus, appearance, and press behavior with Enter or Space."
    ]
  },
  "baseline-button-size": {
    "demonstrates": [
      "Comparison of the sizes included in this sample."
    ],
    "limits": [
      "Visual sample with native press behavior; it is not tied to a business operation and does not save, submit, or delete anything."
    ],
    "checks": [
      "Tab through the button and check focus, appearance, and press behavior with Enter or Space."
    ]
  },
  "baseline-button-icon": {
    "demonstrates": [
      "Compact icon action."
    ],
    "limits": [
      "Visual sample with native press behavior; it is not tied to a business operation and does not save, submit, or delete anything."
    ],
    "checks": [
      "Tab through the button and check focus, appearance, and press behavior with Enter or Space."
    ]
  },
  "baseline-button-loading": {
    "demonstrates": [
      "Disabled button with a loading indicator."
    ],
    "limits": [
      "Static, indefinite waiting state; it does not start an asynchronous operation or transition to success or error."
    ],
    "checks": [
      "Check that the button stays disabled and the indicator remains visible; no automatic completion is expected."
    ]
  },
  "motion-button": {
    "demonstrates": [
      "Shows the Primary, Secondary, Ghost, and Danger styles, with hover, focus, and press feedback. Labels remain stable, as in the reference style sample."
    ],
    "limits": [
      "This demonstrates styles and press feedback; it does not save, delete, or toggle a confirmation. Animated width changes are optional when an app changes the component children; this preview does not trigger them."
    ],
    "checks": [
      "Press with a click, Enter, and Space. Check feedback and focus, with no label change or height jump, and verify that the row reflows on mobile.",
      "For consumers with changing labels, test both shorter and longer labels. Check for wrapping or clipping from host styles, then repeat with reduced motion."
    ]
  },
  "baseline-button-group-demo": {
    "demonstrates": [
      "Joined actions shortlist or archive an edition. Undo restores the preceding local state."
    ],
    "limits": [
      "The edition and undo history belong to the preview."
    ],
    "checks": [
      "Shortlist and archive the edition, then undo both actions. Check focus when Undo becomes unavailable."
    ]
  },
  "baseline-button-group-size": {
    "demonstrates": [
      "Small, default and large button groups each change an independent sheet count."
    ],
    "limits": [
      "Each local count ranges from 1 to 24."
    ],
    "checks": [
      "Compare the sizes and change one count. At either bound, check focus on the remaining available action."
    ]
  },
  "baseline-button-group-orientation": {
    "demonstrates": [
      "A vertical group with increment and decrement actions around the current sheet count."
    ],
    "limits": [
      "The local count ranges from 1 to 24."
    ],
    "checks": [
      "Change the count with the keyboard and check the vertical order and joined edges."
    ]
  },
  "baseline-button-group-dropdown": {
    "demonstrates": [
      "Joined outline actions pin or remove a proof. The options menu controls mounting and paper stock."
    ],
    "limits": [
      "Changes affect the local proof tray. Restore brings the proof and its settings back."
    ],
    "checks": [
      "Pin the proof, change its stock in the submenu, then remove and restore it. Check menu and recovery focus."
    ]
  },
  "motion-button-group": {
    "demonstrates": [
      "Previous, next and a selection menu change the current wayfinding sheet. The text labels collapse where the group is narrow."
    ],
    "limits": [
      "The navigation uses three local sheets."
    ],
    "checks": [
      "Change the sheet with the step buttons and menu. Check the accessible names when the visible labels collapse."
    ]
  },
  "baseline-toggle-demo": {
    "demonstrates": [
      "Two-state button for turning an option on or off."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Change the selection and check its visible state; navigate the options with the keyboard."
    ]
  },
  "baseline-toggle-outline": {
    "demonstrates": [
      "Two-state button for turning an option on or off.",
      "Outlined appearance."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Change the selection and check its visible state; navigate the options with the keyboard."
    ]
  },
  "baseline-toggle-disabled": {
    "demonstrates": [
      "Two-state button for turning an option on or off.",
      "Disabled state: the control is displayed without accepting interaction."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Try to activate or edit the disabled control; check that it keeps its value and communicates its state without enabling the action."
    ]
  },
  "baseline-toggle-group-demo": {
    "demonstrates": [
      "Single- or multiple-selection option group with keyboard navigation."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Change the selection and check its visible state; navigate the options with the keyboard."
    ]
  },
  "baseline-toggle-group-single": {
    "demonstrates": [
      "Single- or multiple-selection option group with keyboard navigation.",
      "Group configured to keep one option selected."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Change the selection and check its visible state; navigate the options with the keyboard."
    ]
  },
  "baseline-toggle-group-disabled": {
    "demonstrates": [
      "Single- or multiple-selection option group with keyboard navigation.",
      "Disabled state: the control is displayed without accepting interaction."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Try to activate or edit the disabled control; check that it keeps its value and communicates its state without enabling the action."
    ]
  },
  "baseline-input-demo": {
    "demonstrates": [
      "Editable print title with an accessible name."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "baseline-input-with-label": {
    "demonstrates": [
      "Editable edition title with a visible label.",
      "Visible label associated with the field."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "baseline-input-disabled": {
    "demonstrates": [
      "Archived edition title displayed in a disabled field.",
      "Disabled state: the control is displayed without accepting interaction."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Try to activate or edit the disabled control; check that it keeps its value and communicates its state without enabling the action."
    ]
  },
  "baseline-input-file": {
    "demonstrates": [
      "Native file picker with a visible label.",
      "Native file picker; choosing a file does not start a remote upload."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "motion-input": {
    "demonstrates": [
      "Edit a short value with an associated label, help text, and validation."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "baseline-textarea-demo": {
    "demonstrates": [
      "Multiline HTML area using field-sizing: content."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "baseline-textarea-disabled": {
    "demonstrates": [
      "Multiline HTML area using field-sizing: content.",
      "Disabled state: the control is displayed without accepting interaction."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Try to activate or edit the disabled control; check that it keeps its value and communicates its state without enabling the action."
    ]
  },
  "baseline-textarea-with-label": {
    "demonstrates": [
      "Multiline HTML area using field-sizing: content.",
      "Visible label associated with the field."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "motion-textarea": {
    "demonstrates": [
      "Edit multiline text in a field sized to its content."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "baseline-label-demo": {
    "demonstrates": [
      "Visible name associated with a form control."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Activate the label, verify focus moves to its text field, then edit the sample value."
    ]
  },
  "baseline-field-demo": {
    "demonstrates": [
      "Composition of a label, control, and description, with no built-in form state manager."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "baseline-field-checkbox": {
    "demonstrates": [
      "Checkboxes with labels grouped under a legend, with no built-in form state manager.",
      "A field combining a label, help text, and selection control."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "baseline-field-responsive": {
    "demonstrates": [
      "Composition of a label, control, and description, with no built-in form state manager.",
      "Composition that adapts to the available space."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "baseline-input-group-demo": {
    "demonstrates": [
      "A search field with a leading icon, a result count, and a filtered list of sample prints."
    ],
    "limits": [
      "Search matches titles in the local sample list."
    ],
    "checks": [
      "Search for Patio, then a missing title, then clear the field. Check the count, result list, and input focus after clicking the leading icon."
    ]
  },
  "baseline-input-group-dropdown": {
    "demonstrates": [
      "A quantity field with an adjoining unit menu, an associated error, and a calculated sheet total."
    ],
    "limits": [
      "The example calculates a total locally using four sheets per section."
    ],
    "checks": [
      "Choose Four-sheet sections from the unit menu and verify the recalculated total. Enter a value outside 1–9,999, then clear the field and check that the error and stale total are removed."
    ]
  },
  "baseline-input-group-spinner": {
    "demonstrates": [
      "A search field with an inline loading indicator and a result region marked busy while the latest query is pending."
    ],
    "limits": [
      "The example filters the local sample list after a short debounce."
    ],
    "checks": [
      "Type two queries in quick succession and check that only the latest result appears. Clear a pending query and confirm that all sample results return."
    ]
  },
  "baseline-form-rhf-demo": {
    "demonstrates": [
      "React Hook Form integration with explicitly associated label, help text, and error.",
      "Form connected to React Hook Form and its validation messages."
    ],
    "limits": [
      "The example submission is simulated locally. Registration, authentication, email, passkeys, and form delivery require app services."
    ],
    "checks": [
      "Submit incomplete data, then valid data; check errors and the local response without assuming an account or real delivery exists."
    ]
  },
  "baseline-form-rhf-select": {
    "demonstrates": [
      "React Hook Form integration with explicitly associated label, help text, and error.",
      "Selection connected to form state and validation."
    ],
    "limits": [
      "The example submission is simulated locally. Registration, authentication, email, passkeys, and form delivery require app services."
    ],
    "checks": [
      "Submit incomplete data, then valid data; check errors and the local response without assuming an account or real delivery exists."
    ]
  },
  "baseline-form-rhf-checkbox": {
    "demonstrates": [
      "React Hook Form integration with explicitly associated label, help text, and error.",
      "Checkbox connected to form state and validation."
    ],
    "limits": [
      "The example submission is simulated locally. Registration, authentication, email, passkeys, and form delivery require app services."
    ],
    "checks": [
      "Submit incomplete data, then valid data; check errors and the local response without assuming an account or real delivery exists."
    ]
  },
  "baseline-checkbox-demo": {
    "demonstrates": [
      "Select both print sheets or edit each one. The group checkbox shows a mixed state when only one sheet is included."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Activate the group and individual controls by label and by keyboard. Check the mixed, checked, and unchecked states."
    ]
  },
  "baseline-checkbox-disabled": {
    "demonstrates": [
      "A checked, disabled checkbox for a filed print sheet."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Try to activate or edit the disabled control; check that it keeps its value and communicates its state without enabling the action."
    ]
  },
  "baseline-checkbox-with-text": {
    "demonstrates": [
      "Initially unchecked checkbox with a label and explanatory text."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Activate the checkbox through its label and with Space. Check that the assembly drawing description is associated with the control."
    ]
  },
  "motion-checkbox": {
    "demonstrates": [
      "Add or remove registration marks while the printed sheet stays in place."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Toggle via the visible label or Space. Check the mark, drawing, caption, and reduced-motion state."
    ]
  },
  "baseline-radio-group-demo": {
    "demonstrates": [
      "Select one of three fold patterns and update the matching crease diagram."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Select a fold by label or arrow key. Check the selected value, diagram, and Reset fold."
    ]
  },
  "motion-radio-group": {
    "demonstrates": [
      "Select a fold pattern and update its crease diagram while a single highlight follows the selected row."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Choose a fold by label or arrow key and reset the study. Check that the highlight follows the committed selection after resizing or enabling reduced motion."
    ]
  },
  "baseline-switch-demo": {
    "demonstrates": [
      "Show or hide the edition colophon with a labeled switch."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Change the state with Space and by activating the label; check focus, size, and accessible state.",
      "Compare its anatomy with the other variant; check the immediate response with reduced motion enabled."
    ]
  },
  "motion-switch": {
    "demonstrates": [
      "Show or hide crop marks on the plate. The thumb stretches on press and when the checked state changes."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Change the state with Space and by activating the label; check focus, size, and accessible state.",
      "Compare its anatomy with the other variant; check the immediate response with reduced motion enabled."
    ]
  },
  "baseline-slider-demo": {
    "demonstrates": [
      "Adjust print ink coverage from 0 to 100 percent and read the current value."
    ],
    "limits": [
      "Changes adjust local values; applying the range to real queries or devices is the app’s responsibility."
    ],
    "checks": [
      "Move the controls to both limits and use the supported keys; check the value, step, and visible range."
    ]
  },
  "motion-slider": {
    "demonstrates": [
      "Set the paper margin in millimetres with a marked scale and a value bubble. The printable area and diagram update with the selected margin."
    ],
    "limits": [
      "Changes adjust local values; applying the range to real queries or devices is the app’s responsibility."
    ],
    "checks": [
      "Move the controls to both limits and use the supported keys; check the value, step, and visible range."
    ]
  },
  "baseline-select-demo": {
    "demonstrates": [
      "Choose an option from a dropdown list."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "baseline-select-scrollable": {
    "demonstrates": [
      "Choose an option from a dropdown list.",
      "List that overflows and allows scrolling."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "motion-select": {
    "demonstrates": [
      "Choose an option from a defined set."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "baseline-native-select-demo": {
    "demonstrates": [
      "Native HTML selection with a decorative icon."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "baseline-native-select-groups": {
    "demonstrates": [
      "Native HTML selection with a decorative icon.",
      "Options organized into groups."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "baseline-native-select-invalid": {
    "demonstrates": [
      "Native HTML selection with a decorative icon.",
      "Explicit display of an invalid value."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "baseline-native-select-disabled": {
    "demonstrates": [
      "Native HTML selection with a decorative icon.",
      "Disabled state: the control is displayed without accepting interaction."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Try to activate or edit the disabled control; check that it keeps its value and communicates its state without enabling the action."
    ]
  },
  "baseline-input-otp-demo": {
    "demonstrates": [
      "Enter a six-character proof reference in one field with two visible groups of three slots."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Enter and delete characters. Check the field name, help text, and all six positions."
    ]
  },
  "baseline-input-otp-controlled": {
    "demonstrates": [
      "Enter letters, digits, or punctuation and read the current print reference. Clear reference empties the value and returns focus to the field."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Enter and clear a code; check the accessible name and the state that reflects its value."
    ]
  },
  "baseline-input-otp-pattern": {
    "demonstrates": [
      "Enter up to six ASCII letters or digits. The field rejects punctuation."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Enter and clear an alphanumeric code; check the accessible name and input pattern."
    ]
  },
  "motion-otp-input": {
    "demonstrates": [
      "Type or paste a six-digit worksheet code. The sample selects worksheet 731408 and shows an error for other complete codes."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Enter an incorrect complete code, then 731408. Check the error, selected worksheet, slot focus, and clearing behavior."
    ]
  },
  "baseline-combobox-demo": {
    "demonstrates": [
      "Searchable selector with single selection in local state."
    ],
    "limits": [
      "The list uses local options; remote search, permissions, and external actions are the consumer’s responsibility."
    ],
    "checks": [
      "Search for an option, select it with the keyboard, and close with Escape; check the local text or result."
    ]
  },
  "baseline-combobox-responsive": {
    "demonstrates": [
      "Searchable selector with single selection in local state.",
      "Uses a Popover on desktop and a Drawer on mobile."
    ],
    "limits": [
      "The list uses local options; remote search, permissions, and external actions are the consumer’s responsibility."
    ],
    "checks": [
      "Search for an option, select it with the keyboard, and close with Escape; check the local text or result."
    ]
  },
  "baseline-combobox-dropdown-menu": {
    "demonstrates": [
      "An action menu opens a dialog to search and assign one paper label."
    ],
    "limits": [
      "The list uses local options; remote search, permissions, and external actions are the consumer’s responsibility."
    ],
    "checks": [
      "Open Assign a paper label from the action menu, filter the dialog, and choose a label. Verify focus returns to Record actions. Reopen and press Escape, then clear the label from the menu."
    ]
  },
  "motion-combobox": {
    "demonstrates": [
      "Search and select an option from a list."
    ],
    "limits": [
      "The list uses local options; remote search, permissions, and external actions are the consumer’s responsibility."
    ],
    "checks": [
      "Search for an option, select it with the keyboard, and close with Escape; check the local text or result."
    ]
  },
  "baseline-calendar-demo": {
    "demonstrates": [
      "Calendar composed with DayPicker. The date picker uses Popover composition; it is not an additional API."
    ],
    "limits": [
      "Selection uses sample dates; it does not query bookings, availability, or business time-zone rules."
    ],
    "checks": [
      "Change the month and select a date; for ranges, check the start, end, and their display."
    ]
  },
  "baseline-date-picker-demo": {
    "demonstrates": [
      "A Popover calendar selects a bindery date and displays it in the trigger."
    ],
    "limits": [
      "Selection uses sample dates; it does not query bookings, availability, or business time-zone rules."
    ],
    "checks": [
      "Open the calendar by keyboard, choose a day, and check that the trigger regains focus and shows the selected date."
    ]
  },
  "baseline-date-picker-with-range": {
    "demonstrates": [
      "A two-month Popover calendar edits the start and end of a production window."
    ],
    "limits": [
      "Selection uses sample dates; it does not query bookings, availability, or business time-zone rules."
    ],
    "checks": [
      "Choose both endpoints. Check the trigger and status as the range changes, then dismiss the calendar."
    ]
  },
  "baseline-date-picker-with-presets": {
    "demonstrates": [
      "Workshop milestone presets and calendar days update the same date."
    ],
    "limits": [
      "Selection uses sample dates; it does not query bookings, availability, or business time-zone rules."
    ],
    "checks": [
      "Choose a preset and check the calendar selection. Choose a different day and check that the preset clears."
    ]
  },
  "motion-calendar": {
    "demonstrates": [
      "Select a day using month navigation and the keyboard."
    ],
    "limits": [
      "Selection uses sample dates; it does not query bookings, availability, or business time-zone rules."
    ],
    "checks": [
      "Change the month and select a date; for ranges, check the start, end, and their display."
    ]
  },
  "baseline-accordion-demo": {
    "demonstrates": [
      "Expandable sections with headings and content regions."
    ],
    "limits": [
      "Content is sample data; opening a section does not fetch remote content or persist read state."
    ],
    "checks": [
      "Open and close the available content; verify that the control indicates which section is active."
    ]
  },
  "motion-accordion": {
    "demonstrates": [
      "Groups answers or secondary information that can be opened without leaving the page."
    ],
    "limits": [
      "Content is sample data; opening a section does not fetch remote content or persist read state."
    ],
    "checks": [
      "Open and close the available content; verify that the control indicates which section is active."
    ]
  },
  "baseline-collapsible-demo": {
    "demonstrates": [
      "Content region opened and closed by a control."
    ],
    "limits": [
      "Content is sample data; opening a section does not fetch remote content or persist read state."
    ],
    "checks": [
      "Open and close the available content; verify that the control indicates which section is active."
    ]
  },
  "baseline-tabs-demo": {
    "demonstrates": [
      "Alternative panels with immediate content changes; triggers retain their style transition.",
      "Paper and Press each have a required field and save a print note in the preview."
    ],
    "limits": [
      "Print notes are stored in the current preview session."
    ],
    "checks": [
      "Navigate Paper and Press with the arrow keys, Home/End, and Tab. Check the active panel, required field validation, and saved note."
    ]
  },
  "motion-tabs": {
    "demonstrates": [
      "Switches between the Stock, Ink, and Imposition studies with a moving selection indicator and panel transition."
    ],
    "limits": [
      "The panels contain local print studies."
    ],
    "checks": [
      "Navigate the views with the keyboard; check the current panel, focus, and reduced-motion behavior during the transition."
    ]
  },
  "baseline-breadcrumb-demo": {
    "demonstrates": [
      "A local archive path with a current location, a root action, and collapsed ancestors in a menu."
    ],
    "limits": [
      "Archive actions update the preview’s local location."
    ],
    "checks": [
      "Open the ancestor menu at wide and narrow widths. Check dismissal focus, then choose an ancestor and verify the new location and heading focus."
    ]
  },
  "baseline-breadcrumb-responsive": {
    "demonstrates": [
      "A local archive path with collapsed ancestors in a menu on wide viewports and a drawer on narrow viewports."
    ],
    "limits": [
      "Archive actions update the preview’s local location. The ancestor surface is chosen when it opens."
    ],
    "checks": [
      "Open the ancestor choices at wide and narrow widths. Verify dismissal focus and heading focus after selecting an ancestor."
    ]
  },
  "motion-breadcrumb": {
    "demonstrates": [
      "Animates the path as users move between the archive, River atlas, and plate studies."
    ],
    "limits": [
      "The path and study details use local sample data."
    ],
    "checks": [
      "Move up the path and reopen a plate. Check the current location, heading focus, and behavior at a narrow width and with reduced motion."
    ]
  },
  "baseline-navigation-menu-demo": {
    "demonstrates": [
      "Navigation with links and dropdown panels."
    ],
    "limits": [
      "Destinations and actions belong to the sample; the app connects real routing, sessions, and permissions."
    ],
    "checks": [
      "Navigate the available links and controls; check the local response and behavior at a narrow width."
    ]
  },
  "baseline-pagination-demo": {
    "demonstrates": [
      "Pagination for a local sample collection, with the active page and previous/next controls."
    ],
    "limits": [
      "Destinations and actions belong to the sample; the app connects real routing, sessions, and permissions."
    ],
    "checks": [
      "Navigate the available links and controls; check the local response and behavior at a narrow width."
    ]
  },
  "motion-pagination": {
    "demonstrates": [
      "Divides a collection into pages with explicit position and navigation."
    ],
    "limits": [
      "Destinations and actions belong to the sample; the app connects real routing, sessions, and permissions."
    ],
    "checks": [
      "Navigate the available links and controls; check the local response and behavior at a narrow width."
    ]
  },
  "baseline-sidebar-demo": {
    "demonstrates": [
      "Sidebar navigation with desktop opening managed internally by the provider; includes mobile mode, groups, and a menu."
    ],
    "limits": [
      "Destinations and actions belong to the sample; the app connects real routing, sessions, and permissions."
    ],
    "checks": [
      "Navigate the available links and controls; check the local response and behavior at a narrow width."
    ]
  },
  "baseline-sidebar-controlled": {
    "demonstrates": [
      "Sidebar navigation with a provider, mobile mode, groups, and a menu.",
      "Desktop opening is controlled through the provider’s open and onOpenChange; mobile opening remains internal."
    ],
    "limits": [
      "Destinations and actions belong to the sample; the app connects real routing, sessions, and permissions."
    ],
    "checks": [
      "Navigate the available links and controls; check the local response and behavior at a narrow width."
    ]
  },
  "baseline-dialog-demo": {
    "demonstrates": [
      "Modal dialog with a title, description, and related actions."
    ],
    "limits": [
      "The surface presents sample content and actions; confirming or choosing an option does not run an external operation."
    ],
    "checks": [
      "Open from its trigger, navigate the content with the keyboard, and check dismissal and focus return for the surface type."
    ]
  },
  "baseline-dialog-close-button": {
    "demonstrates": [
      "Modal dialog with a title, description, and related actions.",
      "Close button included inside the dialog."
    ],
    "limits": [
      "The surface presents sample content and actions; confirming or choosing an option does not run an external operation."
    ],
    "checks": [
      "Open from its trigger, navigate the content with the keyboard, and check dismissal and focus return for the surface type."
    ]
  },
  "motion-dialog": {
    "demonstrates": [
      "Requests a brief decision in a modal surface with a title and description."
    ],
    "limits": [
      "The surface presents sample content and actions; confirming or choosing an option does not run an external operation."
    ],
    "checks": [
      "Open from its trigger, navigate the content with the keyboard, and check dismissal and focus return for the surface type."
    ]
  },
  "baseline-alert-dialog-demo": {
    "demonstrates": [
      "Modal confirmation for a decision that requires an explicit response."
    ],
    "limits": [
      "The surface presents sample content and actions; confirming or choosing an option does not run an external operation."
    ],
    "checks": [
      "Open from its trigger, navigate the content with the keyboard, and check dismissal and focus return for the surface type."
    ]
  },
  "baseline-sheet-demo": {
    "demonstrates": [
      "Dialog panel that opens from a screen edge."
    ],
    "limits": [
      "The surface presents sample content and actions; confirming or choosing an option does not run an external operation."
    ],
    "checks": [
      "At 320 px wide and 330 px tall, reach every field and Save by scrolling without clipping the title or close control.",
      "Open with focus in the panel, tab through the fields, and close with Escape, the overlay, or the button. Check focus return and local saving."
    ]
  },
  "baseline-sheet-side": {
    "demonstrates": [
      "Dialog panel that opens from a screen edge.",
      "Choose the edge from which the panel appears; the form scrolls when height is limited."
    ],
    "limits": [
      "The surface presents sample content and actions; confirming or choosing an option does not run an external operation."
    ],
    "checks": [
      "At 320 px wide and 330 px tall, reach every field and Save by scrolling without clipping the title or close control.",
      "Open with focus in the panel, tab through the fields, and close with Escape, the overlay, or the button. Check focus return and local saving."
    ]
  },
  "baseline-drawer-demo": {
    "demonstrates": [
      "Draggable panel built on Vaul, composed similarly to Dialog."
    ],
    "limits": [
      "The surface presents sample content and actions; confirming or choosing an option does not run an external operation."
    ],
    "checks": [
      "Open from its trigger, navigate the content with the keyboard, and check dismissal and focus return for the surface type."
    ]
  },
  "baseline-drawer-dialog": {
    "demonstrates": [
      "Draggable panel built on Vaul, composed similarly to Dialog.",
      "Task composition in a dialog surface."
    ],
    "limits": [
      "The surface presents sample content and actions; confirming or choosing an option does not run an external operation."
    ],
    "checks": [
      "Open from its trigger, navigate the content with the keyboard, and check dismissal and focus return for the surface type."
    ]
  },
  "motion-drawer": {
    "demonstrates": [
      "Shows details or a secondary task in a side panel while preserving context."
    ],
    "limits": [
      "The surface presents sample content and actions; confirming or choosing an option does not run an external operation."
    ],
    "checks": [
      "Open from its trigger, navigate the content with the keyboard, and check dismissal and focus return for the surface type."
    ]
  },
  "baseline-popover-demo": {
    "demonstrates": [
      "An anchored panel with checkbox controls for the grain arrow and trim corners on the proof."
    ],
    "limits": [
      "The checkbox values change the preview drawing."
    ],
    "checks": [
      "Open Print marks with the keyboard, toggle a mark, then dismiss with Escape and check focus return."
    ]
  },
  "motion-popover": {
    "demonstrates": [
      "An anchored panel with a nested Select for ink passes. The proof and impression count follow the selected value."
    ],
    "limits": [
      "The calculation uses a local sample of 60 sheets."
    ],
    "checks": [
      "Open Ink passes, change the nested Select, and verify the preview. Dismiss the panel and check focus return."
    ]
  },
  "baseline-hover-card-demo": {
    "demonstrates": [
      "Author details shown when hovering over or focusing the About the author link."
    ],
    "limits": [
      "The portfolio link is a separate destination."
    ],
    "checks": [
      "Hover or focus About the author and check that the preview appears without moving focus from the link."
    ]
  },
  "motion-hover-card": {
    "demonstrates": [
      "A read-only preview of the plate's process, matrix, paper and trim."
    ],
    "limits": [
      "The specifications are local sample data."
    ],
    "checks": [
      "Hover or focus the plate reference, dismiss with Escape, and check the preview when reduced motion is enabled."
    ]
  },
  "baseline-tooltip-demo": {
    "demonstrates": [
      "Action help on hover or focus that follows the current shortlist state."
    ],
    "limits": [
      "Keep proof updates the local shortlist."
    ],
    "checks": [
      "Focus the button to see its help. Toggle the shortlist and verify that the new help describes the reverse action."
    ]
  },
  "motion-tooltip": {
    "demonstrates": [
      "A delayed tooltip without an arrow that clarifies the Crop marks control."
    ],
    "limits": [
      "The control changes the crop guides in the local drawing."
    ],
    "checks": [
      "Hover or focus Crop marks for the description, dismiss it with Escape, then toggle the crop guides."
    ]
  },
  "baseline-dropdown-menu-demo": {
    "demonstrates": [
      "Action menu opened by a button."
    ],
    "limits": [
      "The surface presents sample content and actions; confirming or choosing an option does not run an external operation."
    ],
    "checks": [
      "Open from its trigger, navigate the content with the keyboard, and check dismissal and focus return for the surface type."
    ]
  },
  "baseline-dropdown-menu-checkboxes": {
    "demonstrates": [
      "Action menu opened by a button.",
      "Menu options with independent selection."
    ],
    "limits": [
      "The surface presents sample content and actions; confirming or choosing an option does not run an external operation."
    ],
    "checks": [
      "Open from its trigger, navigate the content with the keyboard, and check dismissal and focus return for the surface type."
    ]
  },
  "baseline-dropdown-menu-radio-group": {
    "demonstrates": [
      "Action menu opened by a button.",
      "Mutually exclusive options."
    ],
    "limits": [
      "The surface presents sample content and actions; confirming or choosing an option does not run an external operation."
    ],
    "checks": [
      "Open from its trigger, navigate the content with the keyboard, and check dismissal and focus return for the surface type."
    ]
  },
  "motion-dropdown-menu": {
    "demonstrates": [
      "Place secondary actions behind an explicit trigger."
    ],
    "limits": [
      "The surface presents sample content and actions; confirming or choosing an option does not run an external operation."
    ],
    "checks": [
      "Open from its trigger, navigate the content with the keyboard, and check dismissal and focus return for the surface type."
    ]
  },
  "baseline-context-menu-demo": {
    "demonstrates": [
      "Action menu for an item, opened with a right-click."
    ],
    "limits": [
      "The surface presents sample content and actions; confirming or choosing an option does not run an external operation."
    ],
    "checks": [
      "Open from its trigger, navigate the content with the keyboard, and check dismissal and focus return for the surface type."
    ]
  },
  "motion-context-menu": {
    "demonstrates": [
      "Offer actions for an object through click, right-click, or keyboard."
    ],
    "limits": [
      "The surface presents sample content and actions; confirming or choosing an option does not run an external operation."
    ],
    "checks": [
      "Open from its trigger, navigate the content with the keyboard, and check dismissal and focus return for the surface type."
    ]
  },
  "baseline-menubar-demo": {
    "demonstrates": [
      "Persistent application bar of menus and actions."
    ],
    "limits": [
      "The surface presents sample content and actions; confirming or choosing an option does not run an external operation."
    ],
    "checks": [
      "Open from its trigger, navigate the content with the keyboard, and check dismissal and focus return for the surface type."
    ]
  },
  "baseline-command-demo": {
    "demonstrates": [
      "Command list with search, filtering, and navigation managed by cmdk."
    ],
    "limits": [
      "The list uses local options; remote search, permissions, and external actions are the consumer’s responsibility."
    ],
    "checks": [
      "Search for an option and select it with the keyboard; check the local destination. The list stays visible."
    ]
  },
  "baseline-command-dialog": {
    "demonstrates": [
      "Command list with search, filtering, and navigation managed by cmdk.",
      "Action search mounted inside a dialog."
    ],
    "limits": [
      "The list uses local options; remote search, permissions, and external actions are the consumer’s responsibility."
    ],
    "checks": [
      "Search for an option, select it with the keyboard, and close with Escape; check the local text or result."
    ]
  },
  "motion-command-palette": {
    "demonstrates": [
      "Search for grouped actions on the page, navigable with arrows, Enter, and Escape."
    ],
    "limits": [
      "The list uses local options; remote search, permissions, and external actions are the consumer’s responsibility."
    ],
    "checks": [
      "Search for an option, select it with the keyboard, and close with Escape; check the local text or result."
    ]
  },
  "baseline-alert-demo": {
    "demonstrates": [
      "Inline notices: two states with role=status and one error with role=alert."
    ],
    "limits": [
      "Notices and states use local demo data; they do not reflect a remote operation or a synchronized inbox."
    ],
    "checks": [
      "When a control is available, activate the example; check the initial state, visible change, and any dismissal or recovery it offers."
    ]
  },
  "baseline-alert-destructive": {
    "demonstrates": [
      "Inline message with role=alert and visual variants.",
      "Visual tone for a destructive action or state."
    ],
    "limits": [
      "Notices and states use local demo data; they do not reflect a remote operation or a synchronized inbox."
    ],
    "checks": [
      "When a control is available, activate the example; check the initial state, visible change, and any dismissal or recovery it offers."
    ]
  },
  "motion-alert": {
    "demonstrates": [
      "Keeps a situation visible when it needs an explanation or user response."
    ],
    "limits": [
      "Reconnect changes the sample’s local state; it does not start a real sync."
    ],
    "checks": [
      "Activate Reconnect and check the transition from notice to confirmation."
    ]
  },
  "baseline-sonner-demo": {
    "demonstrates": [
      "Archive or restore Patio / 07. The persistent notice offers Undo and updates the local edition tray."
    ],
    "limits": [
      "Notices and states use local demo data; they do not reflect a remote operation or a synchronized inbox."
    ],
    "checks": [
      "Archive the edition, activate Undo from the notice, and check the restored tray and trigger focus."
    ]
  },
  "baseline-sonner-types": {
    "demonstrates": [
      "Open edition details, proof confirmation, packing information, stock warning, reference recovery, and an asynchronous font check."
    ],
    "limits": [
      "Notices and states use local demo data; they do not reflect a remote operation or a synchronized inbox."
    ],
    "checks": [
      "Check the six notice actions, recover the missing reference, and dismiss a notice using its close button."
    ]
  },
  "motion-toast-stack": {
    "demonstrates": [
      "Record local proof checks in a notice stack. Undo updates the selected notice and decrements the count. Dismiss all clears the notices."
    ],
    "limits": [
      "Notices and states use local demo data; they do not reflect a remote operation or a synchronized inbox."
    ],
    "checks": [
      "Record several checks, undo a notice, and dismiss the stack. Verify that the local check count and the open notice count reflect their separate actions."
    ]
  },
  "baseline-progress-demo": {
    "demonstrates": [
      "The determinate bar follows three proof checks and shows the number completed."
    ],
    "limits": [
      "Checkbox changes affect the local proof checklist."
    ],
    "checks": [
      "Complete all three checks, then clear one. Verify that the bar and count follow both changes."
    ]
  },
  "motion-progress": {
    "demonstrates": [
      "The fill and percentage animate together as cover checks change. A check appears at completion."
    ],
    "limits": [
      "The three checklist items belong to the local cover proof."
    ],
    "checks": [
      "Complete the checklist and reopen one item. Compare the visual bar with the accessible value and repeat with reduced motion."
    ]
  },
  "baseline-spinner-demo": {
    "demonstrates": [
      "Lucide Loader2 icon with a spin animation and status semantics."
    ],
    "limits": [
      "The indicator is a visual sample; it does not initiate a payment."
    ],
    "checks": [
      "Check that the indicator has a status name and appears beside the amount."
    ]
  },
  "baseline-spinner-size": {
    "demonstrates": [
      "Lucide Loader2 icon with a spin animation and status semantics.",
      "Comparison of the sizes included in this sample."
    ],
    "limits": [
      "The sizes compare indicators; they do not represent active operations."
    ],
    "checks": [
      "Compare all four sizes and check their status name."
    ]
  },
  "baseline-spinner-button": {
    "demonstrates": [
      "Lucide Loader2 icon with a spin animation and status semantics.",
      "Waiting indicator integrated into a button."
    ],
    "limits": [
      "The buttons remain disabled; they do not start an operation."
    ],
    "checks": [
      "Check the visible indicators and the three disabled buttons."
    ]
  },
  "baseline-skeleton-demo": {
    "demonstrates": [
      "Static visual loading block."
    ],
    "limits": [
      "The structure is a fixed sample; it does not replace content when loading ends."
    ],
    "checks": [
      "Check the reserved avatar and two lines of content."
    ]
  },
  "baseline-skeleton-card": {
    "demonstrates": [
      "Static visual loading block.",
      "Visual placeholder with a card structure."
    ],
    "limits": [
      "The structure is a fixed sample; it does not replace content when loading ends."
    ],
    "checks": [
      "Check the reserved image and two lines of content."
    ]
  },
  "motion-skeleton": {
    "demonstrates": [
      "Reserves the visual structure while a local content block loads and can reveal that content."
    ],
    "limits": [
      "The placeholder pulses for a bounded number of cycles; returning to it starts the pulse again. No remote operation is performed."
    ],
    "checks": [
      "Reveal the cover and restore the placeholder; check the state change and reduced-motion behavior."
    ]
  },
  "baseline-badge-demo": {
    "demonstrates": [
      "Visual status or category label; can be composed as a link through Slot."
    ],
    "limits": [
      "The static Badge does not receive focus; asChild preserves the semantics of the supplied link."
    ],
    "checks": [
      "Check that the text communicates the state without relying on color."
    ]
  },
  "baseline-badge-secondary": {
    "demonstrates": [
      "Visual status or category label; can be composed as a link through Slot.",
      "Secondary visual emphasis."
    ],
    "limits": [
      "The static Badge does not receive focus; asChild preserves the semantics of the supplied link."
    ],
    "checks": [
      "Check that the text communicates the state without relying on color."
    ]
  },
  "baseline-badge-outline": {
    "demonstrates": [
      "Visual status or category label; can be composed as a link through Slot.",
      "Outlined appearance."
    ],
    "limits": [
      "The static Badge does not receive focus; asChild preserves the semantics of the supplied link."
    ],
    "checks": [
      "Check that the text communicates the state without relying on color."
    ]
  },
  "baseline-badge-destructive": {
    "demonstrates": [
      "Visual status or category label; can be composed as a link through Slot.",
      "Visual tone for a destructive action or state."
    ],
    "limits": [
      "The static Badge does not receive focus; asChild preserves the semantics of the supplied link."
    ],
    "checks": [
      "Check that the text communicates the state without relying on color."
    ]
  },
  "motion-badge": {
    "demonstrates": [
      "Expresses a brief state with text, tone, and an optional icon.",
      "Approve review changes the local state to Approved; Reset review returns it to In review. The pill changes within reserved space without shifting its neighbors or the action."
    ],
    "limits": [
      "Approve and reset only change the review state in this preview."
    ],
    "checks": [
      "Toggle Approve review and Reset review with click, Enter, and Space. Check that the button, other badges, and frame keep their position and height during the change, at each density and near a line wrap."
    ]
  },
  "baseline-empty-demo": {
    "demonstrates": [
      "Empty-content composition with a title, description, icon, and actions."
    ],
    "limits": [
      "Projects are saved only in the sample’s local list."
    ],
    "checks": [
      "Create a project and remove it to restore the empty state."
    ]
  },
  "baseline-empty-input-group": {
    "demonstrates": [
      "Empty state with a search field and results from a sample catalog."
    ],
    "limits": [
      "Search uses five local destinations; it does not query the full catalog."
    ],
    "checks": [
      "Search for a name and check the result and its link."
    ]
  },
  "motion-empty-state": {
    "demonstrates": [
      "Explains why a region has no content and offers a next step."
    ],
    "limits": [
      "Notices and states use local demo data; they do not reflect a remote operation or a synchronized inbox."
    ],
    "checks": [
      "When a control is available, activate the example; check the initial state, visible change, and any dismissal or recovery it offers."
    ]
  },
  "baseline-card-demo": {
    "demonstrates": [
      "Container composed of content, heading, action, and footer."
    ],
    "limits": [
      "The form validates email locally; it does not start a session."
    ],
    "checks": [
      "Submit the empty form, then a valid email; check validation and the visible state."
    ]
  },
  "baseline-card-with-form": {
    "demonstrates": [
      "Container composed of content, heading, action, and footer.",
      "Card containing a form’s fields and actions."
    ],
    "limits": [
      "The project is saved in the card’s local state."
    ],
    "checks": [
      "Enter a name and framework, save, and check the displayed values."
    ]
  },
  "motion-card": {
    "demonstrates": [
      "Groups a piece of content with its metadata and related actions."
    ],
    "limits": [
      "The save action and expanded view are independent."
    ],
    "checks": [
      "Open and close the expanded view; change Save without losing the card content."
    ]
  },
  "baseline-item-demo": {
    "demonstrates": [
      "Row with content and a button; another row uses a link as the entire element."
    ],
    "limits": [
      "The button and link are illustrative; the app connects their destinations and actions."
    ],
    "checks": [
      "Tab through the button and link; check that their names identify each row’s content."
    ]
  },
  "baseline-item-variant": {
    "demonstrates": [
      "Rows with content and actions for comparing surfaces.",
      "Comparison of visual treatments for a row."
    ],
    "limits": [
      "The row itself is not interactive; focus belongs to its buttons."
    ],
    "checks": [
      "Tab through the actions and check that each action’s name identifies its row."
    ]
  },
  "baseline-avatar-demo": {
    "demonstrates": [
      "Visual identity using images, initials, and avatar groups."
    ],
    "limits": [
      "Image and presence are supplied values; the avatar does not check a person’s availability."
    ],
    "checks": [
      "Check the image and fallback initials; preserve the accessible name if the image fails to load."
    ]
  },
  "motion-avatar": {
    "demonstrates": [
      "Shows avatars with sample images in three sizes and optional presence."
    ],
    "limits": [
      "Image and presence are supplied values; the avatar does not check a person’s availability."
    ],
    "checks": [
      "Check the image and fallback initials; preserve the accessible name if the image fails to load."
    ]
  },
  "motion-avatar-group": {
    "demonstrates": [
      "Summarizes team members and indicates how many are not shown.",
      "Grouped identities and overflow count."
    ],
    "limits": [
      "Image and presence are supplied values; the avatar does not check a person’s availability."
    ],
    "checks": [
      "Check the image and fallback initials; preserve the accessible name if the image fails to load."
    ]
  },
  "motion-avatar-sizes": {
    "demonstrates": [
      "Shows the same sample image in four sizes."
    ],
    "limits": [
      "Image and presence are supplied values; the avatar does not check a person’s availability."
    ],
    "checks": [
      "Compare all four sizes and verify that each avatar retains its accessible name."
    ]
  },
  "motion-avatar-presence": {
    "demonstrates": [
      "Shows presence states and allows toggling between online and offline."
    ],
    "limits": [
      "Image and presence are supplied values; the avatar does not check a person’s availability."
    ],
    "checks": [
      "Toggle the state and check the indicator and announced text."
    ]
  },
  "motion-avatar-initials": {
    "demonstrates": [
      "Represents people with initials and optional presence."
    ],
    "limits": [
      "Image and presence are supplied values; the avatar does not check a person’s availability."
    ],
    "checks": [
      "Check the people’s initials and names."
    ]
  },
  "baseline-aspect-ratio-demo": {
    "demonstrates": [
      "Container that maintains a width-to-height ratio."
    ],
    "limits": [
      "The ratio follows the container width; the image keeps its crop through object-fit."
    ],
    "checks": [
      "Change the width and check that the configured ratio is preserved."
    ]
  },
  "baseline-separator-demo": {
    "demonstrates": [
      "A named horizontal separator divides the edition details from two decorative vertical separators within the metadata row."
    ],
    "limits": [
      "The separator does not receive focus or perform actions. decorative determines whether it is exposed to assistive technology."
    ],
    "checks": [
      "Verify that the named horizontal separator is exposed and the two vertical dividers are hidden from assistive technology."
    ]
  },
  "baseline-scroll-area-demo": {
    "demonstrates": [
      "Content list with vertical scrolling and custom scrollbars."
    ],
    "limits": [
      "Interaction reorders or scrolls local content; saving the order and acting on remote records are the app’s responsibility."
    ],
    "checks": [
      "Use the visible controls and available keyboard alternative; check the boundaries and content outside the viewport."
    ]
  },
  "baseline-scroll-area-horizontal-demo": {
    "demonstrates": [
      "Scrollable content area with custom scrollbars.",
      "Horizontal content scrolling."
    ],
    "limits": [
      "Interaction reorders or scrolls local content; saving the order and acting on remote records are the app’s responsibility."
    ],
    "checks": [
      "Use the visible controls and available keyboard alternative; check the boundaries and content outside the viewport."
    ]
  },
  "motion-scroll-area": {
    "demonstrates": [
      "Contains scrollable content in a region with a clear name and boundaries."
    ],
    "limits": [
      "Interaction reorders or scrolls local content; saving the order and acting on remote records are the app’s responsibility."
    ],
    "checks": [
      "Use the visible controls and available keyboard alternative; check the boundaries and content outside the viewport."
    ]
  },
  "baseline-resizable-demo": {
    "demonstrates": [
      "Nested panes stack vertically below 36rem of available width; splitters resize along the current axis.",
      "Composition of Group, Panel, and Separator from react-resizable-panels."
    ],
    "limits": [
      "Interaction reorders or scrolls local content; saving the order and acting on remote records are the app’s responsibility."
    ],
    "checks": [
      "Use the visible controls and available keyboard alternative; check the boundaries and content outside the viewport."
    ]
  },
  "baseline-resizable-demo-with-handle": {
    "demonstrates": [
      "Nested panes stack vertically below 36rem of available width; splitters resize along the current axis.",
      "Composition of Group, Panel, and Separator from react-resizable-panels.",
      "Separator with a visible handle."
    ],
    "limits": [
      "Interaction reorders or scrolls local content; saving the order and acting on remote records are the app’s responsibility."
    ],
    "checks": [
      "Use the visible controls and available keyboard alternative; check the boundaries and content outside the viewport."
    ]
  },
  "baseline-resizable-vertical": {
    "demonstrates": [
      "Composition of Group, Panel, and Separator from react-resizable-panels.",
      "Vertical panel layout."
    ],
    "limits": [
      "Interaction reorders or scrolls local content; saving the order and acting on remote records are the app’s responsibility."
    ],
    "checks": [
      "Use the visible controls and available keyboard alternative; check the boundaries and content outside the viewport."
    ]
  },
  "motion-resizable-panels": {
    "demonstrates": [
      "Distributes space between related panels using separators."
    ],
    "limits": [
      "Interaction reorders or scrolls local content; saving the order and acting on remote records are the app’s responsibility."
    ],
    "checks": [
      "Use the visible controls and available keyboard alternative; check the boundaries and content outside the viewport."
    ]
  },
  "baseline-carousel-demo": {
    "demonstrates": [
      "Embla-based carousel with previous/next controls and access to its API."
    ],
    "limits": [
      "Interaction reorders or scrolls local content; saving the order and acting on remote records are the app’s responsibility."
    ],
    "checks": [
      "Use the visible controls and available keyboard alternative; check the boundaries and content outside the viewport."
    ]
  },
  "baseline-carousel-size": {
    "demonstrates": [
      "Embla-based carousel with previous/next controls and access to its API.",
      "Comparison of the sizes included in this sample."
    ],
    "limits": [
      "Interaction reorders or scrolls local content; saving the order and acting on remote records are the app’s responsibility."
    ],
    "checks": [
      "Use the visible controls and available keyboard alternative; check the boundaries and content outside the viewport."
    ]
  },
  "baseline-carousel-orientation": {
    "demonstrates": [
      "Embla-based carousel with previous/next controls and access to its API.",
      "Layout follows the orientation selected in the example."
    ],
    "limits": [
      "Interaction reorders or scrolls local content; saving the order and acting on remote records are the app’s responsibility."
    ],
    "checks": [
      "Use the visible controls and available keyboard alternative; check the boundaries and content outside the viewport."
    ]
  },
  "baseline-carousel-api": {
    "demonstrates": [
      "Embla-based carousel with previous/next controls and access to its API.",
      "Example controls connected to the carousel API."
    ],
    "limits": [
      "Interaction reorders or scrolls local content; saving the order and acting on remote records are the app’s responsibility."
    ],
    "checks": [
      "Use the visible controls and available keyboard alternative; check the boundaries and content outside the viewport."
    ]
  },
  "motion-carousel": {
    "demonstrates": [
      "Navigate a collection of visual items with position context."
    ],
    "limits": [
      "Interaction reorders or scrolls local content; saving the order and acting on remote records are the app’s responsibility."
    ],
    "checks": [
      "Use the visible controls and available keyboard alternative; check the boundaries and content outside the viewport."
    ]
  },
  "baseline-table-demo": {
    "demonstrates": [
      "HTML table elements with styling and a horizontal overflow container."
    ],
    "limits": [
      "The table shows static local invoices; it has no filtering, sorting, or selection."
    ],
    "checks": [
      "Check headers and related cells; verify readability in a narrow viewport."
    ]
  },
  "baseline-data-table-demo": {
    "demonstrates": [
      "HTML table elements with styling and a horizontal overflow container.",
      "Composed table with the example’s data tools."
    ],
    "limits": [
      "Rows and actions are local; they do not query or modify an external service."
    ],
    "checks": [
      "Filter by email, sort a column, and select rows; check the result in a narrow viewport."
    ]
  },
  "baseline-chart-bar-interactive": {
    "demonstrates": [
      "Container, tooltip, and series controls for Recharts charts; the useChartMotion adapter applies the data role and reduced-motion preference.",
      "Bar comparison with selection of the visible series."
    ],
    "limits": [
      "Values are fixed sample data; the chart does not fetch real metrics or verify the statistical quality of supplied data."
    ],
    "checks": [
      "Check labels, units, and legend; explore available points or controls and compare the result with the sample data."
    ]
  },
  "baseline-chart-area-interactive": {
    "demonstrates": [
      "Container, tooltip, and legend for Recharts charts; the useChartMotion adapter applies the data role and reduced-motion preference.",
      "Area chart with selection of the visible range."
    ],
    "limits": [
      "Values are fixed sample data; the chart does not fetch real metrics or verify the statistical quality of supplied data."
    ],
    "checks": [
      "Check labels, units, and legend; explore available points or controls and compare the result with the sample data."
    ]
  },
  "baseline-chart-line-interactive": {
    "demonstrates": [
      "Container, tooltip, and series controls for Recharts charts; the useChartMotion adapter applies the data role and reduced-motion preference.",
      "Line chart with selection of the visible series."
    ],
    "limits": [
      "Values are fixed sample data; the chart does not fetch real metrics or verify the statistical quality of supplied data."
    ],
    "checks": [
      "Check labels, units, and legend; explore available points or controls and compare the result with the sample data."
    ]
  },
  "baseline-kbd-demo": {
    "demonstrates": [
      "Visual representation of a key or key combination; it does not implement the shortcut."
    ],
    "limits": [
      "The key label does not register a shortcut."
    ],
    "checks": [
      "Check the order and symbols in the key combination."
    ]
  },
  "baseline-kbd-group": {
    "demonstrates": [
      "Visual representation of a key or key combination; it does not implement the shortcut.",
      "Visual combination of multiple keys."
    ],
    "limits": [
      "The key label does not register a shortcut."
    ],
    "checks": [
      "Check the order and symbols in the key combination."
    ]
  },
  "motion-action-button": {
    "demonstrates": [
      "Show the progress and result of an asynchronous operation in the same button."
    ],
    "limits": [
      "The app must connect the business operation and its reversal; a button alone does not show that the operation is implemented."
    ],
    "checks": [
      "Activate the primary action and observe the result; navigate the available alternatives with the keyboard."
    ]
  },
  "motion-split-button": {
    "demonstrates": [
      "Separate the frequent action from its related alternatives."
    ],
    "limits": [
      "The app must connect the business operation and its reversal; a button alone does not show that the operation is implemented."
    ],
    "checks": [
      "Activate the primary action and observe the result; navigate the available alternatives with the keyboard."
    ]
  },
  "motion-floating-button-group": {
    "demonstrates": [
      "Show compact tools beside the content they modify."
    ],
    "limits": [
      "The app must connect the business operation and its reversal; a button alone does not show that the operation is implemented."
    ],
    "checks": [
      "Activate the primary action and observe the result; navigate the available alternatives with the keyboard."
    ]
  },
  "motion-expanding-button-group": {
    "demonstrates": [
      "Reveal a compact action’s label on focus or hover."
    ],
    "limits": [
      "The app must connect the business operation and its reversal; a button alone does not show that the operation is implemented."
    ],
    "checks": [
      "Activate the primary action and observe the result; navigate the available alternatives with the keyboard."
    ]
  },
  "motion-copy-button": {
    "demonstrates": [
      "Copy an explicit value to the clipboard and confirm the result."
    ],
    "limits": [
      "Copying depends on browser clipboard access and availability; it does not publish or execute the content."
    ],
    "checks": [
      "Copy and paste into a local field to verify the content; check the response if the browser denies access."
    ]
  },
  "motion-multi-select": {
    "demonstrates": [
      "Select multiple options in a compact field."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "motion-number-field": {
    "demonstrates": [
      "Adjust a quantity with explicit limits."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "motion-password-field": {
    "demonstrates": [
      "Enter a secret with an option to reveal it temporarily."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "motion-search-field": {
    "demonstrates": [
      "Filter content with a clearable search field."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "motion-tag-input": {
    "demonstrates": [
      "Create and remove tags as a list of values."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "motion-file-dropzone": {
    "demonstrates": [
      "Choose, paste, or drag files and track their upload."
    ],
    "limits": [
      "Example files and progress are local or simulated. The consumer must connect transport, storage, and authorization for a real upload."
    ],
    "checks": [
      "Choose an allowed file and one that violates the visible restrictions; try canceling or retrying when available."
    ]
  },
  "motion-segmented-control": {
    "demonstrates": [
      "Switch between a few views of the same context."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Change the selection and check its visible state; navigate the options with the keyboard."
    ]
  },
  "motion-date-picker": {
    "demonstrates": [
      "A date field selects a weekday stock receipt within the sample's November delivery window."
    ],
    "limits": [
      "Selection uses sample dates; it does not query bookings, availability, or business time-zone rules."
    ],
    "checks": [
      "Check the unavailable weekend and calibration dates. Select an available day by keyboard, then clear it and check the delivery status.",
      "When the picker shows “Scroll for more dates,” scroll horizontally or move through dates with the arrow keys."
    ]
  },
  "motion-time-picker": {
    "demonstrates": [
      "Choose a time using defined increments."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "motion-expandable-card": {
    "demonstrates": [
      "Expands a single summary to show additional information on request."
    ],
    "limits": [
      "Content is sample data; opening a section does not fetch remote content or persist read state."
    ],
    "checks": [
      "Open and close the available content; verify that the control indicates which section is active."
    ]
  },
  "motion-toast": {
    "demonstrates": [
      "Show a local trim-mark reminder with its default dismissal and close control."
    ],
    "limits": [
      "Notices and states use local demo data; they do not reflect a remote operation or a synchronized inbox."
    ],
    "checks": [
      "Show the reminder, close it with the keyboard, and reopen it. Check the default dismissal behavior."
    ]
  },
  "motion-rating": {
    "demonstrates": [
      "Collect a rating with clear names for each level."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Change the selection and check its visible state; navigate the options with the keyboard."
    ]
  },
  "motion-metric-card": {
    "demonstrates": [
      "Presents a primary value, its comparison, and the reference period."
    ],
    "limits": [
      "The selected period controls the value, comparison, and example context."
    ],
    "checks": [
      "Change the period and check that the value, comparison, and context update together."
    ]
  },
  "motion-tree-view": {
    "demonstrates": [
      "Explore a hierarchy of folders or nested records."
    ],
    "limits": [
      "The sample hierarchy is local; the app determines how to load and preserve its nodes and selection."
    ],
    "checks": [
      "Expand and collapse a folder, select a node, and check keyboard navigation."
    ]
  },
  "motion-filter-toolbar": {
    "demonstrates": [
      "Shows active filters and allows adding, removing, or clearing all chips."
    ],
    "limits": [
      "Selections only update the preview’s local state; they do not query or modify records or external services."
    ],
    "checks": [
      "Add a filter from the field and value menus, remove a chip, and clear all; check visible chips, the accessible announcement, and reflow in a narrow viewport."
    ]
  },
  "motion-sortable-data-table": {
    "demonstrates": [
      "Compare records by sortable columns and allow explicit selection."
    ],
    "limits": [
      "Rows and archive or restore actions remain in the preview’s local state."
    ],
    "checks": [
      "Sort a column, select rows, and try archiving and restoring."
    ]
  },
  "motion-sparkline": {
    "demonstrates": [
      "Adds a compact trend to a metric’s value and change."
    ],
    "limits": [
      "Values are fixed sample data; the chart does not fetch real metrics or verify the statistical quality of supplied data."
    ],
    "checks": [
      "Check labels, units, and legend; explore available points or controls and compare the result with the sample data."
    ]
  },
  "motion-gauge": {
    "demonstrates": [
      "Summarizes a bounded value and the thresholds that give it meaning."
    ],
    "limits": [
      "The value is adjusted locally; it does not query real metrics or verify data quality."
    ],
    "checks": [
      "Increase and decrease the value; check the visible number, detail, and threshold."
    ]
  },
  "motion-animated-counter": {
    "demonstrates": [
      "Makes changes to a quantity noticeable while retaining its label."
    ],
    "limits": [
      "The example value changes locally when the counter is pressed; no external data is queried."
    ],
    "checks": [
      "Observe the available entry or state change; repeat with reduced motion and check that the content remains readable."
    ]
  },
  "motion-code-block": {
    "demonstrates": [
      "Shows copyable source with a filename and language."
    ],
    "limits": [
      "Copying depends on browser clipboard access and availability; it does not publish or execute the content."
    ],
    "checks": [
      "Copy and paste into a local field to verify the content; check the response if the browser denies access."
    ]
  },
  "motion-reorderable-list": {
    "demonstrates": [
      "Allows reordering a list by dragging or using the keyboard."
    ],
    "limits": [
      "Interaction reorders or scrolls local content; saving the order and acting on remote records are the app’s responsibility."
    ],
    "checks": [
      "Use the visible controls and available keyboard alternative; check the boundaries and content outside the viewport."
    ]
  },
  "motion-text-reveal": {
    "demonstrates": [
      "Presents a heading with a brief entrance when the component mounts."
    ],
    "limits": [
      "The entrance starts when the component mounts; the app provides the content."
    ],
    "checks": [
      "Observe the entrance and check that the text remains readable with reduced motion."
    ]
  },
  "motion-in-view-title": {
    "demonstrates": [
      "Provides word, line, blur, letter-spacing, or wipe entrances."
    ],
    "limits": [
      "The app provides the text and, optionally, line breaks; the entrance usually starts when it enters the viewport."
    ],
    "checks": [
      "Observe the entrance and check that the text remains readable with reduced motion."
    ]
  },
  "motion-text-morph": {
    "demonstrates": [
      "Transforms a short label when a state or action changes."
    ],
    "limits": [
      "The app provides the label and controls its state changes."
    ],
    "checks": [
      "Observe the available entry or state change; repeat with reduced motion and check that the content remains readable."
    ]
  },
  "motion-text-shimmer": {
    "demonstrates": [
      "Indicates an active task with a subtle sweep across a label."
    ],
    "limits": [
      "The sweep accompanies active; the app determines when the task ends."
    ],
    "checks": [
      "Observe the available entry or state change; repeat with reduced motion and check that the content remains readable."
    ]
  },
  "motion-hold-to-confirm": {
    "demonstrates": [
      "Request a sustained press when the consequence is clear."
    ],
    "limits": [
      "The app must connect the business operation and its reversal; a button alone does not show that the operation is implemented."
    ],
    "checks": [
      "Activate the primary action and observe the result; navigate the available alternatives with the keyboard."
    ]
  },
  "motion-swipe-actions": {
    "demonstrates": [
      "Reveal row actions without losing keyboard access."
    ],
    "limits": [
      "Interaction reorders or scrolls local content; saving the order and acting on remote records are the app’s responsibility."
    ],
    "checks": [
      "Use the visible controls and available keyboard alternative; check the boundaries and content outside the viewport."
    ]
  },
  "motion-reactions": {
    "demonstrates": [
      "Toggle reactions and keep their counts in controlled state."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Change the selection and check its visible state; navigate the options with the keyboard."
    ]
  },
  "motion-elastic-slider": {
    "demonstrates": [
      "Adjust a value with an elastic response at the ends."
    ],
    "limits": [
      "Changes adjust local values; applying the range to real queries or devices is the app’s responsibility."
    ],
    "checks": [
      "Move the controls to both limits and use the supported keys; check the value, step, and visible range."
    ]
  },
  "motion-range-histogram-slider": {
    "demonstrates": [
      "Filter a range while viewing the data distribution."
    ],
    "limits": [
      "Changes adjust local values; applying the range to real queries or devices is the app’s responsibility."
    ],
    "checks": [
      "Move the controls to both limits and use the supported keys; check the value, step, and visible range."
    ]
  },
  "motion-inline-edit": {
    "demonstrates": [
      "Edit a value in place, with save and cancel actions."
    ],
    "limits": [
      "Editing and messages stay in sample state; synchronization, moderation, and persistence belong to the app."
    ],
    "checks": [
      "Edit the content and confirm or cancel when available; check the local result and text representation."
    ]
  },
  "motion-expanding-search": {
    "demonstrates": [
      "Open a compact search field in a reserved area that can expand."
    ],
    "limits": [
      "Search filters sample content; remote results and navigation to a destination belong to the app."
    ],
    "checks": [
      "Open, type in, and clear the search; check the space it uses and return to the compact state."
    ]
  },
  "motion-chip-group": {
    "demonstrates": [
      "Select multiple categories using compact chips."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Change the selection and check its visible state; navigate the options with the keyboard."
    ]
  },
  "motion-password-strength": {
    "demonstrates": [
      "Show password requirements as the user types."
    ],
    "limits": [
      "The visual estimate checks local rules; it does not demonstrate resistance to attacks or check for compromised passwords."
    ],
    "checks": [
      "Enter a short password and one that meets the requirements; compare each indicator with the entered text."
    ]
  },
  "motion-bottom-sheet": {
    "demonstrates": [
      "Presents a secondary task from the bottom edge, with snap points."
    ],
    "limits": [
      "The surface presents sample content and actions; confirming or choosing an option does not run an external operation."
    ],
    "checks": [
      "Open from its trigger, navigate the content with the keyboard, and check dismissal and focus return for the surface type."
    ]
  },
  "motion-usage-meter": {
    "demonstrates": [
      "Breaks down a resource’s usage relative to its available capacity."
    ],
    "limits": [
      "Values and controls change a local sample; they do not query real metrics."
    ],
    "checks": [
      "Check labels, units, and legend; explore available points or controls and compare the result with the sample data."
    ]
  },
  "motion-onboarding-checklist": {
    "demonstrates": [
      "Groups setup tasks with a visible, persistent result for each step."
    ],
    "limits": [
      "Steps show local progress; completing a sample task does not configure an external resource."
    ],
    "checks": [
      "Go forward and back when allowed; check the current step and which tasks appear complete."
    ]
  },
  "motion-image-compare": {
    "demonstrates": [
      "Compares two versions of the same image with an adjustable divider."
    ],
    "limits": [
      "The divider compares supplied images; the component does not save or modify the files."
    ],
    "checks": [
      "Move the divider with the pointer and keyboard, and check its limits."
    ]
  },
  "motion-card-stack": {
    "demonstrates": [
      "Allows decisions on individual items through actions, dragging, and undo."
    ],
    "limits": [
      "Interaction reorders or scrolls local content; saving the order and acting on remote records are the app’s responsibility."
    ],
    "checks": [
      "Use the visible controls and available keyboard alternative; check the boundaries and content outside the viewport."
    ]
  },
  "motion-bar-chart": {
    "demonstrates": [
      "Compares quantities by category or discrete periods."
    ],
    "limits": [
      "Values are fixed sample data; the chart does not fetch real metrics or verify the statistical quality of supplied data."
    ],
    "checks": [
      "Switch between Week and Month; compare dates, minutes, and selected point with the table."
    ]
  },
  "motion-activity-heatmap": {
    "demonstrates": [
      "Shows the daily distribution of activity and lets users explore a date."
    ],
    "limits": [
      "Values are fixed sample data; the chart does not fetch real metrics or verify the statistical quality of supplied data."
    ],
    "checks": [
      "Check labels, units, and legend; explore available points or controls and compare the result with the sample data."
    ]
  },
  "motion-timeline": {
    "demonstrates": [
      "Organizes activity by date with expandable details and identifiable actors."
    ],
    "limits": [
      "Content is sample data; opening a section does not fetch remote content or persist read state."
    ],
    "checks": [
      "Open and close the available content; verify that the control indicates which section is active."
    ]
  },
  "motion-user-menu": {
    "demonstrates": [
      "Group account preferences and actions under a recognizable trigger."
    ],
    "limits": [
      "Destinations and actions belong to the sample; the app connects real routing, sessions, and permissions."
    ],
    "checks": [
      "Navigate the available links and controls; check the local response and behavior at a narrow width."
    ]
  },
  "motion-stepper": {
    "demonstrates": [
      "Indicates the current step in a flow and allows returning to completed steps."
    ],
    "limits": [
      "Steps show local progress; completing a sample task does not configure an external resource."
    ],
    "checks": [
      "Go forward and back when allowed; check the current step and which tasks appear complete."
    ]
  },
  "motion-signature-pad": {
    "demonstrates": [
      "Draw a signature and export it as a local image."
    ],
    "limits": [
      "Drawing and export are local; the consumer is responsible for identity, custody, and signature validity."
    ],
    "checks": [
      "Draw, erase, and export when available; check that the image matches the stroke."
    ]
  },
  "motion-icon-morph": {
    "demonstrates": [
      "Morph an action icon between two states."
    ],
    "limits": [
      "The app controls the icon state and performs the associated action."
    ],
    "checks": [
      "Observe the available entry or state change; repeat with reduced motion and check that the content remains readable."
    ]
  },
  "motion-date-range-picker": {
    "demonstrates": [
      "Choose a proof or press week preset, or set custom endpoints. Apply updates the production window."
    ],
    "limits": [
      "Selection uses sample dates; it does not query bookings, availability, or business time-zone rules."
    ],
    "checks": [
      "Choose a preset, cancel to keep the prior window, then apply a preset or custom range. Check focus and the applied status."
    ]
  },
  "motion-color-picker": {
    "demonstrates": [
      "Select and edit a color with a contextual label."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "motion-morph-select": {
    "demonstrates": [
      "Open a compact selection with metadata and optional search."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "motion-line-chart": {
    "demonstrates": [
      "Compares the progression of one or more series on an ordered axis."
    ],
    "limits": [
      "Values are fixed sample data; the chart does not fetch real metrics or verify the statistical quality of supplied data."
    ],
    "checks": [
      "Check labels, units, and legend; explore available points or controls and compare the result with the sample data."
    ]
  },
  "motion-donut-chart": {
    "demonstrates": [
      "Shows how a total is divided among categories."
    ],
    "limits": [
      "Values are fixed sample data; the chart does not fetch real metrics or verify the statistical quality of supplied data."
    ],
    "checks": [
      "Check labels, units, and legend; explore available points or controls and compare the result with the sample data."
    ]
  },
  "motion-streamgraph": {
    "demonstrates": [
      "Shows changes in the composition of multiple series over time."
    ],
    "limits": [
      "Values are fixed sample data; the chart does not fetch real metrics or verify the statistical quality of supplied data."
    ],
    "checks": [
      "Check labels, units, and legend; explore available points or controls and compare the result with the sample data."
    ]
  },
  "motion-brush-chart": {
    "demonstrates": [
      "Combines a long series with an adjustable time window."
    ],
    "limits": [
      "Values are fixed sample data; the chart does not fetch real metrics or verify the statistical quality of supplied data."
    ],
    "checks": [
      "Check labels, units, and legend; explore available points or controls and compare the result with the sample data."
    ]
  },
  "motion-ridgeline": {
    "demonstrates": [
      "Compares numerical distributions across groups using overlapping densities."
    ],
    "limits": [
      "Values are fixed sample data; the chart does not fetch real metrics or verify the statistical quality of supplied data."
    ],
    "checks": [
      "Check labels, units, and legend; explore available points or controls and compare the result with the sample data."
    ]
  },
  "motion-treemap": {
    "demonstrates": [
      "Represents parts of a hierarchy by area and allows drilling into branches."
    ],
    "limits": [
      "Values are fixed sample data; the chart does not fetch real metrics or verify the statistical quality of supplied data."
    ],
    "checks": [
      "Check labels, units, and legend; explore available points or controls and compare the result with the sample data."
    ]
  },
  "motion-waffle-chart": {
    "demonstrates": [
      "Expresses a distribution as countable units in a grid."
    ],
    "limits": [
      "Values are fixed sample data; the chart does not fetch real metrics or verify the statistical quality of supplied data."
    ],
    "checks": [
      "Check labels, units, and legend; explore available points or controls and compare the result with the sample data."
    ]
  },
  "motion-slope-chart": {
    "demonstrates": [
      "Compares how categories changed between two points in time."
    ],
    "limits": [
      "Values are fixed sample data; the chart does not fetch real metrics or verify the statistical quality of supplied data."
    ],
    "checks": [
      "Check labels, units, and legend; explore available points or controls and compare the result with the sample data."
    ]
  },
  "motion-countdown": {
    "demonstrates": [
      "Shows the time remaining until a specified date and time."
    ],
    "limits": [
      "The animation displays supplied values or text; the app controls changes and the target date for a countdown."
    ],
    "checks": [
      "Observe the available entry or state change; repeat with reduced motion and check that the content remains readable."
    ]
  },
  "motion-cookie-consent": {
    "demonstrates": [
      "Allows accepting, rejecting, and reviewing cookie categories from one surface."
    ],
    "limits": [
      "The displayed preference does not guarantee tracker blocking; the app must connect each category to its scripts and storage."
    ],
    "checks": [
      "Review accept, reject, and customize options when available; check the visible result of each choice."
    ]
  },
  "motion-announcement-bar": {
    "demonstrates": [
      "Presents a brief notice with a related action and optional dismissal."
    ],
    "limits": [
      "Notices and states use local demo data; they do not reflect a remote operation or a synchronized inbox."
    ],
    "checks": [
      "When a control is available, activate the example; check the initial state, visible change, and any dismissal or recovery it offers."
    ]
  },
  "motion-json-viewer": {
    "demonstrates": [
      "Explore nested objects with search, navigation, and copying of values or paths."
    ],
    "limits": [
      "The sample JSON is local; copying requires browser clipboard access."
    ],
    "checks": [
      "Search for a key, expand a branch, and try copying its path or value if clipboard access is available."
    ]
  },
  "motion-scrub-input": {
    "demonstrates": [
      "Adjust a number by dragging its label or entering an expression."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "motion-phone-input": {
    "demonstrates": [
      "An initially empty number field with Argentina selected, suggested countries, and a local formatting status."
    ],
    "limits": [
      "The example uses formatting only and leaves inline validation messages disabled. It neither verifies numbers nor places calls."
    ],
    "checks": [
      "Open the country list, search by calling code, and choose a country. Type and clear a sample value and check the formatting and local status."
    ]
  },
  "motion-money-input": {
    "demonstrates": [
      "Edit an amount and its currency while retaining minor units in the model."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "motion-shortcut-recorder": {
    "demonstrates": [
      "Record a key combination for a named action."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "motion-confirm-morph": {
    "demonstrates": [
      "Confirm an action in place and offer undo where possible."
    ],
    "limits": [
      "The app must connect the business operation and its reversal; a button alone does not show that the operation is implemented."
    ],
    "checks": [
      "Activate the primary action and observe the result; navigate the available alternatives with the keyboard."
    ]
  },
  "motion-mention-input": {
    "demonstrates": [
      "Write an update with structured mentions of people and channels."
    ],
    "limits": [
      "The control captures or displays values; the app determines business rules, storage, and remote validation."
    ],
    "checks": [
      "Edit the sample value, clear it where applicable, and check the label, help text, and visible state."
    ]
  },
  "motion-chat-thread": {
    "demonstrates": [
      "Groups messages, attachments, and reactions in a conversation."
    ],
    "limits": [
      "Messages and reactions are local; synchronization, moderation, and persistence belong to the app."
    ],
    "checks": [
      "Send a message, toggle a reaction, and check the recovery available in the example."
    ]
  },
  "motion-rich-text-editor": {
    "demonstrates": [
      "Edit content with blocks and formatting while retaining an exportable representation."
    ],
    "limits": [
      "Editing and messages stay in sample state; synchronization, moderation, and persistence belong to the app."
    ],
    "checks": [
      "Edit the content and confirm or cancel when available; check the local result and text representation."
    ]
  },
  "motion-billing-toggle": {
    "demonstrates": [
      "Switch the billing period and update the associated price."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Change the selection and check its visible state; navigate the options with the keyboard."
    ]
  },
  "motion-radio-cards": {
    "demonstrates": [
      "Choose an option with a description, price, or availability."
    ],
    "limits": [
      "The sample selection does not save account preferences or confirm changes on a server."
    ],
    "checks": [
      "Change the selection and check its visible state; navigate the options with the keyboard."
    ]
  },
  "motion-comment-thread": {
    "demonstrates": [
      "Allows commenting on content, replying in context, and resolving the conversation."
    ],
    "limits": [
      "Editing and messages stay in sample state; synchronization, moderation, and persistence belong to the app."
    ],
    "checks": [
      "Edit the content and confirm or cancel when available; check the local result and text representation."
    ]
  },
  "motion-slot-text": {
    "demonstrates": [
      "Makes changes to a price, amount, or short label visible through reels."
    ],
    "limits": [
      "Example amounts change locally when a period is selected; no external data is queried."
    ],
    "checks": [
      "Observe the available entry or state change; repeat with reduced motion and check that the content remains readable."
    ]
  },
  "motion-expandable-text": {
    "demonstrates": [
      "Truncates long text while retaining an explicit action to read it in full."
    ],
    "limits": [
      "Content is sample data; opening a section does not fetch remote content or persist read state."
    ],
    "checks": [
      "Open and close the available content; verify that the control indicates which section is active."
    ]
  },
  "motion-signup-form": {
    "demonstrates": [
      "Registration fields, validation, and local confirmation."
    ],
    "limits": [
      "No crea cuentas ni conecta proveedores."
    ],
    "checks": [
      "Submit an empty name or email and a password shorter than 8 characters.",
      "Correct the values and check the demo receipt."
    ]
  },
  "motion-logo-marquee": {
    "demonstrates": [
      "Logo row with play and pause controls and color or monochrome display."
    ],
    "limits": [
      "Logos are sample data; they do not represent customers or active integrations."
    ],
    "checks": [
      "Play and pause the row; check brand names in both themes."
    ]
  },
  "motion-plan-comparison": {
    "demonstrates": [
      "Sample prices by period, with a comparison between Team and Studio."
    ],
    "limits": [
      "Choosing a plan does not create a subscription."
    ],
    "checks": [
      "Switch between monthly and annual billing; check USD, per-seat monthly pricing, and the annual billing notice.",
      "Select a plan and check the local confirmation."
    ]
  },
  "motion-notification-center": {
    "demonstrates": [
      "Open the local workshop inbox, filter unread updates, mark notices read or unread, and dismiss an individual update."
    ],
    "limits": [
      "Notices and states use local demo data; they do not reflect a remote operation or a synchronized inbox."
    ],
    "checks": [
      "Use the filters and row actions. Check the unread count, local status, keyboard focus, and closing behavior."
    ]
  },
  "motion-file-upload": {
    "demonstrates": [
      "The sample lets users select or drag files, validate constraints, view progress, and remove or cancel an upload. The component also offers a retry if onUpload fails."
    ],
    "limits": [
      "Example files and progress are local or simulated. The consumer must connect transport, storage, and authorization for a real upload."
    ],
    "checks": [
      "Choose an allowed file and one that violates the visible restrictions; try canceling or retrying when available."
    ]
  },
  "motion-changelog-feed": {
    "demonstrates": [
      "Browse print-production notes by month and type, copy a code snippet, and download the visible entries as Markdown."
    ],
    "limits": [
      "The recipe uses local sample entries. A consumer supplies its own history and media."
    ],
    "checks": [
      "Switch between New, Improved, and Fixed and check the count and visible entries.",
      "Change the month, expand an entry, copy its snippet, and download the filtered list."
    ]
  },
  "motion-sign-in": {
    "demonstrates": [
      "Compact sign-in flow with email and code, plus passkey and provider options. Includes validation."
    ],
    "limits": [
      "The example submission is simulated locally. Registration, authentication, email, passkeys, and form delivery require app services."
    ],
    "checks": [
      "Submit incomplete data, then valid data; check errors and the local response without assuming an account or real delivery exists."
    ]
  },
  "motion-page-header": {
    "demonstrates": [
      "Header that condenses on scroll, tabs, and locally stored issues."
    ],
    "limits": [
      "Creating, completing, or archiving only changes the sample data."
    ],
    "checks": [
      "Scroll the panel until the title condenses, then return to the top.",
      "Switch tabs and complete an issue; check the corresponding count."
    ]
  },
  "motion-empty-states": {
    "demonstrates": [
      "No results, offline, up-to-date, and not-found states. Each scene pairs a brief explanation with a recovery action."
    ],
    "limits": [
      "Notices and states use local demo data; they do not reflect a remote operation or a synchronized inbox."
    ],
    "checks": [
      "When a control is available, activate the example; check the initial state, visible change, and any dismissal or recovery it offers."
    ]
  },
  "motion-login-centered": {
    "demonstrates": [
      "Record an illustrative passkey or provider choice for the sample returning reader, or compare a local code for an entered address.",
      "Keep separate first-visit and returning-reader drafts and show the address, method, and visit type in a local list.",
      "Open native disclosures for reader terms and privacy."
    ],
    "limits": [
      "The code and method choices are local. The example creates no account and contacts no authentication or email service."
    ],
    "checks": [
      "Switch modes, go back, and reenter each mode. Check the address, visit type, and focus.",
      "Compare incomplete, incorrect, and correct codes. Check restart and the resulting local record.",
      "Open and close the reader terms and privacy disclosures by keyboard. Check focus and the current route."
    ]
  },
  "motion-site-header": {
    "demonstrates": [
      "Desktop navigation and a mobile menu with submenus."
    ],
    "limits": [
      "Destinations without a section appear as sample links within the catalog."
    ],
    "checks": [
      "Open submenus with the keyboard; check dismissal and focus return.",
      "At 390 px, open the mobile menu and activate a destination."
    ]
  },
  "motion-site-footer": {
    "demonstrates": [
      "Columns, subscription form, and an expanded-brand variant."
    ],
    "limits": [
      "Subscription is local; sample links do not represent connected services."
    ],
    "checks": [
      "Navigate the variants and check reading order on mobile.",
      "Submit an invalid email, then a valid one; check the status message."
    ]
  },
  "motion-hero-section": {
    "demonstrates": ["Minimal editorial opening with a headline, description, and a button that reveals the local sheet plan."],
    "limits": ["The catalog shows minimal. The centered and split compositions remain in the API but are not shown in this preview."],
    "checks": ["Check reading and actions at 320 px and on desktop.", "Activate Sheet plan with the keyboard, check the signature diagram and trim note, then activate it again to hide them."]
  },
  "motion-faq-section": {
    "demonstrates": [
      "Accordion, columns, and category search."
    ],
    "limits": [
      "Questions describe RAMS; sample links do not connect to a support service."
    ],
    "checks": [
      "Search for motion and a string with no matches in Searchable; navigate categories in Two column.",
      "Open and close answers with the keyboard."
    ]
  },
  "motion-contact-section": {
    "demonstrates": [
      "Form, channels, and offices with local actions."
    ],
    "limits": [
      "Messages remain in the preview; email addresses and locations are fictional."
    ],
    "checks": [
      "Try an empty name, invalid email, and a message shorter than 20 characters.",
      "Submit valid data and check the local receipt. Navigate form, channels, and offices."
    ]
  },
  "motion-blog-grid": {
    "demonstrates": [
      "Category filtering, pagination, and opening the built-in reader."
    ],
    "limits": [
      "Does not include text search or a CMS."
    ],
    "checks": [
      "Filter by Design and check that each card retains that category.",
      "Navigate the All pages; open and close an article, then check focus return."
    ]
  },
  "motion-comparison-table": {
    "demonstrates": [
      "Matrix with a featured product and a differences filter."
    ],
    "limits": [
      "Plan selection only updates this preview; it does not start a trial or charge anything."
    ],
    "checks": [
      "Enable the filter and check that matching rows are hidden.",
      "On mobile, change the compared column and verify that values remain associated with their headers."
    ]
  },
  "motion-stats-band": {
    "demonstrates": [
      "Numeric values with units, trends, and contextual detail."
    ],
    "limits": [
      "These are sample metrics with no monitoring or remote queries."
    ],
    "checks": [
      "Check the final value, separators, and units.",
      "Focus or hover over a metric to read context without moving detail."
    ]
  },
  "motion-cta-section": {
    "demonstrates": [
      "Centered, split, and banner variants; local confirmation and notice dismissal."
    ],
    "limits": [
      "Without href or onClick, the action only changes its label. It does not start a service."
    ],
    "checks": [
      "Activate the actions and check their confirmation labels.",
      "Close the banner and select Show banner to restore it."
    ]
  },
  "motion-newsletter-signup": {
    "demonstrates": [
      "Email validation, simulated submission, and a new entry in the feed."
    ],
    "limits": [
      "Confirmation is local: it does not send email or create a subscription."
    ],
    "checks": [
      "Submit an invalid email and correct it without losing the field.",
      "Navigate Inline and Card; confirm that each submission adds only one entry."
    ]
  },
  "motion-theme-switch": {
    "demonstrates": [
      "Change the entire page theme through the host provider.",
      "Circular reveal originating at the trigger."
    ],
    "limits": [
      "The transition requires host integration with the native View Transition API. With reduced motion or without support, the theme changes immediately.",
      "The consumer connects its provider and decides whether to save the preference; this sample does not sync an account."
    ],
    "checks": [
      "Change the theme and observe the whole page; check the direction of this variant’s effect.",
      "Repeat with reduced motion and in a browser without view transitions; check that the theme changes immediately."
    ]
  },
  "motion-theme-switch-eclipse": {
    "demonstrates": [
      "Change the entire page theme through the host provider.",
      "Circular wipe entering from the left."
    ],
    "limits": [
      "The transition requires host integration with the native View Transition API. With reduced motion or without support, the theme changes immediately.",
      "The consumer connects its provider and decides whether to save the preference; this sample does not sync an account."
    ],
    "checks": [
      "Change the theme and observe the whole page; check the direction of this variant’s effect.",
      "Repeat with reduced motion and in a browser without view transitions; check that the theme changes immediately."
    ]
  },
  "motion-theme-switch-split": {
    "demonstrates": [
      "Change the entire page theme through the host provider.",
      "Expansion from the center to both sides."
    ],
    "limits": [
      "The transition requires host integration with the native View Transition API. With reduced motion or without support, the theme changes immediately.",
      "The consumer connects its provider and decides whether to save the preference; this sample does not sync an account."
    ],
    "checks": [
      "Change the theme and observe the whole page; check the direction of this variant’s effect.",
      "Repeat with reduced motion and in a browser without view transitions; check that the theme changes immediately."
    ]
  },
  "motion-theme-switch-rise": {
    "demonstrates": [
      "Change the entire page theme through the host provider.",
      "Reveal rising from the bottom edge."
    ],
    "limits": [
      "The transition requires host integration with the native View Transition API. With reduced motion or without support, the theme changes immediately.",
      "The consumer connects its provider and decides whether to save the preference; this sample does not sync an account."
    ],
    "checks": [
      "Change the theme and observe the whole page; check the direction of this variant’s effect.",
      "Repeat with reduced motion and in a browser without view transitions; check that the theme changes immediately."
    ]
  }
};

export function getPreviewContract(variant: ComponentVariant): PreviewContract {
  if (variant.kind === "integration") {
    const entry = originalIntegrations[variant.id as keyof typeof originalIntegrations];
    if (!entry) throw new Error(`Missing integration contract ${variant.id}`);
    return {demonstrates:[...entry.demonstrates],limits:[...entry.limits],checks:[...entry.checks]};
  }
  const original = variant.kind === "baseline" ? getOriginalNativeContract(variant.demoId || "") : variant.kind === "library" ? getOriginalLibraryContract(variant.id.replace(/^motion-/,'')) : undefined;
  if(original)return original;
  const contract = Object.prototype.hasOwnProperty.call(contracts, variant.id)
    ? contracts[variant.id]
    : undefined;
  if (!contract) {
    throw new Error(`Missing preview contract for ${variant.id}`);
  }
  // Protect the registry from accidental mutation by a consumer.
  return {
    demonstrates: [...contract.demonstrates],
    limits: [...contract.limits],
    checks: [...contract.checks],
  };
}
