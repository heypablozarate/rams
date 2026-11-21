# Navigation and reading surfaces

Install the matching motion-* item and its complete manifest closure. These recipes use owned RAMS native controls and independent Radix/Motion engines; retained ARC code keeps its original license.

Breadcrumb renders ancestor links or actions and a text-only current location. Supply actual navigation callbacks or hrefs; it does not invent routes. Pagination is controlled: update page and the actual collection slice together. Previous/next stop at the first and last page; aria-current identifies the selected page.

Card quick look shows details for the same item. Its specialized surface morph uses Radix dialog focus, naming and dismissal; the trigger and close action consume owned Button. It retains its existing single geometry owner rather than nesting a second dialog implementation. Name the item, keep metadata consistent, and return focus after dismissal.

ScrollArea is native scrolling with optional edge fades and overlay scrollbars. Label its viewport, retain all records, and let text wrap. A bounded height makes the overflow intentional; edge callbacks describe actual remaining content. Keyboard and wheel input stay native.

ResizablePanels needs a definite group height and stable child panel IDs. Divider arrows resize, Home/End reach limits, Enter collapses/restores an eligible pane and double-click restores the initial layout. onLayoutChange reports settled shares. The engine deliberately clips content when a collapsible pane is squeezed; keep essential actions reachable in its restored state.

Carousel uses an ordered set of peers. Controlled index and onIndexChange keep the active visual and its description together. Its arrows, slide tabs and drag gesture navigate the same slides. Automatic rotation is opt-in and absent from the print-study example. Reduced-motion behavior and a focusable viewport remain available.
