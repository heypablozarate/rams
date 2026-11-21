# Radio groups

Install radio-group for native selection, or motion-radio-group for a measured selection highlight. Both use the same owned RadioGroup and RadioGroupItem. The animated wrapper adds Motion13.4.0; follow the installer's exact package list. React19.2.4 is the verified consumer.

Both groups accept `tone="neutral"` to use theme ink/surface for the selected control. The default `tone="accent"` retains the existing accent selection. Changing tone keeps the selected value, native grouping, keyboard behavior and focus indication; errors and disabled controls retain their own treatment.

RadioGroup renders a grouped div; each Item renders an actual input type=radio. Put a visible label beside the input or wrap it in a label. Name the group with aria-label or aria-labelledby. Item refs point to HTMLInputElement, and the Root ref points to HTMLDivElement. Item has no children or asChild; type, checked, defaultChecked, name and form are owned by the group.

Use value/onValueChange for controlled state or defaultValue for an initial choice. Arrow keys use native selection; Home and End move focus without selecting, then Space selects. orientation can restrict arrow axes; loop=false blocks wrapping at an enabled edge. Disabled items are skipped by native navigation. Keep each item value unique within the group; the empty string is a real value, distinct from no selection.

Supply name when submissions need a stable key. Omitted and empty names receive a nonempty generated name, which also participates in FormData. Different groups need different names unless they intentionally represent one native group. Root disabled and required reach every item; an Item can also be disabled or required. form associates the group with an external form, and all its items must share that owner.

Native reset restores the initial uncontrolled value. Controlled state stays authoritative; update it in onReset when a different reset value is intended. Reset does not emit a selection callback. The form owner is registered at mount and when the Root form prop changes. Arbitrary DOM-only replacement or reassociation of an external form is not observed; preserve its owner or remount the group explicitly.

The motion wrapper keeps label, options, value, onValueChange and optional name. Each option has value, label and optional description. Selection changes the input immediately; only the highlight and dot animate. Resize and reduced motion place the highlight at the selected row without delaying focus, callbacks or form data.
