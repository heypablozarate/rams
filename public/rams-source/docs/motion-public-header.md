# Public glass header

`PublicHeader` is document-fixed navigation with a four-rem bar. Provide `currentPath`, `navItems` (`href`, `label`), `wordmark` content, and accessible `copy` labels. Links retain native href navigation. The original Folio21 example intercepts its own links to select local print references; no source website is contacted.

Leave four rem above the page content. Below the desktop breakpoint, the disclosure button opens scrollable mobile navigation. Escape returns focus to the toggle; local link selection and a transition to desktop retire the mobile links. Closing after an unrelated focus change does not reclaim focus. This disclosure is not a modal dialog.

The header activates `GlassHeaderLayer` after eight pixels of window scroll or over the mobile menu. Apply `.dark` to the theme ancestor to switch the tint, reflection, edge, backdrop filter and navigation foreground together. The shared shader uses a subtler reflection in dark mode.

To reuse the layer independently, import `GlassHeaderLayer` from `public-header-glass-header-layer`, use a positioned `rams-public-glass-scope` wrapper, and pass `active` / `hairline`. Its CSS fallback is used when WebGL is unavailable or a fallback config is supplied. Reduced motion stops continuous shader animation and draws a static state. Do not replace the material with an unrelated blur declaration.

The header inherits the consumer's font family. The catalog gives this document-fixed header its own viewport.
