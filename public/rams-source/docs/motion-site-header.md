# Site header

Use `SiteHeader` for container-responsive website navigation. `simple` places links beside the brand; `centered` gives them a centered capsule; `mega` opens grouped links and an optional feature. `SiteHeaderBlock` includes a bounded Folio21 page and a layout Select.

Pass `brand`, `items`, and optional `primaryAction` / `secondaryAction`. Each action needs an `href` or `onClick`; an unconnected action is disabled. Defaults show original print references, with no pretend account or service actions. At most one primary action belongs in the active view, including the header.

`current` / `onCurrentChange` control the current section; `defaultCurrent` is uncontrolled. `onNavigate(destination)` receives the label, optional href, and containing section. Supply real href values for navigation or handle local destinations explicitly. The header does not fetch or render pages for you.

The sticky header becomes solid after `scrollThreshold` (8 px by default), with hysteresis near the top. Pass a `scrollContainer` ref for a nested scroller. A bounded host can set `--rams-detail-site-header-sheet-max` to the space remaining below the bar; the included block measures this on resize.

Mega triggers support Left/Right navigation and Arrow Down into the panel. Panel links support Up/Down/Home/End. Escape returns focus to the active trigger. The narrow menu exposes the same destinations; it is a disclosure, not a modal focus trap. Local selection returns focus from a retired menu item; outside interactions retain their own focus.

Reduced motion uses immediate transitions while retaining the current destination. Test long labels and enlarged text in the actual containing width.
