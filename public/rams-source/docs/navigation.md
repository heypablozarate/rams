# Navigation and collection items

Breadcrumb shows a hierarchy; the current page is text with `aria-current="page"`. Use links for navigation or an `asChild` button when changing a local view. A separator is decorative. Ellipsis only represents omitted levels; compose a real menu if it must reveal them.

Pagination is controlled by its consumer. Supply real links, or use `asChild` with native buttons for paging a local dataset. Set `isActive` on the current page and meaningful labels on numbered controls. Native disabled buttons handle the first/last boundary in the Archive Index example. The primitive does not fetch, filter or own the page count.

Item groups related media, text and actions. Choose an outline to distinguish bounded rows, muted for a secondary surface, and default for an unframed row. Titles are neutral containers by default; use `ItemTitle asChild` with a heading at the appropriate level. Use a real link or button as the root only when the entire item is one action; do not nest another interactive action inside it.

Empty presents a missing-result state and its recovery. Explain what the user can change and provide a working action. ButtonGroup visually joins related actions without changing native focus or key behavior; each action keeps its own accessible name.

The [Archive Index](../examples/archive-index.tsx) filters six fictional print editions, pages the actual results and opens a local record. Archiving changes its local state. Clear search restores results and focuses the search field. The collection strip demonstrates horizontal scrolling; its content and state are not a connected catalog service.
