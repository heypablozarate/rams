# Component composition

Choose a family by its task, then compare variants by their actual behavior. The preview, usage example and API describe the selected variant; different variants can have different props.

The catalog consumes the owned primitives in `src/primitives`. Adapted ARC components consume those primitives where appropriate and retain their MIT attribution. Original examples use local print and editorial scenarios; their state does not imply an external service.

Use the source package's `rams.json` and `tools/install.mjs` for installation. The package contains neutral styles, Geist fonts with OFL notices and independent source modules. Preserve all license notices.

Import `./rams/styles.css` once. Select the required items from the manifest and read their source before composing them. The installer reports exact dependencies and stops at differing destination files; resolve those conflicts explicitly.

Keep one primary action per active view, accessible names and visible focus. Let text and controls reflow at the user's text size. Preserve reduced motion, controlled values and caller-owned validation. Verify actual actions and recovery in the resulting application; documentation and a successful compile do not certify every behavior or device.
