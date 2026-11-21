# Animated actions

These six optional recipes use the owned Button. Joined and split groups use owned ButtonGroup and DropdownMenu; floating actions use Tooltip. Install the matching motion-* item and its reported packages. React19.2.4, Motion13.4.0 and CSS Modules are the verified consumer.

motion-button forwards native button props, with default/secondary/outline/ghost/link/destructive variants, xs/sm/default/lg text sizes, icon-xs/icon-sm/icon/icon-lg icon sizes, and a loading state. Primary labels use the bold action weight; ordinary labels keep the medium action weight. Keep an accessible label and let long labels wrap. Morphing measures content; it does not prescribe a fixed label width. Native disabled and aria-disabled prevent activation.

`motion-action-button` takes `label` and `onAction`, with optional `pendingLabel`, `successLabel`, `resetAfterMs` and `onActionError`. The returned promise determines pending and success. Pending retains focus and blocks repeat activation. Rejection restores idle and calls `onActionError` so the consumer can display a recoverable error. `resetAfterMs` controls how long the successful result is shown.

The default primary variant uses the neutral primary surface and bold action label. Fine-pointer hover and keyboard focus reveal the sunset gradient. Pressing uses the same layer and takes precedence when states overlap. Disabled, `aria-disabled` and pending states suppress this feedback. The angle, OKLab mixtures and press opacity come from `tokens.json/componentExtensions.base`; the optional palette supplies the brand and chart roles. The label and icon keep the primary foreground. Secondary and destructive variants keep their own surfaces.

Label changes measure the available width and animate the button to the resulting text size. An ordinary resize updates the label immediately. Give short labels room for one line and allow the button to grow when enlarged or longer text needs additional lines. Reduced motion settles the current label, icon and width immediately and keeps the pressed, focus and hover colors available.

Install `motion-action-button,input` to run the catalog's proof fingerprint example. The example uses the browser's Web Crypto API to hash the current edition and artwork data locally.

motion-split-button separates a default action from named menu actions. The menu trigger has its own accessible name; dismissal and selection return focus according to the owned menu contract. Native disabled configuration blocks both paths. Inspect the exported item types before composing labels, icons, alternate actions or asynchronous handlers.

motion-button-group joins related controls and optional trailing menu actions. Stable IDs identify segments; icon-only controls retain their labels as accessible names. reserveLabels measures real alternate text. Use a bounded parent; the component can collapse eligible labels when necessary, rather than inventing short names.

motion-floating-button-group is a labelled toolbar with actions, separators, optional pressed states and disabled controls. Tooltip shortcut text is a hint, not a registered keyboard binding. Supply an actual handler for every enabled action.

motion-expanding-button-group reveals an action label on focus or pointer intent. Touch interaction first reveals, then activates. Disabled actions remain focusable for explanation but do not run. doneLabel is a factual confirmation; false or a rejected onSelect suppresses it. confirmDuration controls the confirmation hold, not an artificial operation time.

All action models belong to the consumer. The examples fold artwork, calculate a real local SHA-256, download original SVG files, navigate actual edition records and change drawing parameters. No account, order or external service is implied. Adapted source keeps ARC's MIT notice in licenses/ARC-LICENSE.txt; independent dependencies keep their licenses.
