# Surfaces

Use Dialog for a focused task, AlertDialog for a decision that requires explicit confirmation, and Sheet for supporting details beside the current view. Give each modal a Title and Description. Escape and explicit close return focus to the trigger by default; applications can override that return when navigation changes the destination.

Sheet initially focuses its content panel instead of opening an input keyboard. To choose another initial focus, handle `onOpenAutoFocus`, call `preventDefault()`, and focus the intended element. Keep the close control reachable.

Popover contains a small editable panel. Give its Content an accessible name. HoverCard provides supplementary reference material; do not put essential instructions behind hover. Tooltip provides a short, non-interactive explanation for a control that already has an accessible name.

```tsx
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './rams/components/tooltip';
import { Button } from './rams/components/button';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild><Button variant="outline" aria-label="Export edition">Export</Button></TooltipTrigger>
    <TooltipContent>Download the edition as JSON</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

Mount TooltipProvider around the relevant application region. Content components portal their surfaces; Radix owns dismissal, focus and keyboard behavior; RAMS styles set the visual layer. `asChild` requires one element and preserves that chosen root. Dialog and Sheet use the same RAMS close control; AlertDialog uses its explicit Cancel and Action controls.

Read the full [Proof Desk example](../examples/proof-desk.tsx) for a local edit, archive and download workflow. The example stores its edition in React state; it does not call a service or persist across reloads. A production application supplies persistence.
