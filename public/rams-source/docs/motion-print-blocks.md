# Print worksheet figures

`motion-stats-band` displays supplied facts in `divided` or `plain` layout. The original sample data is a fictional Córdoba booklet worksheet: 240 copies, four imposed sheets each (960 sheets), and the 0.215 mm median of ten stated sample offsets. The six-value trend and equal-width histogram correspond to those same samples. These are illustrative planning figures, not a live service or a print tolerance.

Keep values, units, supporting detail and context distinct. Keyboard focus or hover reveals the context in its reserved row without replacing the supporting detail. Preserve that context and the whole number/unit at narrow widths and enlarged text. Supplied `stats` can also use the component's uptime/map visual APIs; those optional kinds are not demonstrated by this worksheet.

`motion-animated-counter` formats the selected sample edition count with a copies suffix. Its example adds bounded local 24-copy adjustments (maximum 120) and resets to the selected baseline. The numeral stays together; the unit may wrap at its full size. Screen readers receive the final complete formatted value, while visual digit wheels follow updates. Reduced motion settles directly to the current value. These controls do not record print jobs or make production claims.

## Editorial opening

`motion-hero-section` uses a content-height `minimal` layout by default. Supply `title`, `description`, `meta`, and actions with a real destination or callback. `media` accepts your own visual. Explicit `centered` and `split` layouts and the exported print-study helpers remain available. The original Folio21 example reveals a sheet-plan diagram and note locally; it does not place a print order. Button labels wrap and increase the control's height.

## Proof questions

`motion-faq-section` takes stable question IDs, plain-text answers and optional categories. Use `accordion` for disclosure, `columns` for category-led reading, or `search` to match questions and answers. `multiple` permits several answers open at once; open IDs, category and query can also be controlled. `contact` is optional and defaults to none. Search highlighting retains the original characters; clearing an empty result returns focus to the search field.

## Print journal

`motion-blog-grid` takes posts with stable IDs, ISO dates, excerpts, category and author data. Images are optional; the original records are text-only. Supply body paragraphs for the local reader, or `getHref` for native article links. The featured article is separate from the paginated remainder. Category changes reset the page; returning from the reader preserves the list's category/page and focuses its article link. Long copy and author names reflow without depending on the host page's typography CSS.

## Specification comparison

`motion-comparison-table` takes columns and sections whose value records use the same column IDs. Values can be text, included/not included, or partial with a note. A highlighted column identifies the reference; otherwise the first column is used. Narrow layouts compare that reference with a selected alternative. **Only differences compares the currently visible columns**: switch alternatives to inspect a different pair. When enlarged text leaves insufficient space for two value measures, each value stacks with its own visible column label. The semantic headers remain available. Provide a CTA callback or destination for an actual result; no trial or order is fabricated by the default example.


Feature and plan comparison now share one configurable renderer. See [Comparison](comparison.md) for generic data, controlled or uncontrolled selection, responsive policies and compatible legacy exports.
