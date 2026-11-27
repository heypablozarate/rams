# Rams by PabloZarate™

A React design system with source-owned components, fluid typography and shared interaction rules. Install the parts an application needs, then compose them with its own data and services.

RAMS uses elastic type ranges, optical tracking for large headings, tonal chart palettes and controls that grow when labels wrap. Original examples draw on Argentine print and editorial design.

## Control API — 0.2.0

Static and animated `Button` share `variant` values (`default`, `secondary`, `outline`, `ghost`, `link`, `destructive`) and `size` values (`xs`, `sm`, `default`, `lg`, plus the four `icon` sizes). Both use the same style and geometry. Text wraps and can increase height.

Action, Copy, Split, Hold and the action groups use the same four text sizes. A group's size describes its controls, so an outer tray also includes its padding. A pending asynchronous action remains focusable and prevents another activation.

Ordinary buttons default to `type="button"`. Use `type="submit"` for form submission. Native `disabled` removes an action from keyboard navigation; `aria-disabled` prevents activation while preserving focusability.

### Updating an earlier snapshot

- Replace `size="md"` with `size="default"` where it was exposed. Avatar uses the same size names and geometry in its static, animated and group forms; `xl` is also available for standalone avatars.
- For animated Button, replace `variant="primary"` with `default`, its former outlined `secondary` with `outline`, and `danger` with `destructive`. Canonical `secondary` is the same soft fill as static Button; `destructive` is the same destructive fill.
- Copy's former `plain` style is `ghost`. Split's former `primary` / `secondary` styles are `default` / `outline`.
- Submit controls must specify `type="submit"`; implicit form submission is no longer a Button default.

Controlled value callbacks use `onValueChange(next, details?)`; native input `onChange(event)` keeps its DOM event contract. Calendar, Date Picker, Date Range Picker, Cookie Consent, File Upload, Mention Input, OTP, Rating, Rich Text Editor and Time Picker follow that convention. Rich Text Editor emits the HTML string first and the Markdown/text snapshot second, so `value={html}` and `onValueChange={setHtml}` compose directly.

These are explicit API changes. The installer protects existing files with different bytes. Keep application edits, review the migration and resolve file conflicts before replacing an installed snapshot.

## Install

Use React 19, TypeScript and a build tool that supports CSS imports. From this source checkout:

```sh
node tools/install.mjs --target /path/to/your-app --items button,input,label --dry-run
node tools/install.mjs --target /path/to/your-app --items button,input,label
```

Inspect the dry-run file and dependency plan. The installer copies selected source and shared styles into `src/rams`; it does not install packages or overwrite files with different bytes. Install the package versions it reports through the application's package manager.

Import the styles once, then use the installed modules:

```tsx
import "./rams/styles.css";
import { Button } from "./rams/components/button";
import { Input } from "./rams/components/input";
import { Label } from "./rams/components/label";
```

[`rams.json`](rams.json) is the complete inventory of item IDs, files, hashes, dependencies and available guides. It groups core components, responsive hooks, optional motion APIs and original compositions. Catalog stories can share one API: Avatar sizes/presence/initials use `motion-avatar`, and reveal/eclipse/split/rise use the `variant` prop of `motion-theme-switch`.

Read each item's TypeScript exports before using it; inherited props and caller-owned callbacks are part of its contract. Example-local records, fixed-code comparisons and illustrative totals do not provide authentication, delivery, storage or payment services.

## Find a pattern

| Task | Guides |
| --- | --- |
| Collect and validate input | [Forms](docs/forms.md), [motion fields](docs/motion-fields.md), [reader access](docs/motion-print-access.md) |
| Reveal content and feedback | [Surfaces](docs/surfaces.md), [disclosure and feedback](docs/motion-reading.md), [presentation](docs/motion-presentation.md) |
| Navigate and organize work | [Menus](docs/menus.md), [sidebars](docs/sidebars.md), [drawers](docs/drawers.md), [site headers](docs/motion-site-header.md) |
| Compare and inspect data | [Calendar and charts](docs/data.md), [print data](docs/motion-print-data.md) |
| Compose actions and text | [Actions](docs/motion-actions.md), [text and clipboard](docs/motion-text.md), [choice and range](docs/motion-choice-range.md) |
| Build a page | [Local integrations](docs/local-integrations.md), [gallery and panels](docs/containers.md) |

Use the manifest's `documentation` field for the guide attached to a particular item; its files are authoritative when no separate guide is assigned.

## Work with an agent

Start at [llms.txt](llms.txt). Query the generated index instead of loading every guide:

```sh
node tools/discover.mjs --query "date range"
node tools/discover.mjs --item motion-date-range-picker
```

Each exact item links its guide, source exports/local declarations and dependency versions.
The source remains authoritative for inherited or inferred props. All 207 items have an attached
guide; shared guides describe common rules rather than claiming identical variant behavior.
The manifest hashes the index, and discovery checks the selected source before returning it.
Queries match names, exports, guide headings and curated task keywords; they are not semantic search.

The installed `src/rams/installation.json` records selected IDs, guide paths, version and expected
source hashes. Shared rules and the selected guides travel with the runtime, so a subsequent agent
can use the installed subset without guessing the original checkout path. Optional guide examples
may require another source item; consult the receipt before importing them. Existing application
edits remain authoritative and are never silently overwritten.

When maintaining a fork's source package, review source/guide changes and the intended item/file
inventory first. Install the package's development dependencies, update its version when appropriate,
then run `node tools/build-index.mjs --write` to regenerate declarations and file hashes. This is an
explicit authoring operation; the installer and discovery commands never accept changed bytes by
silently regenerating their authority. Add new item/file entries deliberately in `rams.json`.

The default is Geist and neutral foundations. Import `palette.css` after `styles.css` to use the
optional shared accent/tonal palette. Personal identity rules, font files and source are not part
of a fork. [Explicit project profiles](docs/profiles.md) can point to an owner's separate local
rules and styles without copying them into this package.

Paste the [installation prompt](docs/install-prompt.md) into an agent with filesystem and shell tools. It directs the agent to read [`AGENTS.md`](AGENTS.md), inspect the manifest, resolve conflicts, install dependencies and verify the resulting interface. A chat-only model cannot install an application. Source installation needs no server or MCP.

[RAMS skills](skills/README.md) cover interface review, prototypes, edge cases and motion. Add them to your application separately from components.

## Foundations

- Use semantic roles for color, text and surfaces. The public core starts neutral; set an accent in the consuming application.
- Preserve fluid type, browser text preferences, visible focus and reduced motion.
- Use one primary action per active view; cards do not establish separate action scopes.
- Let labels wrap and controls grow instead of shrinking type to fit.

Geist Sans supplies UI and body type, weights 100–900 and a real italic face. Geist Serif is Regular 400 for selected editorial headings; do not synthesize bold or italic. Font copyright and SIL OFL 1.1 are preserved in [fonts/OFL.txt](fonts/OFL.txt), with versions and hashes in [fonts/metadata.json](fonts/metadata.json).

## Author and license

Created by [Pablo Zarate](https://pablozarate.com). RAMS original source is MIT licensed. Adapted components, dependencies and fonts retain their notices in [NOTICE.md](NOTICE.md), including the complete ARC MIT and Geist OFL texts. Installed dependency packages supply their own source and license notices.
