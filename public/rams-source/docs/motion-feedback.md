# Feedback and local actions

Use `motion-toast` for one short reminder or result. `title`, `description`, `open`, `onOpenChange` and `duration` are its public props; the default duration is 4,500ms. Supply the controlled open callback when the parent needs to follow dismissal. A message alone does not perform the action it describes.

Use `ToastStackProvider`, `useToastStack` and `ToastStack` from `motion-toast-stack` to add, update and dismiss related notices. Undo must reverse actual state. Set the provider limit to the number of retained notices; adding another evicts the oldest. Infinite duration keeps a notice until an action, dismissal or eviction. Hover/focus pauses finite notice timers.

`motion-notification-center` initializes its local list from `notifications`. Its callbacks report read/dismiss changes; the prop is not a controlled live collection. All/Unread views, per-item details and read actions, Mark all read and Clear read operate on the instance. Keep the trigger label specific to its update source.

`panelClassName` and `panelStyle` apply only to this instance’s actual portal surface, not the bell trigger. `panelStyle` accepts normal CSS properties and custom properties such as `--rams-detail-surface-padding`, `--rams-detail-surface-header-gap` and `--rams-detail-surface-footer-gap`. The shared surface inset aligns header, toolbar, list and footer; narrow layouts reflow without a separate inset scale. Inline styles override ordinary stylesheet declarations on that surface; classes follow the normal CSS cascade. Unspecified values retain the shared defaults. Styles scoped only to a trigger wrapper do not automatically follow the portal: use root theme/density settings or pass explicit surface overrides. Sibling instances keep their own overrides. When replacing surface colors, check secondary text and status colors as well as primary ink.

`motion-announcement-bar` accepts messages with IDs, copy and optional actions. Use `autoPlay={false}` with `controls` for manual navigation. Keep the controlled bar mounted when changing `open` so it can retire its actions and complete its own exit. If the surrounding page replaces the dismissed content, provide an appropriate focus destination.

`motion-cookie-consent` exposes categories, controlled value/onValueChange and a ref with reset/open methods. Required categories stay enabled. Optional choices can be saved, accepted or rejected; the preferences face can be reopened. Without `storageKey`, the component does not persist consent. Connect scripts to the actual saved state; the component does not manage third-party collection by itself.

Prefer short labels such as Review, Essential only and Allow optional, while keeping refusal and acceptance equally accessible. The Review button's accessible name includes the preferences title. Panel padding scales with text; the panel and category region can scroll independently so long labels remain reachable rather than clipped or truncated.

`motion-empty-states` is the complete four-tab print-workflow block, distinct from the single `motion-empty-state` primitive. It owns its sample data and takes no props. Each recovery action changes local records, notes or filters; no connection, mailbox or server operation is simulated. The vector artwork is original, while the retained motion engine and pure geometry utilities have their required attribution in NOTICE and the ARC license.

Import the installed styles once. Standalone actions use the shared RAMS Button; composite tabs retain keyboard semantics. Reduced motion keeps the same actions and results. Examples use sample print records, with no external requests or persistence unless the consumer explicitly provides an integration.
