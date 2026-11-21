# Choice and range controls

Install individual items from rams.json and import ./rams/styles.css. These recipes use Motion13.4.0 and CSS Modules; the manifest gives each recipe's dependency closure. The underlying adapted ARC implementation retains its MIT attribution.

- motion-checkbox exports Checkbox with a visible label and optional description. checked/onCheckedChange can hold true, false or indeterminate. It composes the owned Checkbox for semantics and form handling, with an animated visual mark. Supplied help IDs are preserved alongside the description.

Checkbox accepts `tone="neutral"` for an ink-and-surface selection instead of the default `tone="accent"`. Its mixed, disabled, invalid and keyboard states retain their behavior. Use the same tone across related controls; do not infer a different meaning from color alone.
- motion-segmented-control default-exports SegmentedControl. Supply options with value/label, the controlled value and onValueChange. Arrow keys, Home and End select an option; an overflowing track scrolls locally to keep the selection visible. Use segments for views of the same subject.
- motion-rating exports Rating. Supply label, value/onValueChange and valueLabels to name levels. allowClear supports clicking the selected star again or using Delete/Backspace to return to zero; readOnly produces a non-interactive summary. Additional half-step and pointer behavior belongs to the exported API; use the interface to select it deliberately.
- motion-slider exports Slider. A number selects one value; a pair selects a range. min/max/step bound values, format provides units and onValueCommit receives a committed change. Name range thumbs with thumbLabels. Marks can be numeric ticks or value/label objects.
- motion-number-field exports NumberField with a labeled spinbutton and owned Input/Button parts. min/max/step constrain accepted values. The editable value and its animated display share geometry and typography; typing and stepping are two routes to the same state.
- motion-elastic-slider exports ElasticSlider. It accepts one numeric value and onValueChange; min/max/step, marks and format describe the range. Its thumb adds a physical response while the value remains bounded.

Numeric readouts use the numeric font role and tabular figures. Keep the control's unit visible and show derived geometry or totals beside the specimen. Reduced motion is read live; changes must keep their current value and focused control.
