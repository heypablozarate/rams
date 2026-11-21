# Animated disclosure and feedback

These optional recipes compose owned RAMS primitives. Install motion-accordion, motion-tabs or motion-alert with tools/install.mjs and use the returned package list. They require Motion13.4.0; Tabs and Alert also use LucideReact1.47.0. CSS Modules and React19 with Vite are the tested integration, not a promise of every framework.

## Accordion

Pass items with title and content to Accordion. defaultOpen selects an initial item by index; use -1 for a closed start. Selection is single and collapsible. size defaults to md; lg gives page-level questions more space. Keyboard traversal, headings and panel names come from the same RAMS Accordion. Closed panels remain mounted for height animation but are hidden and inert.

## Tabs

Compose Tabs, TabsList, TabsTrigger and TabsContent with matching value strings. Use defaultValue or controlled value/onValueChange. Give the list an accessible name. One selection is active; keyboard focus reveals its tab when the strip overflows. Strip scrolling stays local. The panel follows the new content height; reduced motion applies the latest selection immediately. forceMount uses native content presence instead of animated removal.

## Alert

Pass a title, children and info, success, warning or danger tone. Warning/success keep a status region; danger uses alert. Tone is also conveyed by its icon and copy. The model owns its actual action and displayed data. open controls presence; omitting it keeps presence local. Passing onDismiss adds a named dismiss action and reports dismissal after uncontrolled exit. Keep the current title and details useful without relying on animation or color.

System reduced motion is observed live. The native primitives retain their anatomy and semantics. The adapted motion implementations retain ARC's MIT notice in licenses/ARC-LICENSE.txt and NOTICE.md; original RAMS example models have their separate MIT attribution.
