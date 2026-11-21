# RAMS action hierarchy

Each screen or active view allows **at most one primary button**. Zero is allowed. Choose the action that advances the main task and present the others with secondary, outline, ghost, or link treatments according to their role and the variant API.

The limit applies to the entire view, not to each card, form, block, or component. A card grid does not allow one primary action per card. The header, content, sticky bars, and footer of the same view count together, even when they are separate components or require scrolling to find. A link styled like a primary button also counts; a text link is not automatically a primary button just because it uses the Primary color.

## Views, responsive layouts, and states

- **Responsive:** Review each active composition. Copies hidden at another breakpoint do not count; if the header button and its sticky copy are visible at the same time, there are two. Use one instance or replace or hide the previous instance when the other appears. Running the same action from both does not remove the visual duplication.
- **Modal:** The active modal may have its own primary action when the background is inert. Count the topmost modal layer; controls in the inert background and lower inert modals are not part of the active interactive view. Check the background view again after closing the modal. A popover or non-modal panel does not create another allowance: its actions count with the still-active view.
- **Tabs and steps:** Count the active panel or step together with persistent screen actions. Unmounted or hidden panels do not count. Changing steps does not permit two visible primary buttons.
- **Disabled or loading:** A button still counts if it keeps its primary appearance. The visual hierarchy does not disappear because the button temporarily rejects clicks.
- **Destructive:** Reserve this treatment for a real destructive consequence; do not use it as a decorative way around the limit. Keep the confirmation and remaining actions in a clear hierarchy.
- **Catalogs and documentation:** Each explicitly delimited and titled demonstration may represent an independent view. A catalog may show several examples, each with one primary action. This exception does not apply to cards in a product screen or content within one demonstration. The catalog interface has its own limit.

## Choosing a treatment

### Composing blocks

Choose the page's primary action before combining Header, Hero, CTA, forms, and Footer. A primary action shown by each block in isolation does not give them separate allowances when integrated. Do not choose on the consumer's behalf which action has priority; make that explicit in the application composition.

In the current APIs, `SiteHeader primaryAction={null}` hides its CTA and `SiteFooter newsletter={null}` hides the form. `HeroContent` allows `primaryAction` to be omitted; `HeroSection` also allows that composition when it receives its own content through `title`. In HeroSection sample designs, `null` becomes `undefined` and the default action reappears: do not rely on that value to remove the example's primary action. CTA and some block submit actions do not expose a secondary-variant prop; use an agreed custom composition if the action must remain with less emphasis.

A split button combines a main task with a trigger for alternatives. Review its appearance as a composite control and distinguish the menu trigger from a second independent task; counting two `button` elements is not enough to decide. A group of several filled commands does not automatically qualify for this interpretation. Selected states, status badges, and marks are not primary actions by themselves.

In an editor, “Save changes” may be primary; “Cancel,” “Preview,” and “More options” are secondary. In a confirmation modal, the confirm action belongs to that newly active view and the editor is inert. An informational screen may have no primary action.

Do not decide from a prop name alone. Some APIs call the primary treatment `default`; others use `primary` or a custom composition. Check the variant's code and guide. A highly contrasted filled button, a CTA in another color, or an inline style can compete as primary even without those words. Conversely, not every colored background, selected state, or selection control represents a primary action.

Example of one view with a local save and a secondary action:

```tsx
import { useState } from "react";
import { Button } from "@/primitives/button";

export function EditActions() {
  const [message, setMessage] = useState("");
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => setMessage("Changes saved")}>
          Save changes
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setMessage("Preview opened")}
        >
          Preview
        </Button>
      </div>
      <p role="status">{message}</p>
    </div>
  );
}
```

The example illustrates hierarchy and local state; connect save and preview to the consuming application.

## Checking the rule

1. Identify the active view and its task. Record its one primary action or why none is needed.
2. Review the whole composition, including portals, header, footer, sticky regions, and scrollable content. Open relevant menus, modals, tabs, and steps.
3. Check desktop and mobile, both themes, densities, scrolling, loading, and disabled states. Verify responsive copies are not visible together and that a modal leaves the background inert.
4. A DOM test can identify candidates through roles, props, or implementation-specific selectors and exclude hidden or inert branches. Do not count the entire DOM or every `Button` as primary. `aria-hidden` alone does not visually hide a button; scrolling it out of the viewport does not exclude it from the view.
5. Review the actual visual hierarchy: CSS, contrast, size, and context can create another primary action without changing the DOM. An initial screenshot or automated count does not certify every state or replace this review.

The `/components.json` discovery contract exposes this policy in `compositionRules.primaryAction`. It is a RAMS composition rule, not a color token or required HTML attribute. It adds no restrictions to component APIs and does not change their pinned sources. Edit the guide in `docs/ACTION-HIERARCHY.md`; `npm run registry` generates `/action-hierarchy-guide.md` and its discovery links.
