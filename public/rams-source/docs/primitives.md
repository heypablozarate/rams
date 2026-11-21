# Basic components

Read the selected source for its exact props, exported parts and inherited native attributes.
The following choices describe use, not proof that every application composition is accessible.

| Item | Use | Choose something else when |
| --- | --- | --- |
| button | Perform an action, with visible text or an accessible icon label. | Navigation requires a real link. |
| input | Collect one native input value with an associated label. | A longer passage needs a textarea. |
| textarea | Collect multiple lines without clipping or shrinking the text. | A fixed choice belongs in a selection control. |
| label | Name its actual associated form control. | Ordinary prose is not a control label. |
| separator | Separate different content groups. | Related items need spacing rather than another rule. |
| badge | Display a concise state or classification. | An action needs a button or link with its own semantics. |
| card | Group related content with its own heading hierarchy. | An extra surface would only decorate existing content. |
| alert | Present an inline notice that matters in the current context. | A blocking decision requires an appropriate dialog. |
| skeleton | Reserve the shape of content while it is unavailable. | Known progress should expose its actual value. |
| spinner | Indicate work whose completion amount is unknown. | A determinate progress control can show real completion. |
| kbd | Show a keyboard key or combination as an instruction. | Binding a shortcut still needs application behavior. |
| aspect-ratio | Preserve a known media ratio. | Prose and controls should grow naturally. |
| table | Compare records in meaningful row/column relationships. | Unrelated content is better presented in ordinary flow. |
| progress | Show known completion with an accessible name. | Do not invent a percentage for an unknown operation. |
| native-select | Select one value through a native control and visible label. | Searching or complex option content needs another pattern. |
| checkbox | Choose independent options or an explicit boolean. | An exclusive set belongs in a radio pattern. |
| switch | Change a named on/off setting. | Selecting one of several values needs a different control. |
| toggle | Switch the pressed state of a named action. | A form value may need a checkbox instead. |
| toggle-group | Group related pressed-state choices with a declared selection mode. | Separate unrelated controls should not share group selection. |
| accordion | Reveal related sections with explicit triggers and keyboard focus. | A single disclosure can use Collapsible. |
| collapsible | Reveal one related region with an explicit trigger. | Exclusive panel navigation belongs in Tabs. |
| tabs | Switch between named peer panels. | Opening a different route should preserve link navigation. |

## State and composition

Checkbox and RadioGroup accept `tone="neutral"` to use the theme foreground and background for selected controls. `tone="accent"` remains the default. Tone changes the selection palette, not the value, keyboard behavior, disabled state, validation or focus indication.

Associate visible labels/help/errors with the actual control. Keep native event callbacks distinct
from value callbacks. Prefer real boolean/selected state over styling a control to look selected.
Inspect the selected declaration for inherited props and controlled/uncontrolled options.

Buttons allow labels to wrap and grow. Give icon-only actions an accessible name. Preserve a pending
control's documented focus behavior and avoid starting a second operation during the first.
For application-owned provider actions or an official SDK renderer, read [Authentication in consuming applications](authentication.md).
Table captions wrap to the visible table region even when wide columns require local scrolling.
Keep table headings and numeric alignment meaningful; horizontal scroll may be local to genuinely
two-dimensional data, never the whole page.

## Examples

`print-proof` and `edition-settings` are executable source compositions, not external services.
Read their complete source before adapting the data model. The other compositions attach their
task-specific guide in the manifest. Check actions, focus, validation and recovery in the real view.
