# Print data compositions

These three blocks own original English Folio21 defaults. Their examples show local data changes and preserve the source as the editable reference; they do not update a remote production system.

## Print-run comparison

`PlanComparison()` remains a zero-prop print-run recipe for compatibility. It now configures the shared `Comparison` renderer; fictional quantities, ARS prices and calculations live in the app recipe. Use the configurable engine for your own data, selection callbacks and responsive policy. See [Comparison](comparison.md) for the complete contract, installation and a caller-owned example.

## Production notes

`ChangelogFeed` accepts `entries`, `months`, `title`, `subtitle`, `endNote`, `defaultOpen` and `className`. `ChangelogEntry` keys to a supplied month and includes date/ISO/version/kind/title/summary/details with optional photo or code media. Defaults include fourteen original notes and five copyable code payloads. Kind filters combine by union; Show all clears them. Month navigation follows visible groups and the scrolling list.

Code retains its whitespace in a local scroller. Copy reads its complete payload. Export notes dispatches visible text/details/code as Markdown; it does not embed photo binaries or prove that a file was saved. Empty records keep export unavailable. Caller photo media accepts a URL or structural `{src,width,height,blurDataURL?}` value; use only images you may distribute and provide useful alt text/caption.

## Worksheet header

`PageHeader()` has no props. Its source owns a local production worksheet: nine initially open checks and five recorded completions, actual notes and count snapshots, and four downloadable text/CSV files. Complete/add/reset checks, switch tabs, archive/restore the local worksheet, or copy the current page address. Clipboard failure reports an error. No provider, delivery, storage or remote project is implied.

The framed body scrolls beneath a header that condenses with hysteresis. Its minimum body measure remains usable when enlarged text increases the header. Secondary actions move to an overflow menu when space narrows. Tabs and dropdowns consume RAMS primitives. Departing rows/panels retire controls immediately; local count changes do not wait for animation.

## PageHeader query source

Import `PageHeader` from `components/motion-page-header` and the ordinary styles once. The runtime uses CSS Modules and never imports Node or PostCSS. Editable query authority is `tools/page-header-authority.json`; its five named conditions produce six native CSS queries. Edit positive px/rem lengths in that file, then run `node src/rams/tools/generate-page-header.mjs`; add `--check` for verification only. Tooling requires PostCSS 8.5.31, declared in the item dependency plan; it is not a runtime import. The installed template is `components/motion-page-header.module.css.in`. The generator resolves all inputs relative to itself, works from any current directory and validates the full template and authority before writing the CSS Module. Do not edit the generated CSS directly.

Declaration roles are exposed as `--rams-detail-page-header-*` custom properties in the delivered motion foundation stylesheet. Override purposeful roles in application CSS. The original frame geometry, local custom properties, motion, focus and intrinsic-size relations are preserved. Native print/supports/keyframe constructs remain in the CSS processing pipeline.

Context-dependent PageHeader expressions are declared on their actual consumer classes (`rams-page-header-*`), not the document root. In the canonical source, edit `componentExtensions.details.scopedRoles.families.page-header`; the shared scoped-role renderer emits viewer and portable CSS. Keep these stable classes when adapting the TSX, especially on the portalled menu. They preserve local header/scroller padding, Radix sizing, menu offsets and local paint. Static declaration roles remain root-customizable.
